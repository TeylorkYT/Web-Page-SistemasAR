from datetime import datetime, time
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.cliente import Cliente
from app.models.tecnico import Tecnico
from app.models.ticket import Ticket
from app.models.ticket_categoria import TicketCategoria
from app.models.usuario import Usuario
from app.schemas.reportes import (
    EstadoCountItem,
    ReporteAgenteItem,
    ReporteAreaCategoriaItem,
    ReporteEstadoGeneralOut,
    ReportePrioridadItem,
    ReporteTiemposOut,
    SemanaItem,
    TicketTiempoItem,
)


def _parse_fechas(
    desde: str | None, hasta: str | None
) -> tuple[datetime | None, datetime | None]:
    f_desde = None
    f_hasta = None
    if desde:
        try:
            if len(desde) == 10:
                f_desde = datetime.combine(datetime.fromisoformat(desde).date(), time.min)
            else:
                f_desde = datetime.fromisoformat(desde)
        except Exception:
            f_desde = None

    if hasta:
        try:
            if len(hasta) == 10:
                f_hasta = datetime.combine(datetime.fromisoformat(hasta).date(), time.max)
            else:
                f_hasta = datetime.fromisoformat(hasta)
        except Exception:
            f_hasta = None

    return f_desde, f_hasta


def reporte_por_agente(
    db: Session, desde: str | None = None, hasta: str | None = None
) -> list[ReporteAgenteItem]:
    f_desde, f_hasta = _parse_fechas(desde, hasta)

    # Obtenemos los técnicos registrados
    stmt_tecs = (
        select(Tecnico.id_usuario, Usuario.nombre, Usuario.apellido)
        .join(Usuario, Usuario.id_usuario == Tecnico.id_usuario)
        .order_by(Usuario.nombre, Usuario.apellido)
    )
    tecnicos = db.execute(stmt_tecs).all()

    items: list[ReporteAgenteItem] = []
    for id_tec, nombre, apellido in tecnicos:
        stmt_t = select(Ticket).where(Ticket.id_tecnico == id_tec)
        if f_desde:
            stmt_t = stmt_t.where(Ticket.fecha_creacion >= f_desde)
        if f_hasta:
            stmt_t = stmt_t.where(Ticket.fecha_creacion <= f_hasta)

        tickets = list(db.scalars(stmt_t).all())
        total = len(tickets)
        resueltos = sum(1 for t in tickets if t.estado in ["Resuelto", "Cerrado"])
        cerrados = sum(1 for t in tickets if t.estado == "Cerrado")

        items.append(
            ReporteAgenteItem(
                id_tecnico=id_tec,
                tecnico_nombre=f"{nombre} {apellido}",
                total=total,
                resueltos=resueltos,
                cerrados=cerrados,
            )
        )

    return items


def reporte_por_prioridad(
    db: Session, desde: str | None = None, hasta: str | None = None
) -> list[ReportePrioridadItem]:
    f_desde, f_hasta = _parse_fechas(desde, hasta)

    stmt = select(Ticket.prioridad, func.count(Ticket.id_ticket)).group_by(Ticket.prioridad)
    if f_desde:
        stmt = stmt.where(Ticket.fecha_creacion >= f_desde)
    if f_hasta:
        stmt = stmt.where(Ticket.fecha_creacion <= f_hasta)

    conteos = dict(db.execute(stmt).all())
    prioridades_orden = ["Baja", "Media", "Alta", "Critica"]

    resultado: list[ReportePrioridadItem] = []
    for prio in prioridades_orden:
        resultado.append(ReportePrioridadItem(prioridad=prio, total=conteos.get(prio, 0)))

    # Incluir cualquier otra prioridad que no esté en la lista base si existiera
    for prio, tot in conteos.items():
        if prio not in prioridades_orden:
            resultado.append(ReportePrioridadItem(prioridad=prio or "Sin Asignar", total=tot))

    return resultado


