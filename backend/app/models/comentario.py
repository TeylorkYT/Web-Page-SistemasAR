from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Comentario(Base):
    __tablename__ = "Comentario"

    id_comentario: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    contenido: Mapped[str] = mapped_column(Text)
    es_nota_interna: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0"
    )
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    id_usuario: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Usuario.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    id_ticket: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Ticket.id_ticket", ondelete="CASCADE", onupdate="CASCADE"),
    )
