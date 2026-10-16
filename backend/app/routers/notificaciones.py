from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import usuario_actual
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.reportes import NotificacionOut
from app.services import notificacion_service

router = APIRouter(prefix="/api/v1/notificaciones", tags=["notificaciones"])


@router.get("", response_model=list[NotificacionOut])
def listar_notificaciones(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return notificacion_service.listar_notificaciones(db, usuario.id_usuario)


@router.patch("/{id_notificacion}/leida", response_model=NotificacionOut)
def marcar_leida(
    id_notificacion: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return notificacion_service.marcar_leida(db, usuario.id_usuario, id_notificacion)
