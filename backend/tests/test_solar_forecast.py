"""
tests/test_solar_forecast.py
─────────────────────────────
Integration tests for the Solar Forecast endpoint.
"""

import pytest


VALID_PAYLOAD = {
    "latitude": 28.6,
    "longitude": 77.2,
    "month": 6,
    "day_of_year": 160,
    "hour": 12,
    "temperature_celsius": 35.0,
    "cloud_cover_pct": 20.0,
    "humidity_pct": 50.0,
    "wind_speed_ms": 3.5,
    "ghi": 750.0,
    "panel_capacity_kw": 5.0,
    "panel_efficiency_pct": 20.0,
    "panel_tilt_degrees": 30.0,
    "panel_azimuth_degrees": 180.0,
}


@pytest.mark.asyncio
async def test_solar_forecast_success(client):
    response = await client.post("/api/v1/solar/forecast", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["predicted_kwh"] >= 0


@pytest.mark.asyncio
async def test_solar_forecast_invalid_ghi(client):
    payload = {**VALID_PAYLOAD, "ghi": 9999.0}  # physically implausible
    response = await client.post("/api/v1/solar/forecast", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_solar_forecast_missing_field(client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "latitude"}
    response = await client.post("/api/v1/solar/forecast", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_forecast_model_info(client):
    response = await client.get("/api/v1/solar/forecast/info")
    assert response.status_code == 200
    data = response.json()
    assert "model_key" in data["data"]
