"""
app/api/v1/roof_detection.py
─────────────────────────────
Roof Detection API — with DI, rate limiting, and streaming async upload.

Endpoints:
  POST /api/v1/roof/analyze         – upload image, get roof analysis (rate: 10/min)
  GET  /api/v1/roof/supported-formats – accepted image types
"""

from fastapi import APIRouter, File, Request, Response, UploadFile, status

from app.core.dependencies import ApiKey, RoofSvc
from app.core.rate_limit import LIMIT_FILE_UPLOAD, limiter
from app.schemas.common import SuccessResponse
from app.schemas.roof_detection import RoofDetectionResponse
from app.utils.file_utils import delete_file, save_upload, validate_and_read_image
from app.utils.response_utils import ok
from app.core.config import settings

router = APIRouter(
    prefix="/roof",
    tags=["Roof Detection"],
)


@router.post(
    "/analyze",
    response_model=SuccessResponse[RoofDetectionResponse],
    status_code=status.HTTP_200_OK,
    summary="Analyze Roof for Solar Potential",
    description=(
        "Upload a satellite or aerial image of a rooftop. "
        "The YOLOv8 model detects roof segments, estimates usable area, "
        "determines orientation and shading, and calculates estimated solar "
        "installation capacity and annual generation. "
        "**Rate limit: 10 requests/minute per IP (heavy inference).**"
    ),
)
@limiter.limit(LIMIT_FILE_UPLOAD)
async def analyze_roof(
    request: Request,
    api_key: ApiKey,
    service: RoofSvc,
    file: UploadFile = File(
        ...,
        description="Satellite or aerial rooftop image (JPEG, PNG, or WebP). Max 10 MB.",
    ),
) -> SuccessResponse[RoofDetectionResponse]:
    """
    **Input:** Satellite/aerial rooftop image (JPEG/PNG/WebP, max 10 MB).

    **Output:**
    - Detected roof segments with area, orientation, shading
    - Total usable area in m2
    - Estimated panel count and system capacity (kW)
    - Estimated annual generation (kWh)
    - Installation suitability rating
    - Actionable recommendations

    **Notes:**
    - Image should be a top-down aerial view for best accuracy
    - Higher resolution = more accurate results
    - YOLO model runs in thread pool — does not block event loop
    """
    # 1. Validate and decode image (async read, then CPU validation in executor)
    image, raw_bytes = await validate_and_read_image(file)

    # 2. Persist image temporarily for YOLO (requires file path)
    temp_path = save_upload(raw_bytes, file.filename)

    try:
        # 3. Run detection pipeline
        result = await service.analyze(
            image=image,
            filename=file.filename or "unknown.jpg",
            temp_image_path=temp_path,
        )
    finally:
        # 4. Always clean up the temp file
        delete_file(temp_path)

    return ok(message="Roof analysis completed successfully", data=result)


@router.get(
    "/supported-formats",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Supported Image Formats",
    description="Returns the list of accepted image MIME types and size limits.",
)
async def get_supported_formats() -> SuccessResponse[dict]:
    return ok(
        message="Supported image formats",
        data={
            "accepted_mime_types": settings.ALLOWED_IMAGE_TYPES,
            "max_file_size_mb": settings.MAX_UPLOAD_SIZE_MB,
            "recommended_resolution": "At least 512x512 pixels for best accuracy",
            "preferred_image_type": "Aerial / satellite top-down view",
        },
    )
