import jwt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import usuario_actual
from app.core.security import (
    crear_access_token,
    crear_refresh_token,
    decodificar_token,
    verificar_contrasena,
)
from app.db.database import get_db
from app.models.usuario import Usuario
from app.schemas.auth import LoginIn, PerfilOut, RefreshIn, TokenOut
from app.services import usuario_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _tokens(usuario: Usuario) -> TokenOut:
    return TokenOut(
        access_token=crear_access_token(usuario.id_usuario, usuario.rol),
        refresh_token=crear_refresh_token(usuario.id_usuario, usuario.rol),
        rol=usuario.rol.lower(),
        nombre=f"{usuario.nombre} {usuario.apellido}",
    )


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, db: Session = Depends(get_db)):
    usuario = usuario_service.obtener_por_correo(db, datos.correo_electronico)
    if usuario is None or not verificar_contrasena(datos.contrasena, usuario.contrasena):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    if usuario.estado != "Activo":
        raise HTTPException(status_code=403, detail="Cuenta inactiva")
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
def perfil(usuario: Usuario = Depends(usuario_actual)):
    return PerfilOut(
        id_usuario=usuario.id_usuario,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        correo_electronico=usuario.correo_electronico,
        rol=usuario.rol.lower(),
    )
