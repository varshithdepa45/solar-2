"""
app/models/prediction_log.py
─────────────────────────────
ORM model for logging every ML prediction request/response.
Useful for auditing, retraining data collection and analytics.
"""

from sqlalchemy import Float, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class PredictionLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Persists every prediction call with inputs/outputs for audit and retraining.
    """

    __tablename__ = "prediction_logs"

    # Which model / endpoint was called
    endpoint: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    model_key: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=True)

    # Serialised inputs and outputs (JSON strings)
    input_data: Mapped[str] = mapped_column(Text, nullable=False)
    output_data: Mapped[str] = mapped_column(Text, nullable=False)

    # Execution metadata
    latency_ms: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="success")  # success | error
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Request tracing
    correlation_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    client_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)

    __table_args__ = (
        Index("ix_prediction_logs_endpoint_created", "endpoint", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<PredictionLog id={self.id} endpoint={self.endpoint}>"


class RoofDetectionLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Persists roof detection requests — stores image metadata, not binary data.
    """

    __tablename__ = "roof_detection_logs"

    image_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    image_size_bytes: Mapped[int] = mapped_column(Integer, nullable=True)
    image_width_px: Mapped[int] = mapped_column(Integer, nullable=True)
    image_height_px: Mapped[int] = mapped_column(Integer, nullable=True)

    segments_detected: Mapped[int] = mapped_column(Integer, default=0)
    total_usable_area_m2: Mapped[float] = mapped_column(Float, nullable=True)
    estimated_capacity_kw: Mapped[float] = mapped_column(Float, nullable=True)
    suitability: Mapped[str | None] = mapped_column(String(20), nullable=True)

    processing_time_ms: Mapped[float] = mapped_column(Float, nullable=True)
    correlation_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    def __repr__(self) -> str:
        return f"<RoofDetectionLog id={self.id} file={self.image_filename}>"
