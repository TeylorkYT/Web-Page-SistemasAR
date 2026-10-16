from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class TicketCategoria(Base):
    __tablename__ = "Ticket_Categoria"

    id_ticket: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Ticket.id_ticket", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    id_categoria: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("Categoria.id_categoria", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
