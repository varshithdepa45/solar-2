"""
tests/test_savings.py
──────────────────────
Integration tests for the Savings Prediction endpoint.
"""

import pytest


VALID_PAYLOAD = {
    "panel_capacity_kw": 5.0,
    "annual_solar_kwh": 7000.0,
    "electricity_rate_per_kwh": 0.12,
    "export_rate_per_kwh": 0.05,
    "annual_consumption_kwh": 10000.0,
    "self_consumption_ratio": 0.7,
    "installation_cost": 8000.0,
    "annual_tariff_increase_pct": 3.0,
    "panel_degradation_pct": 0.5,
    "system_lifetime_years": 25,
}


@pytest.mark.asyncio
async def test_savings_predict_success(client):
    response = await client.post("/api/v1/savings/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    result = data["data"]
    assert result["annual_savings_currency"] > 0
    assert result["payback_period_years"] > 0
    assert len(result["monthly_breakdown"]) == 12
    assert len(result["yearly_savings"]) == 25


@pytest.mark.asyncio
async def test_savings_quick_estimate(client):
    response = await client.get(
        "/api/v1/savings/quick",
        params={
            "panel_capacity_kw": 5.0,
            "electricity_rate_per_kwh": 0.12,
            "annual_consumption_kwh": 10000.0,
            "installation_cost": 8000.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["estimated_annual_savings"] > 0


@pytest.mark.asyncio
async def test_savings_invalid_self_consumption(client):
    payload = {**VALID_PAYLOAD, "self_consumption_ratio": 1.5}  # > 1.0
    response = await client.post("/api/v1/savings/predict", json=payload)
    assert response.status_code == 422
