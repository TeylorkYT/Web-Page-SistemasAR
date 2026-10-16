from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.calificacion import Calificacion
from app.models.reporte import Reporte
from app.models.tecnico import Tecnico
from app.models.ticket import Ticket
from app.models.usuario import Usuario
from app.schemas.flujo import (
    AsignarTecnicoIn,
    CalificacionCrearIn,
    CambiarEstadoIn,
    ReporteCrearIn,
)
from app.schemas.ticket import CalificacionOut, ReporteOut, TicketOut
from app.services.historial_service import registrar_historial
from app.services.notificacion_service import notificar
from app.services.ticket_service import armar_ticket_out


def asignar_tecnico(
    db: Session, admin: Usuario, id_ticket: int, datos: AsignarTecnicoIn
) -> TicketOut:
    ticket = db.get(Ticket, id_ticket)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if ticket.estado not in ["Abierto", "En_Proceso"]:
        raise HTTPException(
            status_code=400,
            detail="El ticket no está en un estado válido para esta acción",
        )

    # Validar que el técnico exista, esté activo y disponible
    tecnico_u = db.get(Usuario, datos.id_tecnico)
    tecnico_info = db.get(Tecnico, datos.id_tecnico)
    if (
        not tecnico_u
        or not tecnico_info
        or tecnico_u.estado != "Activo"
        or tecnico_info.disponibilidad == "Fuera_de_Servicio"
    ):
        raise HTTPException(status_code=400, detail="El técnico no está disponible")

    estado_anterior = ticket.estado
    ticket.id_tecnico = datos.id_tecnico
    ticket.id_asignado_por = admin.id_usuario
    ticket.estado = "En_Proceso"
    if datos.prioridad:
        ticket.prioridad = datos.prioridad

    registrar_historial(
        db=db,
        id_ticket=ticket.id_ticket,
        tipo_accion="Asignacion",
        id_usuario=admin.id_usuario,
        estado_anterior=estado_anterior,
        estado_nuevo="En_Proceso",
        detalles=f"Asignado a técnico {tecnico_u.nombre} {tecnico_u.apellido}",
    )

    notificar(
        db=db,
        id_usuario_destino=datos.id_tecnico,
        id_ticket=ticket.id_ticket,
        tipo="Asignacion",
        mensaje=f"Se te ha asignado el ticket #{ticket.id_ticket}: {ticket.titulo}",
    )
    notificar(
        db=db,
        id_usuario_destino=ticket.id_cliente,
        id_ticket=ticket.id_ticket,
        tipo="Asignacion",
        mensaje=f"Tu ticket #{ticket.id_ticket} ha sido asignado al técnico {tecnico_u.nombre} {tecnico_u.apellido}",
    )

    db.commit()
    db.refresh(ticket)
    return armar_ticket_out(db, ticket)


def cambiar_estado_cierre(
    db: Session, usuario: Usuario, id_ticket: int, datos: CambiarEstadoIn
) -> TicketOut:
    ticket = db.get(Ticket, id_ticket)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if usuario.rol == "Cliente" and ticket.id_cliente != usuario.id_usuario:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if usuario.rol not in ["Cliente", "Administrador"]:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para cerrar este ticket"
        )

    if ticket.estado != "Resuelto":
        raise HTTPException(
            status_code=400,
            detail="El ticket no está en un estado válido para esta acción",
        )

    ticket.estado = "Cerrado"
    ticket.fecha_cierre = func.now()

    registrar_historial(
        db=db,
        id_ticket=ticket.id_ticket,
        tipo_accion="Cierre",
        id_usuario=usuario.id_usuario,
        estado_anterior="Resuelto",
        estado_nuevo="Cerrado",
        detalles="Ticket cerrado sin calificar",
    )

    if ticket.id_tecnico:
        notificar(
            db=db,
            id_usuario_destino=ticket.id_tecnico,
            id_ticket=ticket.id_ticket,
            tipo="Actualizacion",
            mensaje=f"El ticket #{ticket.id_ticket} ha sido cerrado",
        )
    admins = list(
        db.scalars(
            select(Usuario).where(
                Usuario.rol == "Administrador", Usuario.estado == "Activo"
            )
        ).all()
    )
    for a in admins:
        notificar(
            db=db,
            id_usuario_destino=a.id_usuario,
            id_ticket=ticket.id_ticket,
            tipo="Actualizacion",
            mensaje=f"El ticket #{ticket.id_ticket} ha sido cerrado",
        )

    db.commit()
    db.refresh(ticket)
    return armar_ticket_out(db, ticket)


