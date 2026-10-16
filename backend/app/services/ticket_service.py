from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.calificacion import Calificacion
from app.models.categoria import Categoria
from app.models.cliente import Cliente
from app.models.comentario import Comentario
from app.models.equipo import Equipo
from app.models.historial_ticket import HistorialTicket
from app.models.reporte import Reporte
from app.models.tecnico import Tecnico
from app.models.ticket import Ticket
from app.models.ticket_categoria import TicketCategoria
from app.models.usuario import Usuario
from app.schemas.ticket import (
    CalificacionOut,
    CategoriaResumenOut,
    ComentarioCrearIn,
    ComentarioOut,
    HistorialOut,
    ReporteOut,
    TicketCrearIn,
    TicketDetalleOut,
    TicketOut,
)
from app.services.historial_service import registrar_historial
from app.services.notificacion_service import notificar


def validar_acceso_ticket(usuario: Usuario, ticket: Ticket | None) -> None:
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if usuario.rol == "Cliente" and ticket.id_cliente != usuario.id_usuario:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if usuario.rol == "Tecnico" and ticket.id_tecnico != usuario.id_usuario:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")


def armar_ticket_out(db: Session, ticket: Ticket) -> TicketOut:
    cliente_user = db.get(Usuario, ticket.id_cliente)
    cliente_nombre = (
        f"{cliente_user.nombre} {cliente_user.apellido}" if cliente_user else ""
    )

    tecnico_nombre = None
    if ticket.id_tecnico:
        tecnico_user = db.get(Usuario, ticket.id_tecnico)
        if tecnico_user:
            tecnico_nombre = f"{tecnico_user.nombre} {tecnico_user.apellido}"

    equipo_texto = None
    if ticket.id_equipo:
        eq = db.get(Equipo, ticket.id_equipo)
        if eq:
            equipo_texto = f"{eq.marca} {eq.modelo}"

    # Categorías asociadas
    stmt_cats = (
        select(Categoria.id_categoria, Categoria.nombre_categoria)
        .join(TicketCategoria, Categoria.id_categoria == TicketCategoria.id_categoria)
        .where(TicketCategoria.id_ticket == ticket.id_ticket)
    )
    categorias = [
        CategoriaResumenOut(id_categoria=row.id_categoria, nombre_categoria=row.nombre_categoria)
        for row in db.execute(stmt_cats).all()
    ]

    return TicketOut(
        id_ticket=ticket.id_ticket,
        titulo=ticket.titulo,
        descripcion=ticket.descripcion,
        modalidad=ticket.modalidad,
        prioridad=ticket.prioridad,
        estado=ticket.estado,
        fecha_creacion=ticket.fecha_creacion,
        fecha_resolucion=ticket.fecha_resolucion,
        fecha_cierre=ticket.fecha_cierre,
        id_cliente=ticket.id_cliente,
        cliente_nombre=cliente_nombre,
        id_tecnico=ticket.id_tecnico,
        tecnico_nombre=tecnico_nombre,
        id_asignado_por=ticket.id_asignado_por,
        id_equipo=ticket.id_equipo,
        equipo=equipo_texto,
        categorias=categorias,
    )


def armar_ticket_detalle_out(db: Session, ticket: Ticket) -> TicketDetalleOut:
    base = armar_ticket_out(db, ticket)

    reporte_db = db.scalar(select(Reporte).where(Reporte.id_ticket == ticket.id_ticket))
    reporte_out = None
    if reporte_db:
        reporte_out = ReporteOut.model_validate(reporte_db)

    calif_db = db.scalar(
        select(Calificacion).where(Calificacion.id_ticket == ticket.id_ticket)
    )
    calif_out = None
    if calif_db:
        cliente_u = db.get(Usuario, calif_db.id_cliente)
        tecnico_u = db.get(Usuario, calif_db.id_tecnico)
        calif_out = CalificacionOut(
            id_calificacion=calif_db.id_calificacion,
            id_ticket=calif_db.id_ticket,
            id_cliente=calif_db.id_cliente,
            cliente_nombre=f"{cliente_u.nombre} {cliente_u.apellido}" if cliente_u else "",
            id_tecnico=calif_db.id_tecnico,
            tecnico_nombre=f"{tecnico_u.nombre} {tecnico_u.apellido}" if tecnico_u else "",
            puntuacion=calif_db.puntuacion,
            comentario=calif_db.comentario,
            fecha_calificacion=calif_db.fecha_calificacion,
        )

    return TicketDetalleOut(
        **base.model_dump(),
        reporte=reporte_out,
        calificacion=calif_out,
    )


