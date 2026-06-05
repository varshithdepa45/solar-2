"""
app/core/database.py
─────────────────────
Async SQLAlchemy engine and session management.

Stack:
  - SQLAlchemy 2.x async API (asyncpg driver)
  - Per-request session via FastAPI dependency injection

Usage:
    # In a route or service
    async def my_endpoint(db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(MyModel))
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ── Engine ─────────────────────────────────────────────────────────────────────
_engine_kwargs = {"echo": settings.DATABASE_ECHO, "pool_pre_ping": True}
if "sqlite" not in str(settings.DATABASE_URL):
    _engine_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
    _engine_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW
    _engine_kwargs["pool_recycle"] = 1800

engine = create_async_engine(str(settings.DATABASE_URL), **_engine_kwargs)

# ── Session factory ────────────────────────────────────────────────────────────
AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # avoid lazy-load errors after commit
    autoflush=False,
    autocommit=False,
)


# ── Declarative base ───────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """
    All SQLAlchemy ORM models inherit from this class.
    Enables async Alembic migrations and metadata introspection.
    """
    pass


# ── FastAPI dependency ─────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield a per-request database session.
    The session is automatically committed on success and rolled back on error.
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Startup / shutdown helpers ─────────────────────────────────────────────────
async def init_db() -> None:
    """
    Create all tables (dev / test use).
    In production use Alembic migrations instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialised")


async def close_db() -> None:
    """Dispose the connection pool on shutdown."""
    await engine.dispose()
    logger.info("Database connection pool disposed")
