"""
app/schemas/roof_detection.py
──────────────────────────────
Pydantic schemas for the Roof Detection API.
"""

from enum import Enum

from pydantic import Field

from app.schemas.common import BaseSchema


# ── Enums ──────────────────────────────────────────────────────────────────────

class RoofOrientation(str, Enum):
    NORTH = "north"
    NORTH_EAST = "north_east"
    EAST = "east"
    SOUTH_EAST = "south_east"
    SOUTH = "south"
    SOUTH_WEST = "south_west"
    WEST = "west"
    NORTH_WEST = "north_west"
    FLAT = "flat"
    UNKNOWN = "unknown"


class ShadingLevel(str, Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class InstallationSuitability(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNSUITABLE = "unsuitable"


# ── Detection result (per detected roof segment) ───────────────────────────────

class DetectedRoofSegment(BaseSchema):
    """
    Represents one roof segment identified by the YOLO model.
    A complex roof may have multiple segments.
    """

    segment_id: int
    confidence: float = Field(..., ge=0.0, le=1.0, description="YOLO detection confidence")
    area_m2: float = Field(..., ge=0.0, description="Estimated roof area in m²")
    usable_area_m2: float = Field(
        ..., ge=0.0, description="Usable area after obstructions (chimneys, vents)"
    )
    orientation: RoofOrientation
    tilt_degrees: float = Field(..., ge=0.0, le=90.0)
    shading_level: ShadingLevel
    bounding_box: dict = Field(
        ..., description="YOLO bounding box: {x1, y1, x2, y2, width, height}"
    )


# ── Response ───────────────────────────────────────────────────────────────────

class RoofDetectionResponse(BaseSchema):
    """
    Full result returned from the roof detection endpoint.
    """

    # Detection meta
    image_filename: str
    image_width_px: int
    image_height_px: int
    processing_time_ms: float

    # Detected segments
    total_segments_detected: int
    segments: list[DetectedRoofSegment]

    # Aggregated values
    total_roof_area_m2: float
    total_usable_area_m2: float
    dominant_orientation: RoofOrientation
    overall_shading: ShadingLevel
    suitability: InstallationSuitability

    # Solar capacity estimate
    estimated_panel_count: int = Field(
        ..., description="Estimated number of standard (400 W) panels that can fit"
    )
    estimated_system_capacity_kw: float = Field(
        ..., description="Estimated installable system capacity in kW"
    )
    estimated_annual_generation_kwh: float = Field(
        ..., description="Rough annual generation estimate (kWh)"
    )

    # Advisory
    recommendations: list[str] = Field(
        ..., description="List of advisory recommendation strings"
    )
    model_version: str = Field(default="yolov8_v1")
