"""
app/schemas/solar_forecast.py
──────────────────────────────
Pydantic schemas for the Solar Forecasting API.

Input features match what the Random Forest model was trained on.
Adjust field names to match your actual feature set.
"""

from pydantic import Field, field_validator

from app.schemas.common import BaseSchema


# ── Request ────────────────────────────────────────────────────────────────────

class SolarForecastRequest(BaseSchema):
    """
    Input features for the Random Forest solar generation forecast.
    All numeric values are validated at the Pydantic layer.
    """

    # Location
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Location latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Location longitude")

    # Date / time
    month: int = Field(..., ge=1, le=12, description="Month of year (1–12)")
    day_of_year: int = Field(..., ge=1, le=366, description="Day of year (1–366)")
    hour: int = Field(..., ge=0, le=23, description="Hour of day (0–23)")

    # Weather conditions
    temperature_celsius: float = Field(
        ..., ge=-50.0, le=60.0, description="Ambient temperature in °C"
    )
    cloud_cover_pct: float = Field(
        ..., ge=0.0, le=100.0, description="Cloud cover percentage (0–100)"
    )
    humidity_pct: float = Field(
        ..., ge=0.0, le=100.0, description="Relative humidity percentage (0–100)"
    )
    wind_speed_ms: float = Field(
        ..., ge=0.0, le=100.0, description="Wind speed in m/s"
    )
    ghi: float = Field(
        ..., ge=0.0, description="Global Horizontal Irradiance (W/m²)"
    )

    # System specifications
    panel_capacity_kw: float = Field(
        ..., gt=0.0, description="Installed panel capacity in kW"
    )
    panel_efficiency_pct: float = Field(
        ..., ge=1.0, le=100.0, description="Panel efficiency percentage"
    )
    panel_tilt_degrees: float = Field(
        default=30.0, ge=0.0, le=90.0, description="Panel tilt angle in degrees"
    )
    panel_azimuth_degrees: float = Field(
        default=180.0, ge=0.0, le=360.0, description="Panel azimuth angle in degrees"
    )

    @field_validator("ghi")
    @classmethod
    def ghi_reasonable(cls, v: float) -> float:
        if v > 1500:
            raise ValueError("GHI above 1500 W/m² is physically implausible")
        return v


# ── Response ───────────────────────────────────────────────────────────────────

class HourlyForecast(BaseSchema):
    hour: int
    predicted_kwh: float
    confidence_lower: float
    confidence_upper: float


class SolarForecastResponse(BaseSchema):
    """
    Output of the solar forecast endpoint.
    """

    predicted_kwh: float = Field(..., description="Predicted energy output in kWh")
    confidence_interval_lower: float = Field(..., description="95% CI lower bound (kWh)")
    confidence_interval_upper: float = Field(..., description="95% CI upper bound (kWh)")
    irradiance_efficiency_factor: float = Field(
        ..., description="Ratio of actual vs theoretical irradiance (0–1)"
    )
    model_version: str = Field(default="rf_v1", description="Model identifier")
    notes: str | None = Field(default=None, description="Any advisory notes")
