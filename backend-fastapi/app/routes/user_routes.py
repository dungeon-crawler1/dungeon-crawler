from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from app.config.db import get_db_connection
from app.dependencies.auth_middleware import verify_jwt
from app.services.user_service import UserService
from app.utils.formatters import build_json_response

router = APIRouter()

@router.get("/profile")
def get_profile(request: Request, db=Depends(get_db_connection)):
    auth_result = verify_jwt(request)
    if isinstance(auth_result, JSONResponse):
        return auth_result

    success, result = UserService.get_user_profile(db, auth_result.get("id"))
    if not success:
        return build_json_response(404, "error", result)

    return build_json_response(200, "success", data=result)