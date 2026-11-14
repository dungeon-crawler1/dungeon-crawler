# Lógica de Autenticación en FastAPI
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException
from app.config.auth import get_jwt_secret
from app.repositories import user_repository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def register_user(email: str, password: str):
    existing = await user_repository.find_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    hashed = pwd_context.hash(password)
    return await user_repository.create_user(email, hashed)

async def login_user(email: str, password: str):
    user = await user_repository.find_user_by_email(email)
    if not user or not pwd_context.verify(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = jwt.encode({"id": user["id"], "email": user["email"]}, get_jwt_secret(), algorithm="HS256")
    return {"token": token, "user": {"id": user["id"], "email": user["email"]}}