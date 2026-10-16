from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class AdjuntoTicket(Base):
    __tablename__ = "Adjunto_Ticket"

    id_adjunto: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    id_ticket: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Ticket.id_ticket", ondelete="CASCADE", onupdate="CASCADE"),
    )
    id_usuario: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Usuario.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    nombre_archivo: Mapped[str] = mapped_column(String(150))
    ruta_url: Mapped[str] = mapped_column(String(255))
    tipo_mime: Mapped[str] = mapped_column(
        Enum("image/jpeg", "image/png", "application/pdf")
    )
    tamano_bytes: Mapped[int] = mapped_column(Integer)
    fecha_subida: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
