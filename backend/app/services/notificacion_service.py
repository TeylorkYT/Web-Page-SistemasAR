from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notificacion import Notificacion
from app.models.ticket import Ticket
from app.models.usuario import Usuario
from app.services import email_service


def notificar(
    db: Session,
    id_usuario_destino: int,
    id_ticket: int,
    tipo: str,
    mensaje: str,
) -> None:
    db.add(
        Notificacion(
            id_usuario_destino=id_usuario_destino,
            id_ticket=id_ticket,
            tipo=tipo,
            mensaje=mensaje,
            leida=False,
        )
    )

    try:
        usuario = db.get(Usuario, id_usuario_destino)
        ticket = db.get(Ticket, id_ticket)
        if usuario and usuario.estado == "Activo" and usuario.correo_electronico:
            titulo_tkt = ticket.titulo if ticket else f"Ticket #{id_ticket}"
            email_service.enviar_correo_evento_ticket(
                destinatario=usuario.correo_electronico,
                nombre=usuario.nombre,
                id_ticket=id_ticket,
                titulo_ticket=titulo_tkt,
                evento=tipo,
                detalles=mensaje,
            )
    except Exception:
        pass


def listar_notificaciones(db: Session, id_usuario: int) -> list[Notificacion]:
    stmt = (
        select(Notificacion)
        .where(Notificacion.id_usuario_destino == id_usuario)
        .order_by(Notificacion.fecha_envio.desc())
    )
    return list(db.scalars(stmt).all())


def marcar_leida(db: Session, id_usuario: int, id_notificacion: int) -> Notificacion:
    notif = db.get(Notificacion, id_notificacion)
    if not notif or notif.id_usuario_destino != id_usuario:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    notif.leida = True
    db.commit()
    db.refresh(notif)
    return notif
