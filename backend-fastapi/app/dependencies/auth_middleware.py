import jwt
from fastapi import Request
from app.services.auth_service import AuthService
from app.utils.formatters import build_json_response

def verify_jwt(request: Request):
    """Middleware de verificación de tokens JWT para rutas protegidas."""
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return build_json_response(
            401, "error", 
            "Acceso denegado: No se proporcionó un token de autenticación (Bearer token requerido)."
        )

    token = auth_header.split(" ")[1]
    try:
        payload = AuthService.decode_jwt_token(token)
        request.state.user = payload
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return build_json_response(
            401, "error", 
            "Acceso denegado: El token proporcionado es inválido o ha expirado."
        )