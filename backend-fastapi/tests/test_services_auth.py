"""Tests de los servicios de autenticación y usuario."""
import pytest
from fastapi import HTTPException
from app.services import auth_service, user_service


async def test_register_user_guarda_hash(fake_db):
    user = await auth_service.register_user("nuevo@example.com", "clave123")
    assert user["email"] == "nuevo@example.com"
    assert "password" not in user


async def test_register_user_duplicado_falla(fake_db):
    await auth_service.register_user("dup@example.com", "clave123")
    with pytest.raises(HTTPException) as exc:
        await auth_service.register_user("dup@example.com", "otra")
    assert exc.value.status_code == 400


async def test_login_user_devuelve_token(fake_db):
    await auth_service.register_user("login@example.com", "clave123")
    data = await auth_service.login_user("login@example.com", "clave123")
    assert data["token"]
    assert data["user"]["email"] == "login@example.com"


async def test_login_user_con_clave_incorrecta_falla(fake_db):
    await auth_service.register_user("login2@example.com", "clave123")
    with pytest.raises(HTTPException) as exc:
        await auth_service.login_user("login2@example.com", "mala")
    assert exc.value.status_code == 401


async def test_login_user_inexistente_falla(fake_db):
    with pytest.raises(HTTPException) as exc:
        await auth_service.login_user("fantasma@example.com", "clave123")
    assert exc.value.status_code == 401


async def test_get_user_profile(fake_db):
    created = await auth_service.register_user("perfil@example.com", "clave123")
    profile = await user_service.get_user_profile(created["id"])
    assert profile["email"] == "perfil@example.com"


async def test_get_user_profile_inexistente_falla(fake_db):
    with pytest.raises(HTTPException) as exc:
        await user_service.get_user_profile(404)
    assert exc.value.status_code == 404
