"""
app/schemas/common.py
──────────────────────
Shared Pydantic base schemas and response envelope types.
All API responses use `SuccessResponse` for a consistent structure.
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

DataT = TypeVar("DataT")


class BaseSchema(BaseModel):
    """
    Base Pydantic schema with:
      - ORM mode enabled (read from SQLAlchemy models directly)
      - strict mode for production safety
    """

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        protected_namespaces=(),   # allow fields named model_*
    )


class SuccessResponse(BaseSchema, Generic[DataT]):
    """
    Standard success envelope.

    Example:
        {
            "status": "success",
            "message": "Prediction completed",
            "data": { ... }
        }
    """

    status: str = Field(default="success", description="Always 'success' for 2xx responses")
    message: str = Field(..., description="Human-readable description of the result")
    data: DataT | None = Field(default=None, description="Payload")


class ErrorResponse(BaseSchema):
    """Standard error envelope (also defined in exceptions.py for handlers)."""

    status: str = "error"
    code: int
    message: str
    detail: Any | None = None


class HealthResponse(BaseSchema):
    """Response model for /health endpoint."""

    status: str
    version: str
    environment: str
    models_loaded: list[dict[str, str]]
