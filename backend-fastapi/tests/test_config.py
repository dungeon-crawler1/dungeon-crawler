"""Tests de la configuración del pool de conexiones."""
import pytest
from app.config import db
from app.config.auth import get_jwt_secret


def test_get_jwt_secret_lee_la_variable(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "clave-de-prueba")
    assert get_jwt_secret() == "clave-de-prueba"


def test_get_jwt_secret_exige_la_variable(monkeypatch):
    monkeypatch.delenv("JWT_SECRET", raising=False)
    with pytest.raises(RuntimeError):
        get_jwt_secret()


class FakeAsyncPool:
    def __init__(self, **kwargs):
        self.kwargs = kwargs


async def test_init_db_crea_el_pool(monkeypatch):
    async def fake_create_pool(**kwargs):
        return FakeAsyncPool(**kwargs)

    monkeypatch.setattr(db.asyncpg, "create_pool", fake_create_pool)
    await db.init_db()
    assert db.pool.kwargs["user"] == "test"
    assert db.pool.kwargs["database"] == "test"


async def test_init_db_usa_valores_por_defecto(monkeypatch):
    captured = {}

    async def fake_create_pool(**kwargs):
        captured.update(kwargs)
        return FakeAsyncPool()

    monkeypatch.setattr(db.asyncpg, "create_pool", fake_create_pool)
    monkeypatch.delenv("DB_HOST", raising=False)
    await db.init_db()
    assert captured["host"] == "database"
    assert captured["port"] == 5432


async def test_get_db_pool_retorna_el_pool_global():
    db.pool = FakeAsyncPool()
    assert await db.get_db_pool() is db.pool
