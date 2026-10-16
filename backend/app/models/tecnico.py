from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Tecnico(Base):
    __tablename__ = "Tecnico"

    id_usuario: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Usuario.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    especialidad: Mapped[str] = mapped_column(
        String(80),
        default="Soporte General TI",
        server_default="Soporte General TI",
    )
    disponibilidad: Mapped[str] = mapped_column(
        Enum("Disponible", "Ocupado", "En_Almuerzo", "Fuera_de_Servicio"),
        default="Disponible",
        server_default="Disponible",
    )
