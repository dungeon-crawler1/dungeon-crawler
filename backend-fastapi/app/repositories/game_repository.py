# Acceso a datos de Partidas en Python (SQL=0: Parametrización estricta con asyncpg)
import json
from app.config.db import get_db_pool

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