"""Configuración común de la suite de tests del backend FastAPI."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-suite-only")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_USER", "test")
os.environ.setdefault("DB_PASSWORD", "test")
os.environ.setdefault("DB_NAME", "test")

import pytest  # noqa: E402
from app import config  # noqa: E402


class FakeDatabase:
    """Base de datos en memoria que imita las consultas usadas por los repositorios."""

    def __init__(self):
        self.users = {}
        self.runs = {}
        self._ids = {"user": 0, "run": 0}

    def next_id(self, kind):
        self._ids[kind] += 1
        return self._ids[kind]

    def add_user(self, email, password_hash):
        user = {
            "id": self.next_id("user"),
            "email": email,
            "password_hash": password_hash,
            "created_at": "2026-01-01T00:00:00",
        }
        self.users[email] = user
        return user

    def add_run(self, **fields):
        run = {
            "id": self.next_id("run"),
            "usuario_id": fields.get("usuario_id", 1),
            "clase": fields.get("clase", "CABALLERO"),
            "vida_actual": fields.get("vida_actual", 100),
            "vida_maxima": fields.get("vida_maxima", 100),
            "ataque": fields.get("ataque", 10),
            "defensa": fields.get("defensa", 5),
            "monedas_actuales": fields.get("monedas_actuales", 0),
            "puntuacion": fields.get("puntuacion", 0),
            "resultado": fields.get("resultado", "EN_PROGRESO"),
            "estado_run": fields.get("estado_run", "{}"),
            "created_at": "2026-01-01T00:00:00",
        }
        self.runs[run["id"]] = run
        return run


class FakeConnection:
    def __init__(self, database):
        self.database = database

    async def fetchrow(self, query, *args):
        sql = " ".join(query.split()).lower()
        if sql.startswith("insert into usuarios"):
            return self.database.add_user(args[0], args[1])
        if "from usuarios where email" in sql:
            return self.database.users.get(args[0])
        if "from usuarios where id" in sql:
            user = next((u for u in self.database.users.values() if u["id"] == args[0]), None)
            if not user:
                return None
            return {key: value for key, value in user.items() if key != "password_hash"}
        if sql.startswith("insert into partidas"):
            run = self.database.add_run(
                usuario_id=args[0], clase=args[1], vida_actual=args[2],
                vida_maxima=args[3], ataque=args[4], defensa=args[5], estado_run=args[6],
            )
            return run
        if sql.startswith("update partidas"):
            run = self.database.runs.get(args[5])
            if run:
                run.update({
                    "vida_actual": args[0], "monedas_actuales": args[1],
                    "puntuacion": args[2], "resultado": args[3], "estado_run": args[4],
                })
            return run
        if "where id = $1 and usuario_id = $2" in sql:
            run = self.database.runs.get(args[0])
            if run and run["usuario_id"] == args[1]:
                return run
            return None
        return None

    async def fetch(self, query, *args):
        sql = " ".join(query.split()).lower()
        if "join usuarios" in sql:
            rows = []
            for run in self.database.runs.values():
                user = next(
                    (u for u in self.database.users.values() if u["id"] == run["usuario_id"]),
                    {"email": "desconocido"},
                )
                rows.append({**run, "usuario": user["email"]})
            return sorted(rows, key=lambda r: r["puntuacion"], reverse=True)[:10]
        if "where usuario_id = $1" in sql:
            rows = [r for r in self.database.runs.values() if r["usuario_id"] == args[0]]
            return sorted(rows, key=lambda r: r["puntuacion"], reverse=True)[:10]
        return []


class FakeAcquire:
    def __init__(self, connection):
        self.connection = connection

    async def __aenter__(self):
        return self.connection

    async def __aexit__(self, *exc_info):
        return False


class FakePool:
    def __init__(self, database):
        self.database = database

    def acquire(self):
        return FakeAcquire(FakeConnection(self.database))


@pytest.fixture
def fake_db(monkeypatch):
    database = FakeDatabase()
    config.db.pool = FakePool(database)
    return database


@pytest.fixture
def client(fake_db, monkeypatch):
    from fastapi.testclient import TestClient
    from app import main

    async def noop_init_db():
        return None

    monkeypatch.setattr(main, "init_db", noop_init_db)
    with TestClient(main.app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers(client):
    payload = {"email": "hero@example.com", "password": "secreta123"}
    client.post("/api/auth/register", json=payload)
    token = client.post("/api/auth/login", json=payload).json()["data"]["token"]
    return {"Authorization": f"Bearer {token}"}
