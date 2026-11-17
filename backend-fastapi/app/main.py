# Punto de entrada de la aplicación FastAPI
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.db import init_db
from app.routes import auth_routes, user_routes, game_routes

app = FastAPI(title="Roguelike FastAPI Engine")

# CORS para permitir el acceso directo desde los frontends (LAN/túnel).
# En producción restringí CORS_ORIGINS a los orígenes reales.
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(game_routes.router)