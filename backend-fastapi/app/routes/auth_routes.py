# Rutas HTTP de autenticación
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from app.services import auth_service
from app.utils.formatters import success_response

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class AuthSchema(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(payload: AuthSchema):
    user = await auth_service.register_user(payload.email, payload.password)
    return success_response(user, "Usuario registrado con éxito")

@router.post("/login")
async def login(payload: AuthSchema):
    data = await auth_service.login_user(payload.email, payload.password)
    return success_response(data, "Login exitoso")