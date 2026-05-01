"""
app/utils/file_utils.py
────────────────────────
Reusable file-handling utilities for upload validation and processing.
"""

import io
import uuid
from pathlib import Path
from typing import Tuple

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.core.exceptions import FileUploadException
from app.core.logging import get_logger

logger = get_logger(__name__)

# ── Ensure upload directory exists at module load time ────────────────────────
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def validate_and_read_image(file: UploadFile) -> Tuple[Image.Image, bytes]:
    """
    Validate an uploaded image file and return:
      - A PIL Image object
      - Raw bytes

    Raises ``FileUploadException`` on any validation failure.
    """
    # Check content-type header
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise FileUploadException(
            f"Unsupported image type '{file.content_type}'. "
            f"Allowed: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )

    # Read bytes
    raw_bytes = await file.read()

    # Check file size
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(raw_bytes) > max_bytes:
        raise FileUploadException(
            f"File too large ({len(raw_bytes) / (1024*1024):.1f} MB). "
            f"Maximum allowed: {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    # Decode image
    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.verify()  # verify image integrity
        # Re-open after verify() (verify() is destructive)
        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise FileUploadException("Uploaded file is not a valid image.")
    except Exception as exc:
        raise FileUploadException(f"Image decoding failed: {exc}")

    logger.debug(
        "Image validated",
        extra={
            "image_filename": file.filename,
            "size_bytes": len(raw_bytes),
            "dimensions": f"{image.width}x{image.height}",
        },
    )
    return image, raw_bytes


def save_upload(raw_bytes: bytes, original_filename: str | None) -> Path:
    """
    Save raw bytes to the upload directory with a UUID-prefixed filename.
    Returns the absolute path of the saved file.
    """
    extension = Path(original_filename or "upload.jpg").suffix.lower()
    safe_name = f"{uuid.uuid4().hex}{extension}"
    dest = settings.UPLOAD_DIR / safe_name
    dest.write_bytes(raw_bytes)
    logger.debug("File saved", extra={"path": str(dest)})
    return dest


def delete_file(path: Path) -> None:
    """Safely delete a file; silently ignores missing files."""
    try:
        path.unlink(missing_ok=True)
    except Exception as exc:
        logger.warning("Could not delete file", extra={"path": str(path), "error": str(exc)})
