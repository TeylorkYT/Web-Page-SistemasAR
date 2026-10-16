from typing import Optional

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decodificar_token
from app.db.database import get_db
from app.models.usuario import Usuario
from app.services import usuario_service

esquema = HTTPBearer(auto_error=False)


def usuario_actual(
    credenciales: Optional[HTTPAuthorizationCredentials] = Depends(esquema),
    db: Session = Depends(get_db),
) -> Usuario:
    if credenciales is None:
        raise HTTPException(status_code=401, detail="Token inválido o vencido")
    try:
        datos = decodificar_token(credenciales.credentials, "access")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido o vencido")

    usuario = usuario_service.obtener_por_id(db, int(datos["sub"]))
    if usuario is None or usuario.estado != "Activo":
        raise HTTPException(status_code=401, detail="Token inválido o vencido")
    return usuario


def requiere_roles(*roles: str):
    def verificar(usuario: Usuario = Depends(usuario_actual)) -> Usuario:
        if usuario.rol not in roles:
            raise HTTPException(status_code=403, detail="No tienes permiso para esta acción")
        return usuario

    return verificar
