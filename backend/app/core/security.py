"""
app/core/security.py
─────────────────────
API key authentication dependency.
Extend with JWT / OAuth2 as the platform grows.
"""

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_api_key(api_key: str | None = Security(API_KEY_HEADER)) -> str:
    """
    Dependency that validates the X-API-Key header.

    Skip validation in development mode to ease local testing.
    In production the SECRET_KEY env var must match the header value.
    """
    if settings.ENVIRONMENT == "development":
        return "dev-bypass"

    if not api_key or api_key != settings.SECRET_KEY:
        logger.warning("Unauthorised API access attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return api_key
