from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.config.db import get_db_connection
from app.services.user_service import UserService
from app.utils.formatters import build_json_response

router = APIRouter()

class RegisterDTO(BaseModel):
    username: str = None
    email: str = None
    password: str = None

class LoginDTO(BaseModel):
    email: str = None
    password: str = None

@router.post("/register")
def register(data: RegisterDTO, db=Depends(get_db_connection)):
    if not data.username or not data.email or not data.password:
        return build_json_response(400, "error", "Todos los campos son obligatorios: username, email y password.")
    
    if len(data.password) < 6:
        return build_json_response(400, "error", "La contraseña debe tener al menos 6 caracteres.")

    success, result = UserService.register_user(db, data.username, data.email, data.password)
    if not success:
        return build_json_response(400, "error", result)

    return build_json_response(201, "success", "Usuario registrado exitosamente.", data=result)

@router.post("/login")
def login(data: LoginDTO, db=Depends(get_db_connection)):
    if not data.email or not data.password:
        return build_json_response(400, "error", "Se requiere email y password para iniciar sesión.")

    success, msg, token, user = UserService.authenticate_user(db, data.email, data.password)
    if not success:
        return build_json_response(401, "error", msg)

    return build_json_response(200, "success", msg, token=token, user=user)