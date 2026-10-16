from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class HistorialTicket(Base):
    __tablename__ = "Historial_Ticket"

    id_historial: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    id_ticket: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Ticket.id_ticket", ondelete="CASCADE", onupdate="CASCADE"),
    )
    tipo_accion: Mapped[str] = mapped_column(
        Enum(
            "Creacion",
            "Asignacion",
            "Cambio_Estado",
            "Resolucion",
            "Cierre",
            "Comentario",
        )
    )
    estado_anterior: Mapped[str | None] = mapped_column(
        Enum("Abierto", "En_Proceso", "Resuelto", "Cerrado"),
        nullable=True,
    )
    estado_nuevo: Mapped[str | None] = mapped_column(
        Enum("Abierto", "En_Proceso", "Resuelto", "Cerrado"),
        nullable=True,
    )
    fecha_accion: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    id_usuario: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Usuario.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    detalles: Mapped[str | None] = mapped_column(String(255), nullable=True)
