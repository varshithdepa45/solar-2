"""
app/core/rate_limit.py
───────────────────────
Rate limiting configuration using slowapi (Starlette-compatible).

Strategy:
  - Global default: 120 requests / minute per IP
  - ML endpoints: 30 requests / minute (heavy CPU cost)
  - File uploads: 10 requests / minute (disk + CPU cost)
  - Health checks: unlimited (excluded from limiting)

In production, swap the in-memory backend for a Redis-backed one:
    from slowapi.util import get_remote_address
    from limits.storage import RedisStorage
    limiter = Limiter(key_func=get_remote_address, storage_uri=REDIS_URL)
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings

# ── Limiter singleton ──────────────────────────────────────────────────────────
# key_func: use the client's real IP (respects X-Forwarded-For behind proxies)
limiter = Limiter(
    key_func=get_remote_address,
    # In-memory by default; set storage_uri for Redis in production:
    # storage_uri=settings.REDIS_URL,
    default_limits=["120/minute"],
    headers_enabled=False,      # SlowAPIMiddleware adds X-RateLimit-* at middleware layer
)

# ── Preset limit strings ───────────────────────────────────────────────────────
# Import these in route modules and pass to the @limiter.limit() decorator.
LIMIT_DEFAULT: str = "120/minute"
LIMIT_ML_INFERENCE: str = "30/minute"       # CPU-intensive ML endpoints
LIMIT_FILE_UPLOAD: str = "10/minute"        # disk + CPU intensive
LIMIT_HEALTH: str = "300/minute"            # health probes — generous
