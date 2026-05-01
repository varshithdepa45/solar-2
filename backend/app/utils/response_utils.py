"""
app/utils/response_utils.py
─────────────────────────────
Helpers to produce consistent API response envelopes.
"""

from typing import Any

from app.schemas.common import SuccessResponse


def ok(message: str, data: Any = None) -> SuccessResponse:
    """Wrap a payload in the standard success envelope."""
    return SuccessResponse(message=message, data=data)
