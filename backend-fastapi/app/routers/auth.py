import os
import jwt
import datetime
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from passlib.context import CryptContext
from app.config.db import get_db_connection

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modelos para recibir JSON
class RegisterModel(BaseModel):
    username: str = None
    email: str = None
    password: str = None

class LoginModel(BaseModel):
    email: str = None
    password: str = None

@router.post("/register")
def register(user_data: RegisterModel, db=Depends(get_db_connection)):
    if not user_data.username or not user_data.email or not user_data.password:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Todos los campos son obligatorios: username, email y password."}
        )
    
    if len(user_data.password) < 6:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "La contraseña debe tener al menos 6 caracteres."}
        )

    cursor = db.cursor()
    # Comprobar si existe
    cursor.execute("SELECT id FROM usuarios WHERE username = %s OR email = %s", (user_data.username, user_data.email))
    if cursor.fetchone():
        cursor.close()
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "El nombre de usuario o el correo electrónico ya se encuentran registrados."}
        )

    # Hashear contraseña (compatible con Express bcrypt)
    password_hash = pwd_context.hash(user_data.password)

    # Insertar usuario
    cursor.execute("""
        INSERT INTO usuarios (username, email, password_hash)
        VALUES (%s, %s, %s)
        RETURNING id, username, email, fecha_registro
    """, (user_data.username, user_data.email, password_hash))
    
    new_user = cursor.fetchone()
    db.commit()
    cursor.close()

    # Formatear la respuesta
    user_dict = {
        "id": new_user[0],
        "username": new_user[1],
        "email": new_user[2],
        "fecha_registro": new_user[3].isoformat() if new_user[3] else None
    }

    return JSONResponse(
        status_code=201,
        content={"status": "success", "message": "Usuario registrado exitosamente.", "data": user_dict}
    )


@router.post("/login")
def login(login_data: LoginModel, db=Depends(get_db_connection)):
    if not login_data.email or not login_data.password:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Se requiere email y password para iniciar sesión."}
        )

    cursor = db.cursor()
    cursor.execute("SELECT id, username, email, password_hash, fecha_registro FROM usuarios WHERE email = %s", (login_data.email,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return JSONResponse(
            status_code=401,
            content={"status": "error", "message": "Credenciales inválidas (correo o contraseña incorrectos)."}
        )

    # Verificar hash
    if not pwd_context.verify(login_data.password, user[3]):
        return JSONResponse(
            status_code=401,
            content={"status": "error", "message": "Credenciales inválidas (correo o contraseña incorrectos)."}
        )

    # Generar JWT idéntico a Express
    payload = {
        "id": user[0],
        "username": user[1],
        "email": user[2],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    secret = os.getenv("JWT_SECRET", "super_secret_jwt_key_roguelike_2026")
    token = jwt.encode(payload, secret, algorithm="HS256")

    user_dict = {
        "id": user[0],
        "username": user[1],
        "email": user[2],
        "fecha_registro": user[4].isoformat() if user[4] else None
    }

    return JSONResponse(
        status_code=200,
        content={"status": "success", "message": "Inicio de sesión exitoso.", "token": token, "user": user_dict}
    )