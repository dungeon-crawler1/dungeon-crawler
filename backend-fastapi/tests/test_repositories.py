"""Tests de la capa de repositorios contra una base en memoria."""
import json
import pytest
from app.repositories import game_repository, user_repository


async def test_create_user_y_find_user_by_email(fake_db):
    created = await user_repository.create_user("a@example.com", "hash")
    assert created["email"] == "a@example.com"
    found = await user_repository.find_user_by_email("a@example.com")
    assert found["password_hash"] == "hash"


async def test_find_user_by_email_inexistente_retorna_none(fake_db):
    assert await user_repository.find_user_by_email("nadie@example.com") is None


async def test_find_user_by_id(fake_db):
    created = await user_repository.create_user("b@example.com", "hash")
    found = await user_repository.find_user_by_id(created["id"])
    assert found["email"] == "b@example.com"
    assert "password_hash" not in found


async def test_find_user_by_id_inexistente_retorna_none(fake_db):
    assert await user_repository.find_user_by_id(999) is None


async def test_create_run_persiste_el_estado(fake_db):
    run = await game_repository.create_run(1, "MAGO", 80, 80, 70, 5, {"habitaciones_superadas": 0})
    assert run["clase"] == "MAGO"
    assert json.loads(run["estado_run"])["habitaciones_superadas"] == 0


async def test_update_run_actualiza_la_partida(fake_db):
    run = await game_repository.create_run(1, "MAGO", 80, 80, 70, 5, {})
    updated = await game_repository.update_run(run["id"], 60, 15, 30, "EN_PROGRESO", {"ok": True})
    assert updated["vida_actual"] == 60
    assert updated["puntuacion"] == 30


async def test_update_run_inexistente_retorna_none(fake_db):
    assert await game_repository.update_run(42, 10, 0, 0, "EN_PROGRESO", {}) is None


async def test_top_10_global_incluye_email_del_usuario(fake_db):
    fake_db.add_user("top@example.com", "hash")
    await game_repository.create_run(1, "PICARO", 80, 80, 18, 8, {})
    rows = await game_repository.get_top_10_global()
    assert rows[0]["usuario"] == "top@example.com"


async def test_top_10_user_filtra_por_usuario(fake_db):
    await game_repository.create_run(1, "PICARO", 80, 80, 18, 8, {})
    await game_repository.create_run(2, "MAGO", 70, 70, 25, 4, {})
    rows = await game_repository.get_top_10_user(2)
    assert all(row["usuario_id"] == 2 for row in rows)


async def test_get_run_timeline_parsea_jsonb(fake_db):
    run = await game_repository.create_run(1, "MAGO", 80, 80, 70, 5, {"sala": 2})
    timeline = await game_repository.get_run_timeline(run["id"], 1)
    assert timeline["estado_run"] == {"sala": 2}


async def test_get_run_timeline_ajeno_retorna_none(fake_db):
    run = await game_repository.create_run(1, "MAGO", 80, 80, 70, 5, {})
    assert await game_repository.get_run_timeline(run["id"], 2) is None
