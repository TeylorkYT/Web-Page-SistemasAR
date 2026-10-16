from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

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
    info = {
        "status": "online",
        "mensaje": "API de SistemasAR activa",
        "documentacion": "/docs",
        "health": "/health",
    }
    if config.ENV != "production":
        info["db_check"] = "/db-check"
    return info


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    if config.ENV == "production":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint no disponible en producción",
        )
    try:
        with engine.connect() as conexion:
            conexion.execute(text("SELECT 1"))
        return {"database": "ok"}
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Error de conexión con la base de datos",
        )

