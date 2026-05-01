"""
app/schemas/savings.py
───────────────────────
Pydantic schemas for the Savings Prediction API.
"""

from pydantic import Field, field_validator

from app.schemas.common import BaseSchema


# ── Request ────────────────────────────────────────────────────────────────────

class SavingsPredictionRequest(BaseSchema):
    """
    Input required to predict energy cost savings from a solar installation.
    """

    # System
    panel_capacity_kw: float = Field(..., gt=0.0, description="System size in kW")
    annual_solar_kwh: float = Field(
        ..., gt=0.0, description="Estimated annual solar generation in kWh"
    )

    # Tariff / billing
    electricity_rate_per_kwh: float = Field(
        ..., gt=0.0, description="Current electricity tariff (local currency / kWh)"
    )
    export_rate_per_kwh: float = Field(
        default=0.0, ge=0.0, description="Feed-in / export tariff (0 if no net metering)"
    )

    # Consumption profile
    annual_consumption_kwh: float = Field(
        ..., gt=0.0, description="Household / business annual electricity consumption (kWh)"
    )
    self_consumption_ratio: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Fraction of solar generation consumed on-site (0–1)",
    )

    # Economic factors
    installation_cost: float = Field(
        ..., gt=0.0, description="Total installation cost (local currency)"
    )
    annual_tariff_increase_pct: float = Field(
        default=3.0, ge=0.0, le=30.0, description="Expected annual electricity price rise (%)"
    )
    panel_degradation_pct: float = Field(
        default=0.5, ge=0.0, le=5.0, description="Annual panel output degradation (%)"
    )
    system_lifetime_years: int = Field(
        default=25, ge=5, le=50, description="Expected system lifetime in years"
    )

    @field_validator("self_consumption_ratio")
    @classmethod
    def validate_self_consumption(cls, v: float) -> float:
        if not 0 <= v <= 1:
            raise ValueError("self_consumption_ratio must be between 0 and 1")
        return round(v, 4)


# ── Response ───────────────────────────────────────────────────────────────────

class MonthlySavings(BaseSchema):
    month: int = Field(..., ge=1, le=12)
    month_name: str
    solar_kwh: float
    savings_currency: float
    grid_import_kwh: float


class SavingsPredictionResponse(BaseSchema):
    """
    Full savings breakdown returned to the client.
    """

    # Summary
    annual_savings_currency: float = Field(..., description="Year-1 savings in local currency")
    lifetime_savings_currency: float = Field(
        ..., description="Cumulative savings over system lifetime"
    )
    payback_period_years: float = Field(..., description="Simple payback period in years")
    roi_pct: float = Field(..., description="Return on investment over system lifetime (%)")
    net_present_value: float = Field(..., description="NPV at 6% discount rate")

    # Yearly trajectory (Year 1 → N)
    yearly_savings: list[dict] = Field(
        ..., description="Per-year savings projection list"
    )

    # Monthly breakdown (Year 1)
    monthly_breakdown: list[MonthlySavings] = Field(
        ..., description="Month-by-month savings for year 1"
    )

    # Carbon
    co2_offset_tonnes_per_year: float = Field(
        ..., description="Estimated CO₂ offset in tonnes/year"
    )

    model_version: str = Field(default="savings_v1")
