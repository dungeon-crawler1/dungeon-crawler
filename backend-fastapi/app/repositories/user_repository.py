# Acceso a datos de Usuarios en Python (SQL=0: Uso exclusivo de $1, $2)
from app.config.db import get_db_pool

async def find_user_by_email(email: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow('SELECT id, email, password_hash, created_at FROM usuarios WHERE email = $1', email)
        return dict(row) if row else None

async def create_user(email: str, password_hash: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            email, password_hash
        )
        return dict(row)

async def find_user_by_id(user_id: int):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow('SELECT id, email, created_at FROM usuarios WHERE id = $1', user_id)
        return dict(row) if row else None