def crear_ticket(db: Session, id_cliente: int, datos: TicketCrearIn) -> TicketOut:
    if not datos.categorias:
        raise HTTPException(
            status_code=400, detail="El ticket debe incluir al menos una categoría"
        )

    # Validar categorías existentes
    cats_db = list(
        db.scalars(
            select(Categoria).where(Categoria.id_categoria.in_(datos.categorias))
        ).all()
    )
    if len(cats_db) != len(set(datos.categorias)):
        raise HTTPException(
            status_code=400, detail="Una o más categorías especificadas no existen"
        )

    # Validar equipo si se envió
    if datos.id_equipo is not None:
        equipo = db.get(Equipo, datos.id_equipo)
        if not equipo:
            raise HTTPException(status_code=404, detail="El equipo especificado no existe")
        if equipo.id_cliente != id_cliente:
            raise HTTPException(
                status_code=400,
                detail="El equipo seleccionado no pertenece al cliente",
            )

    ticket = Ticket(
        titulo=datos.titulo,
        descripcion=datos.descripcion,
        modalidad=datos.modalidad,
        prioridad="Media",
        estado="Abierto",
        id_cliente=id_cliente,
        id_equipo=datos.id_equipo,
    )
    db.add(ticket)
    db.flush()

    for id_cat in datos.categorias:
        db.add(TicketCategoria(id_ticket=ticket.id_ticket, id_categoria=id_cat))

    registrar_historial(
        db=db,
        id_ticket=ticket.id_ticket,
        tipo_accion="Creacion",
        id_usuario=id_cliente,
        estado_nuevo="Abierto",
        detalles="Ticket creado",
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
            mensaje=f"Nuevo ticket #{ticket.id_ticket}: {ticket.titulo}",
        )

    db.commit()
    db.refresh(ticket)

    return armar_ticket_out(db, ticket)


def listar_tickets(
    db: Session,
    usuario: Usuario,
    estado: str | None = None,
    prioridad: str | None = None,
    id_tecnico: int | None = None,
) -> list[TicketOut]:
    query = select(Ticket)

    if usuario.rol == "Cliente":
        query = query.where(Ticket.id_cliente == usuario.id_usuario)
    elif usuario.rol == "Tecnico":
        query = query.where(Ticket.id_tecnico == usuario.id_usuario)
    elif usuario.rol == "Administrador" and id_tecnico is not None:
        query = query.where(Ticket.id_tecnico == id_tecnico)

    if estado:
        query = query.where(Ticket.estado == estado)
    if prioridad:
        query = query.where(Ticket.prioridad == prioridad)

    query = query.order_by(Ticket.fecha_creacion.desc())
    tickets = list(db.scalars(query).all())
    return [armar_ticket_out(db, t) for t in tickets]


def obtener_ticket(db: Session, usuario: Usuario, id_ticket: int) -> TicketDetalleOut:
    ticket = db.get(Ticket, id_ticket)
    validar_acceso_ticket(usuario, ticket)
    return armar_ticket_detalle_out(db, ticket)


def listar_historial(
    db: Session, usuario: Usuario, id_ticket: int
) -> list[HistorialOut]:
    ticket = db.get(Ticket, id_ticket)
    validar_acceso_ticket(usuario, ticket)

    stmt = (
        select(
            HistorialTicket,
            Usuario.nombre,
            Usuario.apellido,
        )
        .join(Usuario, HistorialTicket.id_usuario == Usuario.id_usuario)
        .where(HistorialTicket.id_ticket == id_ticket)
        .order_by(HistorialTicket.fecha_accion.asc())
    )
    filas = db.execute(stmt).all()

    historial = []
    for hist, nombre, apellido in filas:
        historial.append(
            HistorialOut(
                id_historial=hist.id_historial,
                id_ticket=hist.id_ticket,
                tipo_accion=hist.tipo_accion,
                estado_anterior=hist.estado_anterior,
                estado_nuevo=hist.estado_nuevo,
                fecha_accion=hist.fecha_accion,
                id_usuario=hist.id_usuario,
                usuario_nombre=f"{nombre} {apellido}",
                detalles=hist.detalles,
            )
        )
    return historial


