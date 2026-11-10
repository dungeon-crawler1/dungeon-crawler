# Formateador de respuestas estandarizado FastAPI
def success_response(data: dict | list, message: str = "Operación exitosa"):
    return {"status": "success", "message": message, "data": data}