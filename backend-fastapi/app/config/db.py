import os
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

# Creamos un pool de conexiones reutilizables para optimizar peticiones
try:
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        1, 20,
        user=os.getenv("DB_USER", "roguelike_user"),
        password=os.getenv("DB_PASSWORD", "roguelike_password_secutity"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "roguelike_db")
    )
    if connection_pool:
        print("✅ Conexión establecida exitosamente con el Pool de PostgreSQL en FastAPI")
except Exception as e:
    print("❌ Error al conectar a la base de datos:", e)

def get_db_connection():
    """Obtiene una conexión del pool y la devuelve."""
    try:
        conn = connection_pool.getconn()
        yield conn
    finally:
        connection_pool.putconn(conn)