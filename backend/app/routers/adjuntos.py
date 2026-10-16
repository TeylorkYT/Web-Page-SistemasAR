from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.deps import usuario_actual
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.ticket import AdjuntoOut
from app.services import adjunto_service

router = APIRouter(prefix="/api/v1/tickets", tags=["adjuntos"])


@router.post(
    "/{id_ticket}/adjuntos",
    response_model=AdjuntoOut,
    status_code=status.HTTP_201_CREATED,
)
def subir_adjunto(
    id_ticket: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return adjunto_service.subir_adjunto(
        db=db, usuario=usuario, id_ticket=id_ticket, archivo=archivo
    )


@router.get(
    "/{id_ticket}/adjuntos",
    response_model=list[AdjuntoOut],
)
def listar_adjuntos(
    id_ticket: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
):
    return adjunto_service.listar_adjuntos(
        db=db, usuario=usuario, id_ticket=id_ticket
    )


@router.get(
    "/{id_ticket}/adjuntos/{id_adjunto}/descargar",
)
def descargar_adjunto(
    id_ticket: int,
    id_adjunto: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
) -> FileResponse:
    return adjunto_service.descargar_adjunto(
        db=db, usuario=usuario, id_ticket=id_ticket, id_adjunto=id_adjunto
    )
