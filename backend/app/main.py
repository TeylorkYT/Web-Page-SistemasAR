from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core import config
from app.db.database import engine
from app.routers import auth

app = FastAPI(title="sistemasar.net")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/")
def raiz():
    return {
        "status": "online",
        "mensaje": "API de SistemasAR activa",
        "documentacion": "/docs",
        "health": "/health",
        "db_check": "/db-check",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    with engine.connect() as conexion:
        conexion.execute(text("SELECT 1"))
    return {"database": "ok"}