def registrar_reporte(
    db: Session, usuario: Usuario, id_ticket: int, datos: ReporteCrearIn
) -> ReporteOut:
    ticket = db.get(Ticket, id_ticket)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if ticket.id_tecnico != usuario.id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Solo el técnico asignado puede registrar el reporte de solución",
        )

    if ticket.estado != "En_Proceso":
        raise HTTPException(
            status_code=400,
            detail="El ticket no está en un estado válido para esta acción",
        )

    solucion = datos.solucion_aplicada.strip()
    if not solucion:
        raise HTTPException(
            status_code=400, detail="Debes registrar la solución aplicada"
        )

    reporte = Reporte(
        id_ticket=ticket.id_ticket,
        id_tecnico=usuario.id_usuario,
        solucion_aplicada=solucion,
        estado="Aprobado",
    )
    db.add(reporte)

    ticket.estado = "Resuelto"
    ticket.fecha_resolucion = func.now()

    registrar_historial(
        db=db,
        id_ticket=ticket.id_ticket,
        tipo_accion="Resolucion",
        id_usuario=usuario.id_usuario,
        estado_anterior="En_Proceso",
        estado_nuevo="Resuelto",
        detalles="Solución técnica aplicada y ticket resuelto",
    )

    notificar(
        db=db,
        id_usuario_destino=ticket.id_cliente,
        id_ticket=ticket.id_ticket,
        tipo="Resolucion",
        mensaje=f"Tu ticket #{ticket.id_ticket} ha sido resuelto",
    )

    db.commit()
    db.refresh(reporte)
    return ReporteOut.model_validate(reporte)


def registrar_calificacion(
    db: Session, usuario: Usuario, id_ticket: int, datos: CalificacionCrearIn
) -> CalificacionOut:
    ticket = db.get(Ticket, id_ticket)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if ticket.id_cliente != usuario.id_usuario:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if ticket.estado != "Resuelto":
        raise HTTPException(
            status_code=400,
            detail="El ticket no está en un estado válido para esta acción",
        )

    existente = db.scalar(
        select(Calificacion).where(Calificacion.id_ticket == id_ticket)
    )
    if existente:
        raise HTTPException(
            status_code=409, detail="El ticket ya tiene una calificación registrada"
        )

    if not ticket.id_tecnico:
        raise HTTPException(
            status_code=400,
            detail="El ticket no tiene un técnico asignado para calificar",
        )

    calif = Calificacion(
        id_ticket=ticket.id_ticket,
        id_cliente=usuario.id_usuario,
        id_tecnico=ticket.id_tecnico,
        puntuacion=datos.puntuacion,
        comentario=datos.comentario,
    )
    db.add(calif)

    ticket.estado = "Cerrado"
    ticket.fecha_cierre = func.now()

    registrar_historial(
        db=db,
        id_ticket=ticket.id_ticket,
        tipo_accion="Cierre",
        id_usuario=usuario.id_usuario,
        estado_anterior="Resuelto",
        estado_nuevo="Cerrado",
        detalles=f"Ticket calificado con {datos.puntuacion} estrellas y cerrado",
    )

    if ticket.id_tecnico:
        notificar(
            db=db,
            id_usuario_destino=ticket.id_tecnico,
            id_ticket=ticket.id_ticket,
            tipo="Actualizacion",
            mensaje=f"El ticket #{ticket.id_ticket} ha sido cerrado y calificado",
        )
    admins = list(
        db.scalars(
            select(Usuario).where(
                Usuario.rol == "Administrador", Usuario.estado == "Activo"
            )
        ).all()
    )
    for a in admins:
        notificar(
            db=db,
            id_usuario_destino=a.id_usuario,
            id_ticket=ticket.id_ticket,
            tipo="Actualizacion",
            mensaje=f"El ticket #{ticket.id_ticket} ha sido cerrado y calificado",
        )
        if datos.puntuacion <= 2:
            notificar(
                db=db,
                id_usuario_destino=a.id_usuario,
                id_ticket=ticket.id_ticket,
                tipo="Actualizacion",
                mensaje=f"Alerta: El ticket #{ticket.id_ticket} recibió una calificación baja ({datos.puntuacion}/5)",
            )

    db.commit()
    db.refresh(calif)

    cliente_u = db.get(Usuario, calif.id_cliente)
    tecnico_u = db.get(Usuario, calif.id_tecnico)

    return CalificacionOut(
        id_calificacion=calif.id_calificacion,
        id_ticket=calif.id_ticket,
        id_cliente=calif.id_cliente,
        cliente_nombre=f"{cliente_u.nombre} {cliente_u.apellido}" if cliente_u else "",
        id_tecnico=calif.id_tecnico,
        tecnico_nombre=f"{tecnico_u.nombre} {tecnico_u.apellido}" if tecnico_u else "",
        puntuacion=calif.puntuacion,
        comentario=calif.comentario,
        fecha_calificacion=calif.fecha_calificacion,
    )
