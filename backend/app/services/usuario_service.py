from datetime import date

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hashear_contrasena
from app.models.administrador import Administrador
from app.models.cliente import Cliente
from app.models.tecnico import Tecnico
from app.models.usuario import Usuario
from app.schemas.usuario import (
    RegistroClienteIn,
    UsuarioCrearIn,
    UsuarioOut,
    UsuarioUpdateIn,
)


def obtener_por_correo(db: Session, correo: str) -> Usuario | None:
    return db.scalar(select(Usuario).where(Usuario.correo_electronico == correo))


def obtener_por_id(db: Session, id_usuario: int) -> Usuario | None:
    return db.get(Usuario, id_usuario)


def armar_usuario_out(db: Session, usuario: Usuario) -> UsuarioOut:
    telefono = None
    direccion = None
    area_departamento = None
    especialidad = None
    disponibilidad = None
    cargo = None

    if usuario.rol == "Cliente":
        subtipo = db.get(Cliente, usuario.id_usuario)
        if subtipo:
            telefono = subtipo.telefono
            direccion = subtipo.direccion
            area_departamento = subtipo.area_departamento
    elif usuario.rol == "Tecnico":
        subtipo = db.get(Tecnico, usuario.id_usuario)
        if subtipo:
            especialidad = subtipo.especialidad
            disponibilidad = subtipo.disponibilidad
    elif usuario.rol == "Administrador":
        subtipo = db.get(Administrador, usuario.id_usuario)
        if subtipo:
            cargo = subtipo.cargo

    return UsuarioOut(
        id_usuario=usuario.id_usuario,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo_electronico=usuario.correo_electronico,
        rol=usuario.rol.lower(),  # siempre en minúscula según contrato
        estado=usuario.estado,
        fecha_registro=usuario.fecha_registro,
        telefono=telefono,
        direccion=direccion,
        area_departamento=area_departamento,
        especialidad=especialidad,
        disponibilidad=disponibilidad,
        cargo=cargo,
    )


def registrar_cliente(db: Session, datos: RegistroClienteIn) -> UsuarioOut:
    if obtener_por_correo(db, datos.correo_electronico):
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo_electronico=datos.correo_electronico,
        contrasena=hashear_contrasena(datos.contrasena),
        rol="Cliente",
        fecha_registro=date.today(),
        estado="Activo",
    )
    db.add(usuario)
    db.flush()

    cliente = Cliente(
        id_usuario=usuario.id_usuario,
        telefono=datos.telefono,
        direccion=datos.direccion,
        area_departamento=datos.area_departamento or "General",
    )
    db.add(cliente)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El correo ya está registrado")
    db.refresh(usuario)

    return armar_usuario_out(db, usuario)


def listar_usuarios(
    db: Session, rol: str | None = None, estado: str | None = None
) -> list[UsuarioOut]:
    query = select(Usuario)
    if rol:
        query = query.where(Usuario.rol == rol.capitalize())
    if estado:
        query = query.where(Usuario.estado == estado.capitalize())

    usuarios = list(db.scalars(query.order_by(Usuario.id_usuario)).all())
    return [armar_usuario_out(db, u) for u in usuarios]


def crear_usuario_admin(db: Session, datos: UsuarioCrearIn) -> UsuarioOut:
    if obtener_por_correo(db, datos.correo_electronico):
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    rol_db = datos.rol.capitalize()
    if rol_db not in ["Cliente", "Tecnico", "Administrador"]:
        raise HTTPException(status_code=400, detail="Rol inválido")

    usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        correo_electronico=datos.correo_electronico,
        contrasena=hashear_contrasena(datos.contrasena),
        rol=rol_db,
        fecha_registro=date.today(),
        estado=datos.estado,
    )
    db.add(usuario)
    db.flush()

    if rol_db == "Cliente":
        subtipo = Cliente(
            id_usuario=usuario.id_usuario,
            telefono=datos.telefono or "",
            direccion=datos.direccion or "",
            area_departamento=datos.area_departamento or "General",
        )
    elif rol_db == "Tecnico":
        subtipo = Tecnico(
            id_usuario=usuario.id_usuario,
            especialidad=datos.especialidad or "Soporte General TI",
            disponibilidad=datos.disponibilidad or "Disponible",
        )
    else:
        subtipo = Administrador(
            id_usuario=usuario.id_usuario,
            cargo=datos.cargo or "Coordinador de Soporte TI",
        )

    db.add(subtipo)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El correo ya está registrado")
    db.refresh(usuario)

    return armar_usuario_out(db, usuario)


def actualizar_usuario_admin(
    db: Session, admin_actual: Usuario, id_usuario: int, datos: UsuarioUpdateIn
) -> UsuarioOut:
    usuario = db.get(Usuario, id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if admin_actual.id_usuario == id_usuario and datos.estado == "Inactivo":
        raise HTTPException(
            status_code=400, detail="Un administrador no puede inactivarse a sí mismo"
        )

    if (
        datos.correo_electronico
        and datos.correo_electronico != usuario.correo_electronico
    ):
        existente = obtener_por_correo(db, datos.correo_electronico)
        if existente and existente.id_usuario != id_usuario:
            raise HTTPException(status_code=409, detail="El correo ya está registrado")
        usuario.correo_electronico = datos.correo_electronico

    if datos.nombre is not None:
        usuario.nombre = datos.nombre
    if datos.apellido is not None:
        usuario.apellido = datos.apellido
    if datos.estado is not None:
        usuario.estado = datos.estado
    if datos.contrasena:
        usuario.contrasena = hashear_contrasena(datos.contrasena)

    if usuario.rol == "Cliente":
        cliente = db.get(Cliente, id_usuario)
        if cliente:
            if datos.telefono is not None:
                cliente.telefono = datos.telefono
            if datos.direccion is not None:
                cliente.direccion = datos.direccion
            if datos.area_departamento is not None:
                cliente.area_departamento = datos.area_departamento
    elif usuario.rol == "Tecnico":
        tecnico = db.get(Tecnico, id_usuario)
        if tecnico:
            if datos.especialidad is not None:
                tecnico.especialidad = datos.especialidad
            if datos.disponibilidad is not None:
                tecnico.disponibilidad = datos.disponibilidad
    elif usuario.rol == "Administrador":
        admin = db.get(Administrador, id_usuario)
        if admin:
            if datos.cargo is not None:
                admin.cargo = datos.cargo

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El correo ya está registrado")
    db.refresh(usuario)

    return armar_usuario_out(db, usuario)
