from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.catalogo import TecnicoOut
from app.services import catalogo_service

router = APIRouter(prefix="/api/v1/tecnicos", tags=["tecnicos"])


@router.get("", response_model=list[TecnicoOut])
def listar_tecnicos(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_roles("Administrador")),
):
    return catalogo_service.listar_tecnicos(db)
