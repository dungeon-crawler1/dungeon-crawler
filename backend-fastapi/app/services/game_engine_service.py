# =============================================================================
# SERVICIO DE NEGOCIO DEL MOTOR DE JUEGO (FASTAPI)
import json
# =============================================================================
from fastapi import HTTPException
from app.repositories import game_repository
from app.utils.game_utils import generate_rooms

# Mapeo de estadísticas base según la clase seleccionada
CLASES_STATS = {
    "CABALLERO": {"vida": 100, "ataque": 15, "defensa": 10},
    "BARBARO": {"vida": 120, "ataque": 20, "defensa": 5},
    "PICARO": {"vida": 80, "ataque": 18, "defensa": 8},
    "MAGO": {"vida": 70, "ataque": 25, "defensa": 4}
}

# Iniciar una partida asignando vida y atributos base
async def start_run(user_id: int, clase: str):
    stats = CLASES_STATS.get(clase.upper(), CLASES_STATS["CABALLERO"])
    estado_inicial = {
        "habitaciones_superadas": 0,
        "historial_habitaciones": [],
        "opciones_puertas": generate_rooms(0)
    }
    return await game_repository.create_run(
        user_id, clase, stats["vida"], stats["vida"], stats["ataque"], stats["defensa"], estado_inicial
    )

def parse_action(accion):
    """Interpreta el estado que envía el cliente; si no es JSON válido, usa {} ."""
    try:
        data = json.loads(accion) if isinstance(accion, str) else accion
        return data if isinstance(data, dict) else {}
    except (ValueError, TypeError):
        return {}

# Procesar un turno de la partida y persistir el estado y las estadísticas reales
async def play_turn(run_id: int, user_id: int, accion: str):
    data = parse_action(accion)
    puntuacion = data.get("puntuacion", 10)
    estado_actualizado = data.get("estado_run") or {
        "habitaciones_superadas": puntuacion,
        "historial_habitaciones": [],
        "opciones_puertas": generate_rooms(puntuacion)
    }
    return await game_repository.update_run(
        run_id,
        data.get("vida", 90),
        data.get("monedas", 15),
        puntuacion,
        data.get("resultado", "EN_PROGRESO"),
        estado_actualizado
    )

# Obtener el Top 10 global
async def get_leaderboard():
    return await game_repository.get_top_10_global()

# Obtener el Top 10 del usuario actual
async def get_user_leaderboard(user_id: int):
    return await game_repository.get_top_10_user(user_id)

# Recuperar la línea de tiempo de la partida
async def get_run_timeline(run_id: int, user_id: int):
    timeline = await game_repository.get_run_timeline(run_id, user_id)
    if not timeline:
        raise HTTPException(status_code=404, detail="Partida no encontrada o acceso no autorizado")
    return timeline