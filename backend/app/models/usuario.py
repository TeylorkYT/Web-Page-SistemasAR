from datetime import date

from sqlalchemy import Date, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Usuario(Base):
    __tablename__ = "Usuario"  # con mayúscula, como se creó en MySQL

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50))
    apellido: Mapped[str] = mapped_column(String(50))
    correo_electronico: Mapped[str] = mapped_column(String(100), unique=True)
    contrasena: Mapped[str] = mapped_column(String(255))
    rol: Mapped[str] = mapped_column(Enum("Cliente", "Administrador", "Tecnico"))
    fecha_registro: Mapped[date] = mapped_column(Date)
    estado: Mapped[str] = mapped_column(Enum("Activo", "Inactivo"), default="Activo")
