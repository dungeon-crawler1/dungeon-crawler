# Motor de juego en FastAPI con Paridad total respecto a Express
from app.repositories import game_repository
from app.utils.game_utils import generate_rooms

CLASES_STATS = {
    "CABALLERO": {"vida": 100, "ataque": 15, "defensa": 10},
    "BARBARO": {"vida": 120, "ataque": 20, "defensa": 5},
    "PICARO": {"vida": 80, "ataque": 18, "defensa": 8},
    "MAGO": {"vida": 70, "ataque": 25, "defensa": 4}
}

async def start_run(user_id: int, clase: str):
    stats = CLASES_STATS.get(clase.upper(), CLASES_STATS["CABALLERO"])
    estado_inicial = {
        "habitaciones_superadas": 0,
        "opciones_puertas": generate_rooms(0)
    }
    return await game_repository.create_run(
        user_id, clase, stats["vida"], stats["vida"], stats["ataque"], stats["defensa"], estado_inicial
    )

async def play_turn(run_id: int, user_id: int, accion: str):
    estado_actualizado = {"habitaciones_superadas": 1, "opciones_puertas": generate_rooms(1)}
    return await game_repository.update_run(run_id, 90, 15, 10, "EN_PROGRESO", estado_actualizado)

async def get_leaderboard():
    return await game_repository.get_top_10_global()