from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core import config
from app.db.database import engine
from app.routers import (
    auth,
    calificaciones,
    categorias,
    equipos,
    notificaciones,
    reportes,
    tecnicos,
    tickets,
    tickets_flujo,
    usuarios,
)

app = FastAPI(title="sistemasar.net")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(categorias.router)
app.include_router(equipos.router)
app.include_router(tecnicos.router)
app.include_router(tickets.router)
app.include_router(tickets_flujo.router)
app.include_router(calificaciones.router)
app.include_router(notificaciones.router)
app.include_router(reportes.router)


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
