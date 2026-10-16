from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles, usuario_actual
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.catalogo import CategoriaIn, CategoriaOut
from app.services import catalogo_service

router = APIRouter(prefix="/api/v1/categorias", tags=["categorias"])


@router.get("", response_model=list[CategoriaOut])
def listar_categorias(
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(usuario_actual),
):
    return catalogo_service.listar_categorias(db)


@router.post("", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    datos: CategoriaIn,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_roles("Administrador")),
):
    return catalogo_service.crear_categoria(db, datos)


@router.put("/{id_categoria}", response_model=CategoriaOut)
def actualizar_categoria(
    id_categoria: int,
    datos: CategoriaIn,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_roles("Administrador")),
):
    return catalogo_service.actualizar_categoria(db, id_categoria, datos)
