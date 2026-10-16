from sqlalchemy.orm import Session

from app.models.historial_ticket import HistorialTicket


def registrar_historial(
    db: Session,
    id_ticket: int,
    tipo_accion: str,
    id_usuario: int,
    estado_anterior: str | None = None,
    estado_nuevo: str | None = None,
    detalles: str | None = None,
) -> None:
    db.add(
        HistorialTicket(
            id_ticket=id_ticket,
            tipo_accion=tipo_accion,
            estado_anterior=estado_anterior,
            estado_nuevo=estado_nuevo,
            id_usuario=id_usuario,
            detalles=detalles,
        )
    )
