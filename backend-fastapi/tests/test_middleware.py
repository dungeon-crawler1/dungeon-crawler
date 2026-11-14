"""Tests del middleware de autenticación JWT."""
import jwt
import pytest
from fastapi import HTTPException
from app.dependencies import auth_middleware


def _token(payload, secret=None):
    return jwt.encode(payload, secret or auth_middleware.get_jwt_secret(), algorithm="HS256")


async def test_get_current_user_con_token_valido():
    token = _token({"id": 7, "email": "hero@example.com"})
    user = await auth_middleware.get_current_user(f"Bearer {token}")
    assert user["id"] == 7


async def test_get_current_user_rechaza_formato_invalido():
    with pytest.raises(HTTPException) as exc:
        await auth_middleware.get_current_user("Token abc")
    assert exc.value.status_code == 401


async def test_get_current_user_rechaza_token_invalido():
    with pytest.raises(HTTPException) as exc:
        await auth_middleware.get_current_user("Bearer no-es-un-jwt")
    assert exc.value.status_code == 401


async def test_get_current_user_rechaza_firma_ajena():
    token = _token({"id": 1}, secret="otra-clave")
    with pytest.raises(HTTPException) as exc:
        await auth_middleware.get_current_user(f"Bearer {token}")
    assert exc.value.detail == "Token inválido o expirado"
