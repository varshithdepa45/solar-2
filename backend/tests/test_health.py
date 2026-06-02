"""
tests/test_health.py
─────────────────────
Integration tests for the health check endpoints.
"""

import pytest


@pytest.mark.asyncio
async def test_liveness(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "environment" in data


@pytest.mark.asyncio
async def test_root(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs" in data


@pytest.mark.asyncio
async def test_model_status(client):
    response = await client.get("/api/v1/health/models")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)
