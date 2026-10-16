from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles, usuario_actual
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.catalogo import EquipoIn, EquipoOut, EquipoUpdateIn
from app.services import catalogo_service

router = APIRouter(prefix="/api/v1/equipos", tags=["equipos"])


@router.get("", response_model=list[EquipoOut])
def listar_equipos(
    id_cliente: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return catalogo_service.listar_equipos(db, usuario, id_cliente)


@router.post("", response_model=EquipoOut, status_code=status.HTTP_201_CREATED)
def crear_equipo(
    datos: EquipoIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_roles("Cliente", "Administrador")),
):
    return catalogo_service.crear_equipo(db, usuario, datos)


@router.put("/{id_equipo}", response_model=EquipoOut)
def actualizar_equipo(
    id_equipo: int,
    datos: EquipoUpdateIn,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requiere_roles("Cliente", "Administrador")),
):
    return catalogo_service.actualizar_equipo(db, usuario, id_equipo, datos)
