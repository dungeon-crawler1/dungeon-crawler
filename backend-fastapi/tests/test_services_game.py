"""Tests del servicio del motor de juego."""
import pytest
from fastapi import HTTPException
from app.services import game_engine_service


@pytest.mark.parametrize(
    "clase, vida, ataque",
    [("CABALLERO", 100, 15), ("BARBARO", 120, 20), ("MAGO", 70, 25)],
)
async def test_start_run_asigna_estadisticas(fake_db, clase, vida, ataque):
    run = await game_engine_service.start_run(1, clase)
    assert run["vida_maxima"] == vida
    assert run["ataque"] == ataque


async def test_start_run_clase_desconocida_usa_caballero(fake_db):
    run = await game_engine_service.start_run(1, "INVENTADA")
    assert run["vida_maxima"] == 100


async def test_play_turn_actualiza_puntuacion(fake_db):
    run = await game_engine_service.start_run(1, "MAGO")
    updated = await game_engine_service.play_turn(run["id"], 1, "ATACAR")
    assert updated["puntuacion"] == 10
    assert updated["vida_actual"] == 90


async def test_get_leaderboard_global(fake_db):
    await game_engine_service.start_run(1, "MAGO")
    assert len(await game_engine_service.get_leaderboard()) == 1


async def test_get_user_leaderboard(fake_db):
    await game_engine_service.start_run(1, "MAGO")
    await game_engine_service.start_run(2, "PICARO")
    rows = await game_engine_service.get_user_leaderboard(2)
    assert all(row["usuario_id"] == 2 for row in rows)


async def test_get_run_timeline_devuelve_la_partida(fake_db):
    run = await game_engine_service.start_run(1, "MAGO")
    timeline = await game_engine_service.get_run_timeline(run["id"], 1)
    assert timeline["clase"] == "MAGO"


async def test_get_run_timeline_ajena_falla(fake_db):
    run = await game_engine_service.start_run(1, "MAGO")
    with pytest.raises(HTTPException) as exc:
        await game_engine_service.get_run_timeline(run["id"], 2)
    assert exc.value.status_code == 404
