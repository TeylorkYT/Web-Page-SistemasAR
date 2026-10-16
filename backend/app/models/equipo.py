from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Equipo(Base):
    __tablename__ = "Equipo"

    id_equipo: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    tipo: Mapped[str] = mapped_column(
        Enum("Computador", "Impresora", "Servidor", "Red", "Otro")
    )
    marca: Mapped[str] = mapped_column(String(50))
    modelo: Mapped[str] = mapped_column(String(50))
    serial: Mapped[str] = mapped_column(String(50), unique=True)
    sistema_operativo: Mapped[str | None] = mapped_column(String(50), nullable=True)
    area_departamento: Mapped[str] = mapped_column(
        String(80), default="General", server_default="General"
    )
    id_cliente: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Cliente.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
    )
    estado_equipo: Mapped[str] = mapped_column(
        Enum("Operativo", "En_Reparacion", "Fuera_de_Servicio"),
        default="Operativo",
        server_default="Operativo",
    )
