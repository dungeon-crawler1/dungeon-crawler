import os
import logging
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

# Configuración del logger oficial (cumple DBG = 0)
logger = logging.getLogger("fastapi_app")
logging.basicConfig(level=logging.INFO)

try:
    connection_pool = psycopg2.pool.SimpleConnectionPool(
        1, 20,
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        host=os.environ.get("DB_HOST"),
        port=os.environ.get("DB_PORT"),
        database=os.environ.get("DB_NAME")
    )
    logger.info("Pool de conexiones PostgreSQL iniciado en FastAPI.")
except Exception as err:
    logger.error("Error al iniciar conexión a base de datos: %s", err)

def get_db_connection():
    """Generador para inyección de dependencias."""
    connection = connection_pool.getconn()
    try:
        yield connection
    finally:
        connection_pool.putconn(connection)