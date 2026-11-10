# Generador procedural de habitaciones equivalente en Python
import random

def generate_rooms(habitaciones_superadas: int):
    tipos = ['COMBATE_NORMAL', 'MERCADER', 'FUENTE_DESEOS', 'ESTATUA_SAGRADA', 'SALA_TESORO']
    return [
        {"id": 1, "tipo": random.choice(tipos), "descripcion": "Puerta Izquierda"},
        {"id": 2, "tipo": "COMBATE_NORMAL", "descripcion": "Puerta Derecha"}
    ]