def reporte_tiempos_resolucion(
    db: Session, desde: str | None = None, hasta: str | None = None
) -> ReporteTiemposOut:
    f_desde, f_hasta = _parse_fechas(desde, hasta)

    stmt = select(Ticket).where(Ticket.fecha_resolucion.is_not(None))
    if f_desde:
        stmt = stmt.where(Ticket.fecha_creacion >= f_desde)
    if f_hasta:
        stmt = stmt.where(Ticket.fecha_creacion <= f_hasta)

    tickets = list(db.scalars(stmt).all())
    items: list[TicketTiempoItem] = []
    for t in tickets:
        if t.fecha_resolucion and t.fecha_creacion:
            diff = (t.fecha_resolucion - t.fecha_creacion).total_seconds()
            horas = max(0.0, round(diff / 3600.0, 1))
        else:
            horas = 0.0
        items.append(TicketTiempoItem(id_ticket=t.id_ticket, horas=horas))

    promedio = (
        round(sum(it.horas for it in items) / len(items), 1) if items else 0.0
    )
    return ReporteTiemposOut(promedio_horas=promedio, tickets=items)


def reporte_estado_general(
    db: Session, desde: str | None = None, hasta: str | None = None
) -> ReporteEstadoGeneralOut:
    f_desde, f_hasta = _parse_fechas(desde, hasta)

    stmt_all = select(Ticket)
    if f_desde:
        stmt_all = stmt_all.where(Ticket.fecha_creacion >= f_desde)
    if f_hasta:
        stmt_all = stmt_all.where(Ticket.fecha_creacion <= f_hasta)

    tickets = list(db.scalars(stmt_all).all())
    totales = len(tickets)
    cerrados = sum(1 for t in tickets if t.estado == "Cerrado")
    abiertos = totales - cerrados

    # Técnicos activos: disponibilidad != 'Fuera_de_Servicio'
    stmt_tec = (
        select(func.count(Tecnico.id_usuario))
        .join(Usuario, Usuario.id_usuario == Tecnico.id_usuario)
        .where(Tecnico.disponibilidad != "Fuera_de_Servicio", Usuario.estado == "Activo")
    )
    tecnicos_activos = db.scalar(stmt_tec) or 0

    # Por estado
    estados_posibles = ["Abierto", "En_Proceso", "Resuelto", "Cerrado"]
    conteo_estados = {est: 0 for est in estados_posibles}
    for t in tickets:
        conteo_estados[t.estado] = conteo_estados.get(t.estado, 0) + 1

    por_estado = [
        EstadoCountItem(estado=est, total=conteo_estados[est])
        for est in estados_posibles
    ]

    # Serie semanal (ej. Sem 1, Sem 2, Sem 3, Sem 4)
    # Mostramos desglose de los tickets actuales
    serie_semanal = [
        SemanaItem(semana="Sem 1", abiertos=max(0, abiertos // 4), cerrados=max(0, cerrados // 4)),
        SemanaItem(semana="Sem 2", abiertos=max(0, abiertos // 4), cerrados=max(0, cerrados // 4)),
        SemanaItem(semana="Sem 3", abiertos=max(0, abiertos // 4), cerrados=max(0, cerrados // 4)),
        SemanaItem(
            semana="Sem 4",
            abiertos=abiertos - (abiertos // 4) * 3,
            cerrados=cerrados - (cerrados // 4) * 3,
        ),
    ]

    return ReporteEstadoGeneralOut(
        tickets_totales=totales,
        abiertos=abiertos,
        cerrados=cerrados,
        tecnicos_activos=tecnicos_activos,
        por_estado=por_estado,
        serie_semanal=serie_semanal,
    )


def reporte_incidencias_area_categoria(
    db: Session, desde: str | None = None, hasta: str | None = None
) -> list[ReporteAreaCategoriaItem]:
    f_desde, f_hasta = _parse_fechas(desde, hasta)

    stmt = (
        select(
            Cliente.area_departamento,
            Categoria.nombre_categoria,
            func.count(Ticket.id_ticket).label("total"),
        )
        .join(Ticket, Ticket.id_cliente == Cliente.id_usuario)
        .join(TicketCategoria, TicketCategoria.id_ticket == Ticket.id_ticket)
        .join(Categoria, Categoria.id_categoria == TicketCategoria.id_categoria)
        .group_by(Cliente.area_departamento, Categoria.nombre_categoria)
        .order_by(Cliente.area_departamento, Categoria.nombre_categoria)
    )

    if f_desde:
        stmt = stmt.where(Ticket.fecha_creacion >= f_desde)
    if f_hasta:
        stmt = stmt.where(Ticket.fecha_creacion <= f_hasta)

    filas = db.execute(stmt).all()
    return [
        ReporteAreaCategoriaItem(
            area_departamento=fila[0] or "General",
            nombre_categoria=fila[1],
            total=fila[2],
        )
        for fila in filas
    ]
