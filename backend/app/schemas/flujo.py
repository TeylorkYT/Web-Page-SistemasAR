from typing import Literal

from pydantic import BaseModel, Field

PrioridadTicket = Literal["Baja", "Media", "Alta", "Critica"]


class AsignarTecnicoIn(BaseModel):
    id_tecnico: int
    prioridad: PrioridadTicket | None = None


class CambiarEstadoIn(BaseModel):
    estado_nuevo: Literal["Cerrado"]


class ReporteCrearIn(BaseModel):
    solucion_aplicada: str = Field(..., min_length=1)


class CalificacionCrearIn(BaseModel):
    puntuacion: int = Field(..., ge=1, le=5)
    comentario: str | None = Field(default=None, max_length=255)
