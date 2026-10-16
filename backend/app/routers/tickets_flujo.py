from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles, usuario_actual
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.flujo import (
    AsignarTecnicoIn,
    CalificacionCrearIn,
    CambiarEstadoIn,
    ReporteCrearIn,
)
from app.schemas.ticket import CalificacionOut, ReporteOut, TicketOut
from app.services import flujo_service

router = APIRouter(prefix="/api/v1/tickets", tags=["tickets"])


@router.patch("/{id_ticket}/asignar", response_model=TicketOut)
def asignar_tecnico(
    id_ticket: int,
    datos: AsignarTecnicoIn,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(requiere_roles("Administrador")),
):
    return flujo_service.asignar_tecnico(db, admin, id_ticket, datos)


@router.patch("/{id_ticket}/estado", response_model=TicketOut)
def cambiar_estado(
    id_ticket: int,
    datos: CambiarEstadoIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return flujo_service.cambiar_estado_cierre(db, usuario, id_ticket, datos)


@router.post(
    "/{id_ticket}/reporte",
    response_model=ReporteOut,
    status_code=status.HTTP_201_CREATED,
)
def registrar_reporte(
    id_ticket: int,
    datos: ReporteCrearIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_roles("Tecnico")),
):
    return flujo_service.registrar_reporte(db, usuario, id_ticket, datos)


@router.post(
    "/{id_ticket}/calificacion",
    response_model=CalificacionOut,
    status_code=status.HTTP_201_CREATED,
)
def registrar_calificacion(
    id_ticket: int,
    datos: CalificacionCrearIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_roles("Cliente")),
):
    return flujo_service.registrar_calificacion(db, usuario, id_ticket, datos)
