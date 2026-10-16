from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria
from app.models.cliente import Cliente
from app.models.equipo import Equipo
from app.models.tecnico import Tecnico
from app.models.ticket import Ticket
from app.models.usuario import Usuario
from app.schemas.catalogo import CategoriaIn, EquipoIn, EquipoUpdateIn


# ==========================================
# Categorías
# ==========================================
def listar_categorias(db: Session) -> list[Categoria]:
    return list(db.scalars(select(Categoria).order_by(Categoria.nombre_categoria)).all())


def crear_categoria(db: Session, datos: CategoriaIn) -> Categoria:
    existente = db.scalar(
        select(Categoria).where(Categoria.nombre_categoria == datos.nombre_categoria)
    )
    if existente:
        raise HTTPException(
            status_code=409, detail="Ya existe una categoría con ese nombre"
        )

    categoria = Categoria(
        nombre_categoria=datos.nombre_categoria,
        descripcion=datos.descripcion,
    )
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


def actualizar_categoria(
    db: Session, id_categoria: int, datos: CategoriaIn
) -> Categoria:
    categoria = db.get(Categoria, id_categoria)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    existente = db.scalar(
        select(Categoria).where(
            Categoria.nombre_categoria == datos.nombre_categoria,
            Categoria.id_categoria != id_categoria,
        )
    )
    if existente:
        raise HTTPException(
            status_code=409, detail="Ya existe una categoría con ese nombre"
        )

    categoria.nombre_categoria = datos.nombre_categoria
    categoria.descripcion = datos.descripcion
    db.commit()
    db.refresh(categoria)
    return categoria


# ==========================================
# Equipos
# ==========================================
def listar_equipos(
    db: Session, usuario: Usuario, id_cliente_filtro: int | None = None
) -> list[Equipo]:
    query = select(Equipo)

    if usuario.rol == "Cliente":
        query = query.where(Equipo.id_cliente == usuario.id_usuario)
    elif usuario.rol == "Administrador" and id_cliente_filtro is not None:
        query = query.where(Equipo.id_cliente == id_cliente_filtro)

    return list(db.scalars(query.order_by(Equipo.id_equipo.desc())).all())


def crear_equipo(db: Session, usuario: Usuario, datos: EquipoIn) -> Equipo:
    if usuario.rol == "Cliente":
        id_cliente = usuario.id_usuario
    elif usuario.rol == "Administrador":
        if not datos.id_cliente:
            raise HTTPException(
                status_code=400,
                detail="El administrador debe especificar el id_cliente para el equipo",
            )
        cliente = db.get(Cliente, datos.id_cliente)
        if not cliente:
            raise HTTPException(status_code=404, detail="El cliente especificado no existe")
        id_cliente = datos.id_cliente
    else:
        raise HTTPException(
            status_code=403, detail="No tienes permisos para registrar equipos"
        )

    serial_existente = db.scalar(
        select(Equipo).where(Equipo.serial == datos.serial)
    )
    if serial_existente:
        raise HTTPException(
            status_code=409, detail="Ya existe un equipo con ese serial"
        )

    equipo = Equipo(
        tipo=datos.tipo,
        marca=datos.marca,
        modelo=datos.modelo,
        serial=datos.serial,
        sistema_operativo=datos.sistema_operativo,
        area_departamento=datos.area_departamento,
        id_cliente=id_cliente,
    )
    db.add(equipo)
    db.commit()
    db.refresh(equipo)
    return equipo


def actualizar_equipo(
    db: Session, usuario: Usuario, id_equipo: int, datos: EquipoUpdateIn
) -> Equipo:
    equipo = db.get(Equipo, id_equipo)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if usuario.rol == "Cliente" and equipo.id_cliente != usuario.id_usuario:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if usuario.rol not in ["Cliente", "Administrador"]:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para modificar equipos"
        )

    if datos.serial and datos.serial != equipo.serial:
        serial_existente = db.scalar(
            select(Equipo).where(
                Equipo.serial == datos.serial, Equipo.id_equipo != id_equipo
            )
        )
        if serial_existente:
            raise HTTPException(
                status_code=409, detail="Ya existe un equipo con ese serial"
            )

    update_data = datos.model_dump(exclude_unset=True)
    for campo, valor in update_data.items():
        setattr(equipo, campo, valor)

    db.commit()
    db.refresh(equipo)
    return equipo


# ==========================================
# Técnicos
# ==========================================
def listar_tecnicos(db: Session) -> list[dict]:
    # Consulta uniendo Usuario y Tecnico, calculando cantidad de tickets en estado 'En_Proceso'
    conteo_subquery = (
        select(
            Ticket.id_tecnico,
            func.count(Ticket.id_ticket).label("tickets_en_proceso"),
        )
        .where(Ticket.estado == "En_Proceso")
        .group_by(Ticket.id_tecnico)
        .subquery()
    )

    stmt = (
        select(
            Usuario.id_usuario,
            Usuario.nombre,
            Usuario.apellido,
            Tecnico.especialidad,
            Tecnico.disponibilidad,
            func.coalesce(conteo_subquery.c.tickets_en_proceso, 0).label(
                "tickets_en_proceso"
            ),
        )
        .join(Tecnico, Usuario.id_usuario == Tecnico.id_usuario)
        .outerjoin(
            conteo_subquery, Tecnico.id_usuario == conteo_subquery.c.id_tecnico
        )
        .where(Usuario.estado == "Activo")
        .order_by(Usuario.nombre, Usuario.apellido)
    )

    resultados = db.execute(stmt).all()
    tecnicos = []
    for row in resultados:
        tecnicos.append(
            {
                "id_usuario": row.id_usuario,
                "nombre": row.nombre,
                "apellido": row.apellido,
                "especialidad": row.especialidad,
                "disponibilidad": row.disponibilidad,
                "tickets_en_proceso": int(row.tickets_en_proceso),
            }
        )
    return tecnicos
