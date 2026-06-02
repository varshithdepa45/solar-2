"""
app/api/v1/solar_forecast.py
─────────────────────────────
Solar Forecasting API routes — with DI, rate limiting, and validation.

Endpoints:
  POST /api/v1/solar/forecast      – predict energy output (rate: 30/min)
  GET  /api/v1/solar/forecast/info – model metadata
"""

from fastapi import APIRouter, Request, Response, status

from app.core.dependencies import ApiKey, ForecastSvc
from app.core.rate_limit import LIMIT_DEFAULT, LIMIT_ML_INFERENCE, limiter
from app.ml.model_registry import ModelRegistry
from app.schemas.common import SuccessResponse
from app.schemas.solar_forecast import SolarForecastRequest, SolarForecastResponse
from app.utils.response_utils import ok

router = APIRouter(
    prefix="/solar",
    tags=["Solar Forecasting"],
)


@router.post(
    "/forecast",
    response_model=SuccessResponse[SolarForecastResponse],
    status_code=status.HTTP_200_OK,
    summary="Predict Solar Energy Output",
    description=(
        "Run the trained Random Forest model to predict hourly solar energy generation "
        "(kWh) based on location, weather conditions, and panel specifications. "
        "Returns predicted output with 95% confidence bounds. "
        "**Rate limit: 30 requests/minute per IP.**"
    ),
    response_description="Solar generation prediction with confidence interval",
)
@limiter.limit(LIMIT_ML_INFERENCE)
async def predict_solar_output(
    request: Request,
    body: SolarForecastRequest,
    api_key: ApiKey,
    service: ForecastSvc,
) -> SuccessResponse[SolarForecastResponse]:
    """
    **Input:** Panel specs + weather conditions + location.

    **Output:** kWh prediction, 95% CI, irradiance efficiency factor, advisory notes.

    **Rate limit:** 30 requests / minute per IP (ML inference is CPU-intensive).
    """
    result = await service.predict(body)
    return ok(message="Solar forecast generated successfully", data=result)


@router.get(
    "/forecast/info",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Model Information",
    description="Returns metadata about the loaded solar forecast model.",
)
@limiter.limit(LIMIT_DEFAULT)
async def forecast_model_info(request: Request, api_key: ApiKey) -> SuccessResponse[dict]:
    """Returns current model registry status for the solar forecast model."""
    is_loaded = ModelRegistry.is_loaded("solar_forecast")
    model = ModelRegistry._store.get("solar_forecast")

    # This model was trained with 6 features.
    trained_features = [
        "AMBIENT_TEMPERATURE",
        "MODULE_TEMPERATURE",
        "IRRADIATION",
        "hour",
        "day",
        "month",
    ]

    # Prefer feature names stored on the estimator, when available.
    if model is not None and hasattr(model, "feature_names_in_"):
        try:
            trained_features = [str(x) for x in list(getattr(model, "feature_names_in_"))]
        except Exception:
            pass

    info = {
        "model_key": "solar_forecast",
        "is_loaded": is_loaded,
        "model_type": type(model).__name__ if model else "stub",
        "is_stub": model is None,
        "feature_count": len(trained_features),
        "features": trained_features,
        "note": (
            "This endpoint reports the trained model features. "
            "The /solar/forecast request schema may accept additional inputs, "
            "but only these features are used by the current trained model."
        ),
        "rate_limit": LIMIT_ML_INFERENCE,
    }
    return ok(message="Model information retrieved", data=info)
