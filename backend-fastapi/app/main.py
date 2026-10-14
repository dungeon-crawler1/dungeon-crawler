from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.routers import auth, users
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FastAPI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sobrescribimos el error 422 por defecto de FastAPI para mantener paridad con las respuestas de Express
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"status": "error", "message": "Estructura JSON inválida o datos faltantes."}
    )

app.include_router(auth.router, prefix="/api/auth")
app.include_router(users.router, prefix="/api/users")

@app.get("/health")
def health():
    return {"status": "OK", "service": "FastAPI Backend API"}