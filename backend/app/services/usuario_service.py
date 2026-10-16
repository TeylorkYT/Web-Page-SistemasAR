from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.usuario import Usuario


def obtener_por_correo(db: Session, correo: str) -> Usuario | None:
    return db.scalar(select(Usuario).where(Usuario.correo_electronico == correo))


def obtener_por_id(db: Session, id_usuario: int) -> Usuario | None:
    return db.get(Usuario, id_usuario)
