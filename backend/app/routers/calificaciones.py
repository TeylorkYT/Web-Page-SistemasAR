from datetime import datetime, time
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles
from app.db.database import get_db
from app.models.calificacion import Calificacion
from app.models.usuario import Usuario
from app.schemas.ticket import CalificacionOut

router = APIRouter(prefix="/api/v1/calificaciones", tags=["calificaciones"])


@router.get("", response_model=list[CalificacionOut])
def listar_calificaciones(
    id_tecnico: int | None = Query(default=None),
    desde: str | None = Query(default=None),
    hasta: str | None = Query(default=None),
    puntuacion: int | None = Query(default=None),
    db: Session = Depends(get_db),
    admin: Usuario = Depends(requiere_roles("Administrador", "administrador")),
):
    stmt = select(Calificacion).order_by(Calificacion.fecha_calificacion.desc())

    if id_tecnico is not None:
        stmt = stmt.where(Calificacion.id_tecnico == id_tecnico)

    if puntuacion is not None:
        stmt = stmt.where(Calificacion.puntuacion == puntuacion)

    if desde:
        try:
            f_desde = (
                datetime.combine(datetime.fromisoformat(desde).date(), time.min)
                if len(desde) == 10
                else datetime.fromisoformat(desde)
            )
            stmt = stmt.where(Calificacion.fecha_calificacion >= f_desde)
        except Exception:
            pass

    if hasta:
        try:
            f_hasta = (
                datetime.combine(datetime.fromisoformat(hasta).date(), time.max)
                if len(hasta) == 10
                else datetime.fromisoformat(hasta)
            )
            stmt = stmt.where(Calificacion.fecha_calificacion <= f_hasta)
        except Exception:
            pass

    calificaciones = list(db.scalars(stmt).all())

    resultado: list[CalificacionOut] = []
    for c in calificaciones:
        cli = db.get(Usuario, c.id_cliente)
        tec = db.get(Usuario, c.id_tecnico)
        resultado.append(
            CalificacionOut(
                id_calificacion=c.id_calificacion,
                id_ticket=c.id_ticket,
                id_cliente=c.id_cliente,
                cliente_nombre=f"{cli.nombre} {cli.apellido}" if cli else "",
                id_tecnico=c.id_tecnico,
                tecnico_nombre=f"{tec.nombre} {tec.apellido}" if tec else "",
                puntuacion=c.puntuacion,
                comentario=c.comentario,
                fecha_calificacion=c.fecha_calificacion,
            )
        )

    return resultado
