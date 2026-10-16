import os
import datetime
import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Capa de Lógica de Negocio: Encriptado de clave y firma de JWT (cumple SEC = 0)."""

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def generate_jwt_token(user_id: int, username: str, email: str) -> str:
        payload = {
            "id": user_id,
            "username": username,
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        secret_key = os.environ.get("JWT_SECRET")
        return jwt.encode(payload, secret_key, algorithm="HS256")

    @staticmethod
    def decode_jwt_token(token: str):
        secret_key = os.environ.get("JWT_SECRET")
        return jwt.decode(token, secret_key, algorithms=["HS256"])