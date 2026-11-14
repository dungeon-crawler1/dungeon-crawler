"""Tests de integración de las rutas HTTP con la base en memoria."""
import jwt


def test_register_y_login(client):
    payload = {"email": "ruta@example.com", "password": "clave123"}
    assert client.post("/api/auth/register", json=payload).json()["status"] == "success"
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    assert response.json()["data"]["user"]["email"] == "ruta@example.com"


def test_register_email_invalido(client):
    response = client.post("/api/auth/register", json={"email": "no-es-email", "password": "x"})
    assert response.status_code == 422


def test_login_incorrecto(client):
    payload = {"email": "ruta2@example.com", "password": "clave123"}
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/login", json={**payload, "password": "mala"})
    assert response.status_code == 401


def test_start_run_requiere_token(client):
    assert client.post("/api/game/start", json={"clase": "MAGO"}).status_code == 422


def test_start_run_y_turno(client, auth_headers):
    started = client.post("/api/game/start", json={"clase": "MAGO"}, headers=auth_headers)
    assert started.status_code == 200
    run_id = started.json()["data"]["id"]
    turn = client.post(f"/api/game/run/{run_id}/turn", json={"accion": "ATACAR"}, headers=auth_headers)
    assert turn.json()["data"]["puntuacion"] == 10


def test_leaderboard_global_es_publico(client, auth_headers):
    client.post("/api/game/start", json={"clase": "PICARO"}, headers=auth_headers)
    response = client.get("/api/game/leaderboard")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 1


def test_leaderboard_personal(client, auth_headers):
    client.post("/api/game/start", json={"clase": "PICARO"}, headers=auth_headers)
    response = client.get("/api/game/leaderboard/user", headers=auth_headers)
    assert response.status_code == 200


def test_timeline_propia(client, auth_headers):
    run_id = client.post("/api/game/start", json={"clase": "MAGO"}, headers=auth_headers).json()["data"]["id"]
    response = client.get(f"/api/game/run/{run_id}/timeline", headers=auth_headers)
    assert response.json()["data"]["clase"] == "MAGO"


def test_timeline_ajena_retorna_404(client, auth_headers):
    run_id = client.post("/api/game/start", json={"clase": "MAGO"}, headers=auth_headers).json()["data"]["id"]
    other = jwt.encode({"id": 99, "email": "otro@example.com"}, "test-secret-key-for-suite-only", algorithm="HS256")
    response = client.get(f"/api/game/run/{run_id}/timeline", headers={"Authorization": f"Bearer {other}"})
    assert response.status_code == 404


def test_profile_propio(client, auth_headers):
    response = client.get("/api/users/profile", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == "hero@example.com"


def test_profile_con_token_invalido(client):
    response = client.get("/api/users/profile", headers={"Authorization": "Bearer roto"})
    assert response.status_code == 401
