from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notificacion import Notificacion


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
