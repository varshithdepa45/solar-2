"""
app/services/roof_detection_service.py
───────────────────────────────────────
Business logic for YOLOv8-based roof detection from uploaded aerial/satellite images.

Pipeline:
  1. Validate and decode uploaded image
  2. Run YOLO inference in thread pool executor
  3. Post-process detections → area estimation, orientation, shading
  4. Package into structured RoofDetectionResponse
"""

import asyncio
import time
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

from app.core.exceptions import FileUploadException, PredictionException
from app.core.logging import get_logger
from app.ml.model_registry import ModelRegistry
from app.schemas.roof_detection import (
    DetectedRoofSegment,
    InstallationSuitability,
    RoofDetectionResponse,
    RoofOrientation,
    ShadingLevel,
)

logger = get_logger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────

# Standard residential solar panel dimensions (m)
_PANEL_WIDTH_M = 1.0
_PANEL_HEIGHT_M = 1.7
_PANEL_AREA_M2 = _PANEL_WIDTH_M * _PANEL_HEIGHT_M  # 1.7 m²
_PANEL_WATT_PEAK = 400  # W per panel

# Ground sampling distance — metres per pixel (satellite image assumption)
# Adjust based on your actual image source / zoom level
_METERS_PER_PIXEL = 0.1

# YOLO confidence threshold
_CONF_THRESHOLD = 0.35

# Typical solar generation: kWh per kWp per year (mid-latitude)
_KWH_PER_KWP_PER_YEAR = 1150.0


# ── Helper functions ───────────────────────────────────────────────────────────

def _bbox_to_area_m2(x1: float, y1: float, x2: float, y2: float) -> float:
    """Convert pixel bounding box to approximate area in m²."""
    width_px = abs(x2 - x1)
    height_px = abs(y2 - y1)
    return (width_px * _METERS_PER_PIXEL) * (height_px * _METERS_PER_PIXEL)


def _classify_shading(confidence: float, area_m2: float) -> ShadingLevel:
    """
    Heuristic shading classification.
    In a real system this would use shadow mask analysis.
    """
    if confidence > 0.85:
        return ShadingLevel.NONE
    elif confidence > 0.70:
        return ShadingLevel.LOW
    elif confidence > 0.50:
        return ShadingLevel.MODERATE
    else:
        return ShadingLevel.HIGH


def _classify_orientation(x1: float, y1: float, x2: float, y2: float) -> RoofOrientation:
    """
    Estimate roof orientation from bounding box aspect ratio.
    In a real system this would use roof ridge detection or metadata.
    """
    width = abs(x2 - x1)
    height = abs(y2 - y1)
    ratio = width / height if height > 0 else 1.0

    if ratio > 2.0:
        return RoofOrientation.EAST
    elif ratio < 0.5:
        return RoofOrientation.SOUTH
    else:
        return RoofOrientation.SOUTH_EAST


def _classify_suitability(
    usable_area_m2: float,
    dominant_orientation: RoofOrientation,
    overall_shading: ShadingLevel,
) -> InstallationSuitability:
    """Map roof characteristics to an installation suitability rating."""
    if usable_area_m2 < 5:
        return InstallationSuitability.UNSUITABLE
    if overall_shading == ShadingLevel.HIGH:
        return InstallationSuitability.POOR
    if dominant_orientation in (RoofOrientation.SOUTH, RoofOrientation.SOUTH_EAST):
        if usable_area_m2 >= 30:
            return InstallationSuitability.EXCELLENT
        return InstallationSuitability.GOOD
    if overall_shading == ShadingLevel.MODERATE:
        return InstallationSuitability.FAIR
    return InstallationSuitability.GOOD


def _build_recommendations(
    segments: list[DetectedRoofSegment],
    suitability: InstallationSuitability,
) -> list[str]:
    recommendations: list[str] = []

    if suitability == InstallationSuitability.EXCELLENT:
        recommendations.append(
            "Excellent roof suitability — maximise system size for optimal ROI."
        )
    elif suitability == InstallationSuitability.GOOD:
        recommendations.append(
            "Good installation candidate — consider string inverter layout."
        )
    elif suitability in (InstallationSuitability.FAIR, InstallationSuitability.POOR):
        recommendations.append(
            "Micro-inverters or power optimisers recommended to mitigate shading losses."
        )
    else:
        recommendations.append(
            "Roof area may be insufficient — consider ground-mount installation."
        )

    if any(s.shading_level in (ShadingLevel.MODERATE, ShadingLevel.HIGH) for s in segments):
        recommendations.append(
            "Shading detected on one or more segments — trim nearby vegetation."
        )

    if len(segments) > 1:
        recommendations.append(
            f"{len(segments)} roof segments detected — "
            "multi-string configuration or micro-inverter system advised."
        )

    return recommendations


# ── YOLO inference (synchronous — run in executor) ─────────────────────────────

