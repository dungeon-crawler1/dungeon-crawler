# Rutas HTTP del Motor de Juego
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

@router.post("/start")
async def start_run(payload: StartRunSchema, current_user: dict = Depends(get_current_user)):
    run = await game_engine_service.start_run(current_user["id"], payload.clase)
    return success_response(run, "Partida iniciada")

@router.post("/run/{run_id}/turn")
async def play_turn(run_id: int, payload: TurnSchema, current_user: dict = Depends(get_current_user)):
    run = await game_engine_service.play_turn(run_id, current_user["id"], payload.accion)
    return success_response(run, "Turno procesado")

@router.get("/leaderboard")
async def get_leaderboard():
    leaderboard = await game_engine_service.get_leaderboard()
    return success_response(leaderboard)