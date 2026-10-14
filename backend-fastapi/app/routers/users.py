from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from app.config.db import get_db_connection
from app.dependencies.auth import verify_jwt

router = APIRouter()

@router.get("/profile")
def get_profile(request: Request, db=Depends(get_db_connection)):
    # Ejecutamos la validación manualmente para poder devolver un JSONResponse en caso de error
    user_payload = verify_jwt(request)
    if isinstance(user_payload, JSONResponse):
        return user_payload # Retorna el 401 si falló

    user_id = user_payload.get("id")

    cursor = db.cursor()
    cursor.execute("SELECT id, username, email, fecha_registro FROM usuarios WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return JSONResponse(
            status_code=404,
            content={"status": "error", "message": "Usuario no encontrado."}
        )

    user_dict = {
        "id": user[0],
        "username": user[1],
        "email": user[2],
        "fecha_registro": user[3].isoformat() if user[3] else None
    }

    return JSONResponse(
        status_code=200,
        content={"status": "success", "data": user_dict}
    )