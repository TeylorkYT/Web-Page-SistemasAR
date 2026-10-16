from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles, usuario_actual
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.ticket import (
    ComentarioCrearIn,
    ComentarioOut,
    HistorialOut,
    TicketCrearIn,
    TicketDetalleOut,
    TicketOut,
)
from app.services import ticket_service

router = APIRouter(prefix="/api/v1/tickets", tags=["tickets"])


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def crear_ticket(
    datos: TicketCrearIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_roles("Cliente")),
):
    return ticket_service.crear_ticket(db, usuario.id_usuario, datos)


@router.get("", response_model=list[TicketOut])
def listar_tickets(
    estado: str | None = Query(default=None),
    prioridad: str | None = Query(default=None),
    id_tecnico: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return ticket_service.listar_tickets(
        db, usuario, estado=estado, prioridad=prioridad, id_tecnico=id_tecnico
    )


@router.get("/{id_ticket}", response_model=TicketDetalleOut)
def obtener_ticket(
    id_ticket: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return ticket_service.obtener_ticket(db, usuario, id_ticket)


@router.get("/{id_ticket}/historial", response_model=list[HistorialOut])
def listar_historial(
    id_ticket: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return ticket_service.listar_historial(db, usuario, id_ticket)


@router.get("/{id_ticket}/comentarios", response_model=list[ComentarioOut])
def listar_comentarios(
    id_ticket: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return ticket_service.listar_comentarios(db, usuario, id_ticket)


@router.post(
    "/{id_ticket}/comentarios",
    response_model=ComentarioOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_comentario(
    id_ticket: int,
    datos: ComentarioCrearIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return ticket_service.crear_comentario(db, usuario, id_ticket, datos)
