# =============================================================================
# RUTAS HTTP DEL MOTOR DE JUEGO Y LEADERBOARD (FASTAPI)
# Paridad 1:1 de endpoints y estructura JSON con Express
# =============================================================================
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies.auth_middleware import get_current_user
from app.services import game_engine_service
from app.utils.formatters import success_response

router = APIRouter(prefix="/api/game", tags=["Game"])

class StartRunSchema(BaseModel):
    clase: str

class TurnSchema(BaseModel):
    accion: str

# Endpoint para iniciar partida
@router.post("/start")
async def start_run(payload: StartRunSchema, current_user: dict = Depends(get_current_user)):
    run = await game_engine_service.start_run(current_user["id"], payload.clase)
    return success_response(run, "Partida iniciada")

# Endpoint para ejecutar un turno
@router.post("/run/{run_id}/turn")
async def play_turn(run_id: int, payload: TurnSchema, current_user: dict = Depends(get_current_user)):
    run = await game_engine_service.play_turn(run_id, current_user["id"], payload.accion)
    return success_response(run, "Turno procesado")

# Endpoint público para Leaderboard Global (Issue 08)
@router.get("/leaderboard")
async def get_leaderboard():
    leaderboard = await game_engine_service.get_leaderboard()
    return success_response(leaderboard)

# Endpoint protegido para Leaderboard Personal del Usuario (Issue 08)
@router.get("/leaderboard/user")
async def get_user_leaderboard(current_user: dict = Depends(get_current_user)):
    user_leaderboard = await game_engine_service.get_user_leaderboard(current_user["id"])
    return success_response(user_leaderboard)

# Endpoint protegido para Línea de Tiempo de una Partida (Issue 08)
@router.get("/run/{run_id}/timeline")
async def get_run_timeline(run_id: int, current_user: dict = Depends(get_current_user)):
    timeline = await game_engine_service.get_run_timeline(run_id, current_user["id"])
    return success_response(timeline)