from datetime import timedelta
import jwt
import pytest

from app.core.security import (
    _crear_token,
    crear_access_token,
    crear_refresh_token,
    decodificar_token,
    hashear_contrasena,
    verificar_contrasena,
)


def test_hash_no_es_igual_a_texto_plano():
    clave = "Prueba123*"
    hash_clave = hashear_contrasena(clave)
    assert hash_clave != clave
    assert hash_clave.startswith("$2b$")


def test_verificar_contrasena_correcta_e_incorrecta():
    clave = "Prueba123*"
    hash_clave = hashear_contrasena(clave)
    assert verificar_contrasena(clave, hash_clave) is True
    assert verificar_contrasena("ClaveIncorrecta", hash_clave) is False


def test_verificar_contrasena_hash_invalido():
    assert verificar_contrasena("Prueba123*", "HASH_PENDIENTE") is False
    assert verificar_contrasena("Prueba123*", "invalido") is False
    assert verificar_contrasena("Prueba123*", "") is False


def test_access_token_se_decodifica_con_tipo_access():
    token = crear_access_token(id_usuario=1, rol="Administrador")
    datos = decodificar_token(token, tipo="access")
    assert datos["sub"] == "1"
    assert datos["rol"] == "Administrador"
    assert datos["tipo"] == "access"


def test_token_vencido_falla():
    token_vencido = _crear_token(
        id_usuario=1,
        rol="Cliente",
        tipo="access",
        vigencia=timedelta(seconds=-10),
    )
    with pytest.raises(jwt.ExpiredSignatureError):
        decodificar_token(token_vencido, tipo="access")


def test_refresh_token_no_se_acepta_como_access_token():
    refresh_token = crear_refresh_token(id_usuario=1, rol="Tecnico")
    with pytest.raises(jwt.InvalidTokenError, match="Tipo de token incorrecto"):
        decodificar_token(refresh_token, tipo="access")
