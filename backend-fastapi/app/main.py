# Punto de entrada de la aplicación FastAPI
from fastapi import FastAPI
from app.config.db import init_db
from app.routes import auth_routes, user_routes, game_routes

app = FastAPI(title="Roguelike FastAPI Engine")

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(game_routes.router)