# Lectura centralizada del secreto JWT: falla rápido si no está configurado.
import os


def get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET no está configurado")
    return secret
