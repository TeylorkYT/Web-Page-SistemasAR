import time
from collections import defaultdict
import jwt
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import usuario_actual
from app.core.security import (
    crear_access_token,
    crear_refresh_token,
    crear_reset_token,
    decodificar_token,
    hashear_contrasena,
    verificar_contrasena,
    verificar_reset_token,
)
from app.db.database import get_db
from app.models.cliente import Cliente
from app.models.usuario import Usuario
from app.schemas.auth import LoginIn, PerfilActualizarIn, PerfilOut, RefreshIn, TokenOut
from app.schemas.usuario import RecuperarIn, RegistroClienteIn, RestablecerIn, UsuarioOut
from app.services import email_service, usuario_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Registro de solicitudes de recuperación en memoria (clave: correo normalizado, valor: lista de timestamps)
_solicitudes_recuperacion: dict[str, list[float]] = defaultdict(list)
_LIMITE_SOLICITUDES = 5
_VENTANA_SEGUNDOS = 900  # 15 minutos


def _tokens(usuario: Usuario) -> TokenOut:
    return TokenOut(
        access_token=crear_access_token(usuario.id_usuario, usuario.rol),
        refresh_token=crear_refresh_token(usuario.id_usuario, usuario.rol),
        rol=usuario.rol.lower(),
        nombre=f"{usuario.nombre} {usuario.apellido}",
    )


@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registrar(datos: RegistroClienteIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    nuevo_usuario = usuario_service.registrar_cliente(db, datos)
    background_tasks.add_task(
        email_service.enviar_correo_bienvenida,
        destinatario=nuevo_usuario.correo_electronico,
        nombre=nuevo_usuario.nombre,
    )
    return nuevo_usuario


@router.post("/recuperar")
def recuperar(datos: RecuperarIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    correo = datos.correo_electronico.strip().lower()
    ahora = time.time()

    # Limitar abuso de recuperación (máx 5 por 15 min)
    timestamps = [t for t in _solicitudes_recuperacion[correo] if ahora - t < _VENTANA_SEGUNDOS]
    if len(timestamps) >= _LIMITE_SOLICITUDES:
        # Respondemos el mismo mensaje neutral sin confirmar bloqueo
        return {"detail": "Si el correo existe, recibirás instrucciones"}

    timestamps.append(ahora)
    _solicitudes_recuperacion[correo] = timestamps

    usuario = usuario_service.obtener_por_correo(db, correo)
    if usuario and usuario.estado == "Activo":
        token_reset = crear_reset_token(usuario.id_usuario, usuario.contrasena)
        background_tasks.add_task(
            email_service.enviar_correo_recuperacion,
            destinatario=usuario.correo_electronico,
            nombre=usuario.nombre,
            token_reset=token_reset,
        )

    # Respuesta idéntica exista o no la cuenta (anti-enumeración de usuarios)
    return {"detail": "Si el correo existe, recibirás instrucciones"}


@router.post("/restablecer")
def restablecer(datos: RestablecerIn, db: Session = Depends(get_db)):
    try:
        # Decodificamos el sub (id_usuario) sin verificar aún para obtener el usuario y su hash actual
        secreto = jwt.get_unverified_claims(datos.token) if hasattr(jwt, "get_unverified_claims") else jwt.decode(datos.token, options={"verify_signature": False})
        id_usuario = int(secreto.get("sub", 0))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enlace de recuperación inválido o expirado",
        )

    usuario = usuario_service.obtener_por_id(db, id_usuario)
    if not usuario or usuario.estado != "Activo":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enlace de recuperación inválido o expirado",
        )

    try:
        verificar_reset_token(datos.token, usuario.contrasena)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enlace de recuperación inválido o expirado",
        )

    # Actualizamos la contraseña con un nuevo hash (lo que también invalida inmediatamente este token)
    usuario.contrasena = hashear_contrasena(datos.contrasena)
    db.commit()

    return {"detail": "Contraseña restablecida exitosamente"}


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, db: Session = Depends(get_db)):
    usuario = usuario_service.obtener_por_correo(db, datos.correo_electronico)
    if (
        usuario is None
        or not verificar_contrasena(datos.contrasena, usuario.contrasena)
        or usuario.estado != "Activo"
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )
    return _tokens(usuario)



@router.post("/refresh", response_model=TokenOut)
def refrescar(datos: RefreshIn, db: Session = Depends(get_db)):
    try:
        contenido = decodificar_token(datos.refresh_token, "refresh")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Refresh token inválido o vencido")

    usuario = usuario_service.obtener_por_id(db, int(contenido["sub"]))
    if usuario is None or usuario.estado != "Activo":
        raise HTTPException(status_code=401, detail="Refresh token inválido o vencido")
    return _tokens(usuario)


@router.get("/me", response_model=PerfilOut)
def perfil(usuario: Usuario = Depends(usuario_actual), db: Session = Depends(get_db)):
    telefono = None
    direccion = None
    area_departamento = None
    if usuario.rol == "Cliente":
        cli = db.query(Cliente).filter(Cliente.id_usuario == usuario.id_usuario).first()
        if cli:
            telefono = cli.telefono
            direccion = cli.direccion
            area_departamento = cli.area_departamento

    return PerfilOut(
        id_usuario=usuario.id_usuario,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo_electronico=usuario.correo_electronico,
        rol=usuario.rol.lower(),
        fecha_registro=usuario.fecha_registro,
        telefono=telefono,
        direccion=direccion,
        area_departamento=area_departamento,
    )


@router.put("/me", response_model=PerfilOut)
def actualizar_perfil(
    datos: PerfilActualizarIn,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    if datos.nombre is not None and datos.nombre.strip():
        usuario.nombre = datos.nombre.strip()
    if datos.apellido is not None and datos.apellido.strip():
        usuario.apellido = datos.apellido.strip()

    telefono = None
    direccion = None
    area_departamento = None

    if usuario.rol == "Cliente":
        cli = db.query(Cliente).filter(Cliente.id_usuario == usuario.id_usuario).first()
        if not cli:
            cli = Cliente(
                id_usuario=usuario.id_usuario,
                telefono=datos.telefono.strip() if datos.telefono else "",
                direccion=datos.direccion.strip() if datos.direccion else "",
                area_departamento=datos.area_departamento.strip() if datos.area_departamento else "General",
            )
            db.add(cli)
        else:
            if datos.telefono is not None:
                cli.telefono = datos.telefono.strip()
            if datos.direccion is not None:
                cli.direccion = datos.direccion.strip()
            if datos.area_departamento is not None:
                cli.area_departamento = datos.area_departamento.strip()
        db.flush()
        telefono = cli.telefono
        direccion = cli.direccion
        area_departamento = cli.area_departamento

    db.commit()
    db.refresh(usuario)

    return PerfilOut(
        id_usuario=usuario.id_usuario,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo_electronico=usuario.correo_electronico,
        rol=usuario.rol.lower(),
        fecha_registro=usuario.fecha_registro,
        telefono=telefono,
        direccion=direccion,
        area_departamento=area_departamento,
    )
