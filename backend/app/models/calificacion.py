from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Calificacion(Base):
    __tablename__ = "Calificacion"

    id_calificacion: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    id_ticket: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Ticket.id_ticket", ondelete="CASCADE", onupdate="CASCADE"),
        unique=True,
    )
    id_cliente: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Cliente.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    id_tecnico: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Tecnico.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    puntuacion: Mapped[int] = mapped_column(SmallInteger)
    comentario: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_calificacion: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
