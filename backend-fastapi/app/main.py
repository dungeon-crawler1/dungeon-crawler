from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.routes import auth_routes, user_routes
from app.utils.formatters import build_json_response

app = FastAPI(title="FastAPI Backend - Roguelike Game")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return build_json_response(400, "error", "Estructura JSON inválida o datos faltantes.")

app.include_router(auth_routes.router, prefix="/api/auth")
app.include_router(user_routes.router, prefix="/api/users")

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "FastAPI Backend API"}