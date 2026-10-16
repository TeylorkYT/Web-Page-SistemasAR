from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Reporte(Base):
    __tablename__ = "Reporte"

    id_reporte: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    id_ticket: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Ticket.id_ticket", ondelete="CASCADE", onupdate="CASCADE"),
    )
    id_tecnico: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Tecnico.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    solucion_aplicada: Mapped[str] = mapped_column(Text)
    fecha_reporte: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    estado: Mapped[str] = mapped_column(
        Enum("Pendiente", "En_Revision", "Aprobado"),
        default="Pendiente",
        server_default="Pendiente",
    )
