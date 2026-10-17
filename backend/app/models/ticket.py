from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Ticket(Base):
    __tablename__ = "Ticket"

    id_ticket: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    titulo: Mapped[str] = mapped_column(String(100))
    descripcion: Mapped[str] = mapped_column(Text)
    modalidad: Mapped[str] = mapped_column(
        Enum("Remoto", "Presencial"),
        default="Presencial",
        server_default="Presencial",
    )
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=func.now()
    )
    fecha_resolucion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    fecha_cierre: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    prioridad: Mapped[str] = mapped_column(
        Enum("Baja", "Media", "Alta", "Critica"),
        default="Media",
        server_default="Media",
    )
    estado: Mapped[str] = mapped_column(
        Enum("Abierto", "En_Proceso", "Resuelto", "Cerrado"),
        default="Abierto",
        server_default="Abierto",
    )
    id_cliente: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Cliente.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    id_tecnico: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("Tecnico.id_usuario", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    id_asignado_por: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("Administrador.id_usuario", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    id_equipo: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("Equipo.id_equipo", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
