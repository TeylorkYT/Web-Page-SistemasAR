from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ModalidadTicket = Literal["Remoto", "Presencial"]
PrioridadTicket = Literal["Baja", "Media", "Alta", "Critica"]
EstadoTicket = Literal["Abierto", "En_Proceso", "Resuelto", "Cerrado"]


class CategoriaResumenOut(BaseModel):
    id_categoria: int
    nombre_categoria: str

    model_config = ConfigDict(from_attributes=True)


class TicketCrearIn(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=100)
    descripcion: str = Field(..., min_length=1)
    modalidad: ModalidadTicket = "Presencial"
    id_equipo: int | None = None
    categorias: list[int] = Field(..., min_length=1)


class TicketOut(BaseModel):
    id_ticket: int
    titulo: str
    descripcion: str
    modalidad: ModalidadTicket
    prioridad: PrioridadTicket
    estado: EstadoTicket
    fecha_creacion: datetime
    fecha_resolucion: datetime | None = None
    fecha_cierre: datetime | None = None
    id_cliente: int
    cliente_nombre: str
    id_tecnico: int | None = None
    tecnico_nombre: str | None = None
    id_asignado_por: int | None = None
    id_equipo: int | None = None
    equipo: str | None = None
    categorias: list[CategoriaResumenOut] = []

    model_config = ConfigDict(from_attributes=True)


class ReporteOut(BaseModel):
    id_reporte: int
    id_ticket: int
    id_tecnico: int
    solucion_aplicada: str
    fecha_reporte: datetime
    estado: str

    model_config = ConfigDict(from_attributes=True)


class CalificacionOut(BaseModel):
    id_calificacion: int
    id_ticket: int
    id_cliente: int
    cliente_nombre: str
    id_tecnico: int
    tecnico_nombre: str
    puntuacion: int
    comentario: str | None = None
    fecha_calificacion: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketDetalleOut(TicketOut):
    reporte: ReporteOut | None = None
    calificacion: CalificacionOut | None = None


class HistorialOut(BaseModel):
    id_historial: int
    id_ticket: int
    tipo_accion: str
    estado_anterior: str | None = None
    estado_nuevo: str | None = None
    fecha_accion: datetime
    id_usuario: int
    usuario_nombre: str
    detalles: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ComentarioCrearIn(BaseModel):
    contenido: str = Field(..., min_length=1)
    es_nota_interna: bool = False


class ComentarioOut(BaseModel):
    id_comentario: int
    id_ticket: int
    contenido: str
    es_nota_interna: bool
    fecha_creacion: datetime
    id_usuario: int
    usuario_nombre: str
    rol: str

    model_config = ConfigDict(from_attributes=True)


class AdjuntoOut(BaseModel):
    id_adjunto: int
    id_ticket: int
    id_usuario: int
    nombre_archivo: str
    ruta_url: str
    tipo_mime: str
    tamano_bytes: int
    fecha_subida: datetime

    model_config = ConfigDict(from_attributes=True)
