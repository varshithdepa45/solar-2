"""
app/core/logging.py
────────────────────
Configures the application-wide logging subsystem.

Features:
  - JSON-structured logs in production (easy ingestion by Loki / CloudWatch / etc.)
  - Human-readable coloured output in development
  - Log file with daily rotation
  - Correlation-ID support (set via middleware)
"""

import json
import logging
import logging.handlers
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import settings


# ── JSON formatter ─────────────────────────────────────────────────────────────

class JsonFormatter(logging.Formatter):
    """Formats log records as single-line JSON strings."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Attach exception info when present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Attach any extra fields passed via `extra={}`
        for key, value in record.__dict__.items():
            if key not in (
                "args", "asctime", "created", "exc_info", "exc_text",
                "filename", "funcName", "id", "levelname", "levelno",
                "lineno", "module", "msecs", "message", "msg", "name",
                "pathname", "process", "processName", "relativeCreated",
                "stack_info", "thread", "threadName",
            ):
                log_entry[key] = value

        return json.dumps(log_entry, default=str)


# ── Setup function ─────────────────────────────────────────────────────────────

def setup_logging() -> None:
    """
    Call once at application startup (inside the lifespan context manager).
    Configures root logger and the 'solar_api' named logger.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Ensure log directory exists
    log_path: Path = settings.LOG_FILE
    log_path.parent.mkdir(parents=True, exist_ok=True)

    handlers: list[logging.Handler] = []

    # ── Console handler ────────────────────────────────────────────────────────
    console_handler = logging.StreamHandler(sys.stdout)
    if settings.LOG_FORMAT == "json":
        console_handler.setFormatter(JsonFormatter())
    else:
        fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        console_handler.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%d %H:%M:%S"))
    handlers.append(console_handler)

    # ── Rotating file handler ──────────────────────────────────────────────────
    file_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path,
        when="midnight",
        backupCount=14,          # keep 14 days of logs
        encoding="utf-8",
    )
    file_handler.setFormatter(JsonFormatter())
    handlers.append(file_handler)

    # ── Apply to root logger ───────────────────────────────────────────────────
    logging.basicConfig(level=log_level, handlers=handlers)

    # Suppress noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DATABASE_ECHO else logging.WARNING
    )

    logger = logging.getLogger("solar_api")
    logger.info(
        "Logging initialised",
        extra={
            "level": settings.LOG_LEVEL,
            "format": settings.LOG_FORMAT,
            "environment": settings.ENVIRONMENT,
        },
    )


def get_logger(name: str) -> logging.Logger:
    """
    Convenience factory – returns a child of the 'solar_api' named logger.

    Usage:
        logger = get_logger(__name__)
    """
    return logging.getLogger(f"solar_api.{name}")
