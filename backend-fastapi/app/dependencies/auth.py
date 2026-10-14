import os
import jwt
from fastapi import Request
from fastapi.responses import JSONResponse

def verify_jwt(request: Request):
    auth_header = request.headers.get("Authorization")
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        secret = os.getenv("JWT_SECRET", "super_secret_jwt_key_roguelike_2026")
        
        try:
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            # Inyectamos el usuario en el objeto request (state) para emular a Express
            request.state.user = payload
            return payload
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=401,
                content={
                    "status": "error",
                    "message": "Acceso denegado: El token proporcionado es inválido o ha expirado."
                }
            )
        except jwt.InvalidTokenError:
            return JSONResponse(
                status_code=401,
                content={
                    "status": "error",
                    "message": "Acceso denegado: El token proporcionado es inválido o ha expirado."
                }
            )
    
    # Error si no hay token (Mismo mensaje exacto que Express)
    return JSONResponse(
        status_code=401,
        content={
            "status": "error",
            "message": "Acceso denegado: No se proporcionó un token de autenticación (Bearer token requerido)."
        }
    )