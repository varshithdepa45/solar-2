"""
app/services/savings_service.py
────────────────────────────────
Business logic for solar energy savings prediction.

Two modes:
  1. ML model mode  – passes features through the trained savings model
  2. Financial model mode – used as fallback / enrichment when ML model is a stub

The financial model is deterministic and well-understood, so it doubles as
the ground-truth validator for the ML model's output.
"""

import asyncio
import calendar
import math
from typing import Any

from app.core.exceptions import PredictionException
from app.core.logging import get_logger
from app.ml.model_registry import ModelRegistry
from app.schemas.savings import (
    MonthlySavings,
    SavingsPredictionRequest,
    SavingsPredictionResponse,
)

logger = get_logger(__name__)

# Average grid CO₂ emission factor (kg CO₂ / kWh) — IPCC global average
_CO2_KG_PER_KWH = 0.475

# Discount rate for NPV calculation
_DISCOUNT_RATE = 0.06

# Standard solar irradiance distribution by month (fraction of annual total)
_MONTHLY_IRRADIANCE_WEIGHTS = [
    0.055, 0.060, 0.080, 0.090, 0.100, 0.105,
    0.105, 0.100, 0.085, 0.075, 0.060, 0.085,
]


def _monthly_solar_distribution(annual_kwh: float) -> list[float]:
    """
    Distribute annual solar generation across months using irradiance weights.
    """
    total_weight = sum(_MONTHLY_IRRADIANCE_WEIGHTS)
    return [annual_kwh * (w / total_weight) for w in _MONTHLY_IRRADIANCE_WEIGHTS]


def _compute_financial_savings(req: SavingsPredictionRequest) -> dict:
    """
    Pure financial calculation (no ML model).
    Returns a dict with all fields needed for SavingsPredictionResponse.
    """
    # ── Year 1 monthly breakdown ───────────────────────────────────────────────
    monthly_solar = _monthly_solar_distribution(req.annual_solar_kwh)
    monthly_breakdown: list[MonthlySavings] = []

    year1_savings = 0.0
    for i, (solar_kwh, weight) in enumerate(zip(monthly_solar, _MONTHLY_IRRADIANCE_WEIGHTS)):
        on_site_kwh = solar_kwh * req.self_consumption_ratio
        exported_kwh = solar_kwh * (1 - req.self_consumption_ratio)

        # Savings = avoided import cost + export revenue
        savings = (
            on_site_kwh * req.electricity_rate_per_kwh
            + exported_kwh * req.export_rate_per_kwh
        )
        grid_import = max(
            0.0,
            (req.annual_consumption_kwh / 12) - on_site_kwh,
        )
        year1_savings += savings

        monthly_breakdown.append(
            MonthlySavings(
                month=i + 1,
                month_name=calendar.month_name[i + 1],
                solar_kwh=round(solar_kwh, 2),
                savings_currency=round(savings, 2),
                grid_import_kwh=round(grid_import, 2),
            )
        )

    # ── Multi-year projection ──────────────────────────────────────────────────
    yearly_savings: list[dict] = []
    cumulative = 0.0
    npv = 0.0
    payback_year: float | None = None

    for year in range(1, req.system_lifetime_years + 1):
        # Tariff increases each year; panel degrades each year
        tariff_factor = (1 + req.annual_tariff_increase_pct / 100) ** (year - 1)
        degradation_factor = (1 - req.panel_degradation_pct / 100) ** (year - 1)
        year_savings = year1_savings * tariff_factor * degradation_factor

        cumulative += year_savings
        npv += year_savings / ((1 + _DISCOUNT_RATE) ** year)

        yearly_savings.append(
            {
                "year": year,
                "savings_currency": round(year_savings, 2),
                "cumulative_savings": round(cumulative, 2),
                "panel_output_factor": round(degradation_factor, 4),
            }
        )

        # Simple payback: when cumulative savings > installation cost
        if payback_year is None and cumulative >= req.installation_cost:
            payback_year = year - 1 + (req.installation_cost - (cumulative - year_savings)) / year_savings

    payback = payback_year if payback_year is not None else float("inf")
    lifetime_savings = cumulative
    roi = ((lifetime_savings - req.installation_cost) / req.installation_cost) * 100
    co2 = (req.annual_solar_kwh * req.self_consumption_ratio * _CO2_KG_PER_KWH) / 1000  # tonnes

    return {
        "annual_savings_currency": round(year1_savings, 2),
        "lifetime_savings_currency": round(lifetime_savings, 2),
        "payback_period_years": round(payback, 2),
        "roi_pct": round(roi, 2),
        "net_present_value": round(npv - req.installation_cost, 2),
        "yearly_savings": yearly_savings,
        "monthly_breakdown": monthly_breakdown,
        "co2_offset_tonnes_per_year": round(co2, 4),
    }


def _run_ml_inference(model: Any, req: SavingsPredictionRequest) -> float | None:
    """
    Run ML model inference for annual savings prediction.
    Expected features: ['monthly_bill', 'monthly_energy_usage', 'predicted_solar_generation', 'electricity_rate', 'roof_area', 'sunlight_hours']
    Returns predicted annual savings or None if model is stub.
    """
    if model is None:
        return None

    import numpy as np

    monthly_energy_usage = req.annual_consumption_kwh / 12.0
    monthly_bill = monthly_energy_usage * req.electricity_rate_per_kwh
    roof_area = req.panel_capacity_kw * 5.5  # Approx 5.5 m^2 per kW
    sunlight_hours = 5.0  # Approx daily peak sun hours

    X = np.array([[
        monthly_bill,                 # monthly_bill
        monthly_energy_usage,         # monthly_energy_usage
        req.annual_solar_kwh,         # predicted_solar_generation
        req.electricity_rate_per_kwh, # electricity_rate
        roof_area,                    # roof_area
        sunlight_hours,               # sunlight_hours
    ]], dtype=np.float32)

    predicted = model.predict(X)[0]
    return max(0.0, float(predicted))


class SavingsService:
    """
    Savings prediction service.

    If the ML model is available, it predicts the Year-1 annual savings.
    The financial model always runs to produce the full breakdown.
    When the ML model is loaded, its output overrides the financial Year-1 figure.
    """

    async def predict(self, request: SavingsPredictionRequest) -> SavingsPredictionResponse:
        savings_model = ModelRegistry._store.get("savings")
        loop = asyncio.get_event_loop()

        # Always compute the full financial breakdown
        financial = await loop.run_in_executor(None, _compute_financial_savings, request)

        # Optionally override Year-1 savings with ML model prediction
        ml_annual_savings = await loop.run_in_executor(
            None, _run_ml_inference, savings_model, request
        )

        if ml_annual_savings is not None:
            logger.info(
                "ML savings override applied",
                extra={
                    "financial_savings": financial["annual_savings_currency"],
                    "ml_savings": ml_annual_savings,
                },
            )
            financial["annual_savings_currency"] = round(ml_annual_savings, 2)

        logger.info(
            "Savings prediction completed",
            extra={
                "annual_savings": financial["annual_savings_currency"],
                "payback_years": financial["payback_period_years"],
            },
        )

        return SavingsPredictionResponse(
            model_version="savings_v1" if ml_annual_savings is None else "savings_ml_v1",
            **financial,
        )


savings_service = SavingsService()
