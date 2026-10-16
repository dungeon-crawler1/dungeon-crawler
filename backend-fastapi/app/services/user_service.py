from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.utils.formatters import format_user_dict

class UserService:
    """Capa de Lógica de Negocio: Reglas del dominio de usuarios."""

    @staticmethod
    def register_user(connection, username: str, email: str, password: str):
        cursor = connection.cursor()
        
        if UserRepository.find_by_username_or_email(cursor, username, email):
            cursor.close()
            return False, "El nombre de usuario o el correo electrónico ya se encuentran registrados."

        password_hash = AuthService.hash_password(password)
        new_user = UserRepository.create_user(cursor, username, email, password_hash)
        
        connection.commit()
        cursor.close()
        return True, format_user_dict(new_user)

    @staticmethod
    def authenticate_user(connection, email: str, password: str):
        cursor = connection.cursor()
        user = UserRepository.find_by_email(cursor, email)
        cursor.close()

        if not user or not AuthService.verify_password(password, user[3]):
            return False, "Credenciales inválidas (correo o contraseña incorrectos).", None, None

        token = AuthService.generate_jwt_token(user[0], user[1], user[2])
        user_data = format_user_dict((user[0], user[1], user[2], user[4]))
        return True, "Inicio de sesión exitoso.", token, user_data

    @staticmethod
    def get_user_profile(connection, user_id: int):
        cursor = connection.cursor()
        user = UserRepository.find_by_id(cursor, user_id)
        cursor.close()

        if not user:
            return False, "Usuario no encontrado."
        return True, format_user_dict(user)