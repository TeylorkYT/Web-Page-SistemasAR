from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Notificacion(Base):
    __tablename__ = "Notificacion"

    id_notificacion: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    mensaje: Mapped[str] = mapped_column(String(255))
    tipo: Mapped[str] = mapped_column(
        Enum("Asignacion", "Actualizacion", "Resolucion", "Comentario")
    )
    leida: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    fecha_envio: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    id_usuario_destino: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Usuario.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    id_ticket: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Ticket.id_ticket", ondelete="CASCADE", onupdate="CASCADE"),
    )
