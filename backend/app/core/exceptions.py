"""
app/core/exceptions.py
───────────────────────
Custom exception classes and global exception handlers.

All HTTP error responses follow a consistent JSON envelope:
{
    "status": "error",
    "code": <int>,
    "message": "<human-readable>",
    "detail": <optional extra info>
}
"""

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger(__name__)


def _json_safe(value: Any) -> Any:
    """Convert arbitrary objects into a JSON-serializable structure."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_json_safe(v) for v in value]
    try:
        return jsonable_encoder(value)
    except Exception:
        return str(value)


# ── Domain-specific exceptions ─────────────────────────────────────────────────

class SolarAPIException(Exception):
    """Base exception for all Solar API errors."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: Any = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)


class ModelNotLoadedException(SolarAPIException):
    """Raised when an ML model has not been loaded yet."""

    def __init__(self, model_name: str) -> None:
        super().__init__(
            message=f"ML model '{model_name}' is not loaded. Check model file path.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"model": model_name},
        )


class InvalidInputException(SolarAPIException):
    """Raised when incoming data fails domain-level validation."""

    def __init__(self, message: str, detail: Any = None) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )


class FileUploadException(SolarAPIException):
    """Raised when a file upload fails validation or processing."""

    def __init__(self, message: str) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class PredictionException(SolarAPIException):
    """Raised when an ML inference step fails."""

    def __init__(self, model_name: str, reason: str) -> None:
        super().__init__(
            message=f"Prediction failed for model '{model_name}': {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"model": model_name, "reason": reason},
        )


# ── Error response helper ──────────────────────────────────────────────────────

def _error_response(status_code: int, message: str, detail: Any = None) -> JSONResponse:
    content: dict[str, Any] = {
        "status": "error",
        "code": status_code,
        "message": message,
    }
    if detail is not None:
        content["detail"] = _json_safe(detail)
    return JSONResponse(status_code=status_code, content=content)


# ── Handler registration ───────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """Attach all global exception handlers to the FastAPI application."""

    @app.exception_handler(SolarAPIException)
    async def solar_api_exception_handler(
        request: Request, exc: SolarAPIException
    ) -> JSONResponse:
        logger.warning(
            "SolarAPIException raised",
            extra={
                "path": request.url.path,
                "status_code": exc.status_code,
                "error_message": exc.message,
            },
        )
        return _error_response(exc.status_code, exc.message, exc.detail)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        logger.warning(
            "HTTP exception",
            extra={"path": request.url.path, "status_code": exc.status_code},
        )
        return _error_response(exc.status_code, str(exc.detail))

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = _json_safe(exc.errors())
        logger.warning(
            "Request validation failed",
            extra={"path": request.url.path, "errors": errors},
        )
        return _error_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Request validation failed",
            detail=errors,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception(
            "Unhandled exception",
            extra={"path": request.url.path},
            exc_info=exc,
        )
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "An unexpected internal error occurred. Please try again later.",
        )
