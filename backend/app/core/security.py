from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core import config


def hashear_contrasena(contrasena: str) -> str:
    return bcrypt.hashpw(contrasena.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_contrasena(contrasena: str, hash_guardado: str) -> bool:
    try:
        return bcrypt.checkpw(contrasena.encode("utf-8"), hash_guardado.encode("utf-8"))
    except ValueError:
        # hash inválido (por ejemplo HASH_PENDIENTE) o contraseña demasiado larga
        return False


def _crear_token(id_usuario: int, rol: str, tipo: str, vigencia: timedelta) -> str:
    ahora = datetime.now(timezone.utc)
    datos = {
        "sub": str(id_usuario),
        "rol": rol,
        "tipo": tipo,
        "iat": ahora,
        "exp": ahora + vigencia,
    }
    secret = config.JWT_SECRET or "clave-secreta-jwt-sistemas-ar-desarrollo-local"
    return jwt.encode(datos, secret, algorithm=config.JWT_ALGORITHM)


def crear_access_token(id_usuario: int, rol: str) -> str:
    return _crear_token(id_usuario, rol, "access", timedelta(minutes=config.ACCESS_TOKEN_MINUTES))


def crear_refresh_token(id_usuario: int, rol: str) -> str:
    return _crear_token(id_usuario, rol, "refresh", timedelta(days=config.REFRESH_TOKEN_DAYS))


def decodificar_token(token: str, tipo: str) -> dict:
    secret = config.JWT_SECRET or "clave-secreta-jwt-sistemas-ar-desarrollo-local"
    datos = jwt.decode(token, secret, algorithms=[config.JWT_ALGORITHM])
    if datos.get("tipo") != tipo:
        raise jwt.InvalidTokenError("Tipo de token incorrecto")
    return datos
