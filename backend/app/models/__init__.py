from app.models.administrador import Administrador
from app.models.adjunto_ticket import AdjuntoTicket
from app.models.calificacion import Calificacion
from app.models.categoria import Categoria
from app.models.cliente import Cliente
from app.models.comentario import Comentario
from app.models.equipo import Equipo
from app.models.historial_ticket import HistorialTicket
from app.models.notificacion import Notificacion
from app.models.reporte import Reporte
from app.models.tecnico import Tecnico
from app.models.ticket import Ticket
from app.models.ticket_categoria import TicketCategoria
from app.models.usuario import Usuario

__all__ = [
    "Usuario",
    "Cliente",
    "Administrador",
    "Tecnico",
    "Categoria",
    "Equipo",
    "Ticket",
    "TicketCategoria",
    "AdjuntoTicket",
    "HistorialTicket",
    "Comentario",
    "Reporte",
    "Notificacion",
    "Calificacion",
]
