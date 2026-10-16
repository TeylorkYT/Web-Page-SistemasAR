from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Categoria(Base):
    __tablename__ = "Categoria"

    id_categoria: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    nombre_categoria: Mapped[str] = mapped_column(String(50), unique=True)
    descripcion: Mapped[str | None] = mapped_column(String(255), nullable=True)