def _run_yolo_inference(
    yolo_model: Any,
    image_path: Path,
    image_width: int,
    image_height: int,
) -> list[DetectedRoofSegment]:
    """
    Run YOLOv8 inference and convert raw results to DetectedRoofSegment list.
    When the model is a stub, returns a synthetic detection for demonstration.
    """
    if yolo_model is None:
        # ── Stub response for development without model file ────────────────
        logger.warning("YOLO model is stub — returning synthetic detection")
        return [
            DetectedRoofSegment(
                segment_id=0,
                confidence=0.88,
                area_m2=48.0,
                usable_area_m2=38.0,
                orientation=RoofOrientation.SOUTH,
                tilt_degrees=30.0,
                shading_level=ShadingLevel.LOW,
                bounding_box={
                    "x1": image_width * 0.1, "y1": image_height * 0.1,
                    "x2": image_width * 0.9, "y2": image_height * 0.9,
                    "width": image_width * 0.8, "height": image_height * 0.8,
                },
            )
        ]

    # ── Real YOLO inference ────────────────────────────────────────────────────
    results = yolo_model(str(image_path), conf=_CONF_THRESHOLD, verbose=False)
    segments: list[DetectedRoofSegment] = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = [float(c) for c in box.xyxy[0]]
            conf = float(box.conf[0])
            area = _bbox_to_area_m2(x1, y1, x2, y2)
            # Usable area ≈ 80% of detected area (obstruction margin)
            usable = area * 0.80
            shading = _classify_shading(conf, area)
            orientation = _classify_orientation(x1, y1, x2, y2)

            segments.append(
                DetectedRoofSegment(
                    segment_id=i,
                    confidence=round(conf, 4),
                    area_m2=round(area, 2),
                    usable_area_m2=round(usable, 2),
                    orientation=orientation,
                    tilt_degrees=30.0,  # estimated; use DSM data for precision
                    shading_level=shading,
                    bounding_box={
                        "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                        "width": x2 - x1, "height": y2 - y1,
                    },
                )
            )

    return segments


# ── Service class ──────────────────────────────────────────────────────────────

class RoofDetectionService:
    """
    Roof detection service.

    Accepts a PIL Image object (decoded by the route handler) and an
    original filename, runs YOLO inference, and returns a full analysis.
    """

    async def analyze(
        self,
        image: Image.Image,
        filename: str,
        temp_image_path: Path,
    ) -> RoofDetectionResponse:
        yolo_model = ModelRegistry._store.get("roof_detection")
        start_time = time.perf_counter()

        image_width, image_height = image.size

        loop = asyncio.get_event_loop()

        # Run blocking YOLO inference in thread pool
        segments: list[DetectedRoofSegment] = await loop.run_in_executor(
            None,
            _run_yolo_inference,
            yolo_model,
            temp_image_path,
            image_width,
            image_height,
        )

        if not segments:
            logger.warning("No roof segments detected", extra={"filename": filename})
            # Return a minimal response so the frontend doesn't crash
            segments = []

        # ── Aggregation ────────────────────────────────────────────────────────
        total_area = sum(s.area_m2 for s in segments)
        total_usable = sum(s.usable_area_m2 for s in segments)

        # Dominant orientation: segment with largest usable area
        dominant_orientation = (
            max(segments, key=lambda s: s.usable_area_m2).orientation
            if segments else RoofOrientation.UNKNOWN
        )

        # Overall shading: worst-case segment
        shading_order = [
            ShadingLevel.NONE, ShadingLevel.LOW,
            ShadingLevel.MODERATE, ShadingLevel.HIGH,
        ]
        overall_shading = (
            max(segments, key=lambda s: shading_order.index(s.shading_level)).shading_level
            if segments else ShadingLevel.NONE
        )

        suitability = _classify_suitability(total_usable, dominant_orientation, overall_shading)

        # ── Solar capacity estimate ────────────────────────────────────────────
        panels = int(total_usable / _PANEL_AREA_M2)
        capacity_kw = round((panels * _PANEL_WATT_PEAK) / 1000, 2)
        annual_kwh = round(capacity_kw * _KWH_PER_KWP_PER_YEAR, 0)

        processing_ms = round((time.perf_counter() - start_time) * 1000, 2)

        recommendations = _build_recommendations(segments, suitability)

        logger.info(
            "Roof detection completed",
            extra={
                "filename": filename,
                "segments": len(segments),
                "usable_area_m2": total_usable,
                "capacity_kw": capacity_kw,
                "processing_ms": processing_ms,
            },
        )

        return RoofDetectionResponse(
            image_filename=filename,
            image_width_px=image_width,
            image_height_px=image_height,
            processing_time_ms=processing_ms,
            total_segments_detected=len(segments),
            segments=segments,
            total_roof_area_m2=round(total_area, 2),
            total_usable_area_m2=round(total_usable, 2),
            dominant_orientation=dominant_orientation,
            overall_shading=overall_shading,
            suitability=suitability,
            estimated_panel_count=panels,
            estimated_system_capacity_kw=capacity_kw,
            estimated_annual_generation_kwh=annual_kwh,
            recommendations=recommendations,
        )


roof_detection_service = RoofDetectionService()
