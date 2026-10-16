from fastapi.responses import JSONResponse

def build_json_response(status_code: int, status: str, message: str = "", **kwargs):
    """Construye respuestas JSON estandarizadas sin romper si se omite el mensaje (cumple DRY)."""
    payload = {"status": status, "message": message}
    payload.update(kwargs)
    return JSONResponse(status_code=status_code, content=payload)

def format_user_dict(user_row):
    """Convierte la tupla devuelta por SQL en un diccionario sin password."""
    if not user_row:
        return None
    return {
        "id": user_row[0],
        "username": user_row[1],
        "email": user_row[2],
        "fecha_registro": user_row[3].isoformat() if user_row[3] else None
    }