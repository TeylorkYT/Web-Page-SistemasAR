from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

TipoNotificacion = Literal["Asignacion", "Actualizacion", "Resolucion", "Comentario"]


class NotificacionOut(BaseModel):
    id_notificacion: int
    mensaje: str
    tipo: TipoNotificacion
    leida: bool
    fecha_envio: datetime
    id_ticket: int

    model_config = ConfigDict(from_attributes=True)


class ReporteAgenteItem(BaseModel):
    id_tecnico: int
    tecnico_nombre: str
    total: int
    resueltos: int
    cerrados: int


class ReportePrioridadItem(BaseModel):
    prioridad: str
    total: int


class TicketTiempoItem(BaseModel):
    id_ticket: int
    horas: float


class ReporteTiemposOut(BaseModel):
    promedio_horas: float
    tickets: list[TicketTiempoItem]


class EstadoCountItem(BaseModel):
    estado: str
    total: int


class SemanaItem(BaseModel):
    semana: str
    abiertos: int
    cerrados: int


class ReporteEstadoGeneralOut(BaseModel):
    tickets_totales: int
    abiertos: int
    cerrados: int
    tecnicos_activos: int
    por_estado: list[EstadoCountItem]
    serie_semanal: list[SemanaItem]


class ReporteAreaCategoriaItem(BaseModel):
    area_departamento: str
    nombre_categoria: str
    total: int
