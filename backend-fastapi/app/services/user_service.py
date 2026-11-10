# Servicio de perfil de usuario FastAPI
from fastapi import HTTPException
from app.repositories import user_repository

async def get_user_profile(user_id: int):
    user = await user_repository.find_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user