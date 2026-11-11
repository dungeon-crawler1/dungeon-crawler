# =============================================================================
# REPOSITORIO DE PARTIDAS EN FASTAPI (SQL=0: Consultas 100% parametrizadas)
# =============================================================================
import json
from app.config.db import get_db_pool

# Insertar una nueva partida al iniciar la run ($1 al $7)
async def create_run(user_id: int, clase: str, vida_actual: int, vida_maxima: int, ataque: int, defensa: int, estado_run: dict):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            '''INSERT INTO partidas 
               (usuario_id, clase, vida_actual, vida_maxima, ataque, defensa, monedas_actuales, puntuacion, resultado, estado_run) 
               VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 'EN_PROGRESO', $7) 
               RETURNING *''',
            user_id, clase, vida_actual, vida_maxima, ataque, defensa, json.dumps(estado_run)
        )
        return dict(row)

# Actualizar el estado de una partida tras ejecutar un turno ($1 al $6)
async def update_run(run_id: int, vida_actual: int, monedas: int, puntuacion: int, resultado: str, estado_run: dict):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            '''UPDATE partidas 
               SET vida_actual = $1, monedas_actuales = $2, puntuacion = $3, resultado = $4, estado_run = $5, updated_at = CURRENT_TIMESTAMP 
               WHERE id = $6 
               RETURNING *''',
            vida_actual, monedas, puntuacion, resultado, json.dumps(estado_run), run_id
        )
        return dict(row)

# Obtener el Top 10 Global de puntuaciones ordenado descendentemente
async def get_top_10_global():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            '''SELECT p.id, u.email as usuario, p.clase, p.puntuacion, p.resultado, p.created_at 
               FROM partidas p 
               JOIN usuarios u ON p.usuario_id = u.id 
               ORDER BY p.puntuacion DESC 
               LIMIT 10'''
        )
        return [dict(r) for r in rows]

# Obtener el Top 10 de partidas del usuario autenticado ($1 parametrizado)
async def get_top_10_user(user_id: int):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            '''SELECT id, clase, puntuacion, resultado, monedas_actuales, created_at 
               FROM partidas 
               WHERE usuario_id = $1 
               ORDER BY puntuacion DESC 
               LIMIT 10''',
            user_id
        )
        return [dict(r) for r in rows]

# Obtener la línea de tiempo/historial de una partida ($1 y $2 parametrizados)
async def get_run_timeline(run_id: int, user_id: int):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            '''SELECT id, usuario_id, clase, vida_actual, vida_maxima, ataque, defensa, 
                      monedas_actuales, puntuacion, resultado, estado_run, created_at 
               FROM partidas 
               WHERE id = $1 AND usuario_id = $2''',
            run_id, user_id
        )
        if not row:
            return None
        res = dict(row)
        # Parsear cadena JSONB a diccionario si viene en formato texto
        if isinstance(res.get("estado_run"), str):
            res["estado_run"] = json.loads(res["estado_run"])
        return res