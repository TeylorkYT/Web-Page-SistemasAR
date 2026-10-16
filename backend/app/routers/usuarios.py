from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCrearIn, UsuarioOut, UsuarioUpdateIn
from app.services import usuario_service

router = APIRouter(prefix="/api/v1/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioOut])
def listar_usuarios(
    rol: str | None = Query(default=None),
    estado: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_roles("Administrador")),
):
    return usuario_service.listar_usuarios(db, rol=rol, estado=estado)


@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    datos: UsuarioCrearIn,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_roles("Administrador")),
):
    return usuario_service.crear_usuario_admin(db, datos)


@router.put("/{id_usuario}", response_model=UsuarioOut)
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioUpdateIn,
    db: Session = Depends(get_db),
    admin_actual: Usuario = Depends(requiere_roles("Administrador")),
):
    return usuario_service.actualizar_usuario_admin(db, admin_actual, id_usuario, datos)
