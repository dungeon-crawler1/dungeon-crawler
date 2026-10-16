import os
import datetime
import jwt
import bcrypt

class AuthService:
    """Capa de Lógica de Negocio: Encriptado de clave y firma de JWT (cumple SEC = 0)."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Genera el hash seguro recortando la contraseña a 72 bytes máximos (límite de bcrypt)."""
        # Se convierte a bytes y se trunca a los primeros 72 bytes para evitar el ValueError
        password_bytes = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt(10)
        return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica la contraseña ingresada contra el hash almacenado en la BD."""
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    @staticmethod
    def generate_jwt_token(user_id: int, username: str, email: str) -> str:
        """Genera un token JWT firmado compatible con el servicio de Express."""
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
        """Decodifica y valida un token JWT."""
        secret_key = os.environ.get("JWT_SECRET")
        return jwt.decode(token, secret_key, algorithms=["HS256"])