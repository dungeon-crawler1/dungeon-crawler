# Configuración del pool de conexiones asíncronas con asyncpg para FastAPI
import os
import asyncpg

# Variable global para almacenar el pool de conexiones
pool = None

# Inicialización asíncrona del pool al arrancar el servidor
async def init_db():
    global pool
    pool = await asyncpg.create_pool(
        host=os.getenv("DB_HOST", "database"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER", "roguelike_user"),
        password=os.getenv("DB_PASSWORD", "roguelike_pass"),
        database=os.getenv("DB_NAME", "roguelike_db")
    )

# Función proveedora para obtener la instancia activa del pool
async def get_db_pool():
    return pool