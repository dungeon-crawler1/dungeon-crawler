"""Tests de formateadores y utilidades del motor."""
from app.utils.formatters import success_response
from app.utils.game_utils import generate_rooms


def test_success_response_defaults():
    assert success_response({"id": 1}) == {
        "status": "success",
        "message": "Operación exitosa",
        "data": {"id": 1},
    }


def test_success_response_custom_message():
    response = success_response([1, 2], "Listo")
    assert response["message"] == "Listo"
    assert response["data"] == [1, 2]


def test_generate_rooms_devuelve_dos_puertas():
    rooms = generate_rooms(0)
    assert len(rooms) == 2
    assert {room["id"] for room in rooms} == {1, 2}


def test_generate_rooms_puerta_derecha_es_combate():
    rooms = generate_rooms(3)
    assert rooms[1]["tipo"] == "COMBATE_NORMAL"
    assert rooms[1]["descripcion"] == "Puerta Derecha"


def test_generate_rooms_usa_tipos_del_catalogo():
    tipos = {room["tipo"] for room in generate_rooms(1)}
    validos = {"COMBATE_NORMAL", "MERCADER", "FUENTE_DESEOS", "ESTATUA_SAGRADA", "SALA_TESORO"}
    assert tipos <= validos
