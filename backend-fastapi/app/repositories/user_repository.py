class UserRepository:
    """Capa de Datos: Consultas SQL parametrizadas (cumple SQL = 0)."""

    @staticmethod
    def find_by_username_or_email(cursor, username: str, email: str):
        query = "SELECT id FROM usuarios WHERE username = %s OR email = %s"
        cursor.execute(query, (username, email))
        return cursor.fetchone()

    @staticmethod
    def find_by_email(cursor, email: str):
        query = "SELECT id, username, email, password_hash, fecha_registro FROM usuarios WHERE email = %s"
        cursor.execute(query, (email,))
        return cursor.fetchone()

    @staticmethod
    def find_by_id(cursor, user_id: int):
        query = "SELECT id, username, email, fecha_registro FROM usuarios WHERE id = %s"
        cursor.execute(query, (user_id,))
        return cursor.fetchone()

    @staticmethod
    def create_user(cursor, username: str, email: str, password_hash: str):
        query = """
            INSERT INTO usuarios (username, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id, username, email, fecha_registro
        """
        cursor.execute(query, (username, email, password_hash))
        return cursor.fetchone()