from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Administrador(Base):
    __tablename__ = "Administrador"

    id_usuario: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Usuario.id_usuario", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    cargo: Mapped[str] = mapped_column(
        String(80),
        default="Coordinador de Soporte TI",
        server_default="Coordinador de Soporte TI",
    )