def listar_comentarios(
    db: Session, usuario: Usuario, id_ticket: int
) -> list[ComentarioOut]:
    ticket = db.get(Ticket, id_ticket)
    validar_acceso_ticket(usuario, ticket)

    query = (
        select(Comentario, Usuario.nombre, Usuario.apellido, Usuario.rol)
        .join(Usuario, Comentario.id_usuario == Usuario.id_usuario)
        .where(Comentario.id_ticket == id_ticket)
    )

    if usuario.rol == "Cliente":
        query = query.where(Comentario.es_nota_interna == False)

    query = query.order_by(Comentario.fecha_creacion.asc())
    filas = db.execute(query).all()

    comentarios = []
    for com, nombre, apellido, rol in filas:
        comentarios.append(
            ComentarioOut(
                id_comentario=com.id_comentario,
                id_ticket=com.id_ticket,
                contenido=com.contenido,
                es_nota_interna=com.es_nota_interna,
                fecha_creacion=com.fecha_creacion,
                id_usuario=com.id_usuario,
                usuario_nombre=f"{nombre} {apellido}",
                rol=rol.lower(),
            )
        )
    return comentarios


def crear_comentario(
    db: Session, usuario: Usuario, id_ticket: int, datos: ComentarioCrearIn
) -> ComentarioOut:
    ticket = db.get(Ticket, id_ticket)
    validar_acceso_ticket(usuario, ticket)

    # Cliente no puede escribir notas internas (se fuerza False)
    es_nota_interna = False if usuario.rol == "Cliente" else datos.es_nota_interna

    comentario = Comentario(
        contenido=datos.contenido,
        es_nota_interna=es_nota_interna,
        id_usuario=usuario.id_usuario,
        id_ticket=id_ticket,
    )
    db.add(comentario)

    detalles_hist = "Nota interna agregada" if es_nota_interna else "Comentario agregado"
    registrar_historial(
        db=db,
        id_ticket=id_ticket,
        tipo_accion="Comentario",
        id_usuario=usuario.id_usuario,
        detalles=detalles_hist,
    )

    # Notificaciones según sección 3.7
    # Comentario: la otra parte del ticket (si lo escribe cliente -> técnico; si lo escribe técnico -> cliente salvo en notas internas)
    if not es_nota_interna:
        if usuario.id_usuario == ticket.id_cliente and ticket.id_tecnico:
            notificar(
                db=db,
                id_usuario_destino=ticket.id_tecnico,
                id_ticket=id_ticket,
                tipo="Comentario",
                mensaje=f"Nuevo comentario en ticket #{id_ticket}",
            )
        elif usuario.id_usuario == ticket.id_tecnico:
            notificar(
                db=db,
                id_usuario_destino=ticket.id_cliente,
                id_ticket=id_ticket,
                tipo="Comentario",
                mensaje=f"Nuevo comentario en ticket #{id_ticket}",
            )
        elif usuario.rol == "Administrador":
            if ticket.id_cliente != usuario.id_usuario:
                notificar(
                    db=db,
                    id_usuario_destino=ticket.id_cliente,
                    id_ticket=id_ticket,
                    tipo="Comentario",
                    mensaje=f"Nuevo comentario en ticket #{id_ticket}",
                )
            if ticket.id_tecnico and ticket.id_tecnico != usuario.id_usuario:
                notificar(
                    db=db,
                    id_usuario_destino=ticket.id_tecnico,
                    id_ticket=id_ticket,
                    tipo="Comentario",
                    mensaje=f"Nuevo comentario en ticket #{id_ticket}",
                )

    db.commit()
    db.refresh(comentario)

    return ComentarioOut(
        id_comentario=comentario.id_comentario,
        id_ticket=comentario.id_ticket,
        contenido=comentario.contenido,
        es_nota_interna=comentario.es_nota_interna,
        fecha_creacion=comentario.fecha_creacion,
        id_usuario=usuario.id_usuario,
        usuario_nombre=f"{usuario.nombre} {usuario.apellido}",
        rol=usuario.rol.lower(),
    )
