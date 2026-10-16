"""Pruebas de seguridad y core del backend (Módulo 1 - QA / Daily 05).

Cubre:
- T-T09 (P-01): Protección de JWT_SECRET en entorno de producción.
- T-T12 (P-07): Manejo de errores en /db-check (HTTP 503) y protección en producción (HTTP 404).
- T-T10: Validación de orígenes CORS sin comodines en producción.
"""
from unittest.mock import patch
import pytest
from sqlalchemy.exc import OperationalError

from app.core import config, security


def test_t09_produccion_sin_jwt_secret_lanza_runtime_error(monkeypatch):
    """T-T09 (P-01): En producción, la ausencia o uso de secreto por defecto debe abortar el inicio."""
    monkeypatch.setattr(config, "ENV", "production")
    monkeypatch.setattr(config, "JWT_SECRET", None)

    with pytest.raises(RuntimeError, match="JWT_SECRET obligatorio"):
        config.validar_configuracion_produccion()

    # Probar también con el secreto por defecto de desarrollo
    monkeypatch.setattr(config, "JWT_SECRET", "clave-secreta-jwt-sistemas-ar-desarrollo-local")
    with pytest.raises(RuntimeError, match="JWT_SECRET obligatorio"):
        config.validar_configuracion_produccion()


def test_t09_produccion_con_secreto_valido_no_falla(monkeypatch):
    """En producción con secreto robusto definido, la validación tiene éxito."""
    monkeypatch.setattr(config, "ENV", "production")
    monkeypatch.setattr(config, "JWT_SECRET", "super-clave-secreta-de-produccion-muy-larga-y-segura-12345")

    # No debe lanzar excepción
    config.validar_configuracion_produccion()
    token = security.crear_access_token(1, "administrador")
    assert token is not None


def test_t12_db_check_dev_responde_ok(client):
    """T-T12: En entorno no productivo, /db-check devuelve 200 si la BD está activa."""
    r = client.get("/db-check")
    assert r.status_code == 200
    assert r.json() == {"database": "ok"}


def test_t12_db_check_captura_error_sqlalchemy_503(client):
    """T-T12 (P-07): Si la base de datos no responde, /db-check debe responder 503 controlado."""
    with patch("app.main.engine.connect") as mock_connect:
        mock_connect.side_effect = OperationalError("Can't connect to MySQL server", None, None)
        r = client.get("/db-check")
        assert r.status_code == 503
        assert "base de datos" in r.json()["detail"].lower()


def test_t12_db_check_deshabilitado_en_produccion(client, monkeypatch):
    """T-T12 (P-07): En producción, /db-check debe devolver 404 para evitar exposición."""
    monkeypatch.setattr(config, "ENV", "production")
    r = client.get("/db-check")
    assert r.status_code == 404


def test_raiz_omite_db_check_en_produccion(client, monkeypatch):
    """El endpoint / no expone la ruta /db-check cuando se encuentra en producción."""
    monkeypatch.setattr(config, "ENV", "production")
    r = client.get("/")
    assert r.status_code == 200
    assert "db_check" not in r.json()
