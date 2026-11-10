# Rutas HTTP de perfil de usuario
from fastapi import APIRouter, Depends
from app.dependencies.auth_middleware import get_current_user
from app.services import user_service
from app.utils.formatters import success_response

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = await user_service.get_user_profile(current_user["id"])
    return success_response(user)