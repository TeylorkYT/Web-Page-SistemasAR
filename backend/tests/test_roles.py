from datetime import date
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
import pytest

from app.core.deps import requiere_roles, usuario_actual
from app.models.usuario import Usuario

# App de prueba pequeña con endpoint protegido
app_roles = FastAPI()


@app_roles.get("/solo-admin")
def solo_admin(usuario: Usuario = Depends(requiere_roles("Administrador"))):
    return {"mensaje": f"Hola {usuario.nombre}, eres Administrador"}


def _crear_usuario_mock(id_usuario: int, rol: str, estado: str = "Activo") -> Usuario:
    return Usuario(
        id_usuario=id_usuario,
        nombre="Usuario",
        apellido="Test",
        correo_electronico=f"{rol.lower()}@prueba.com",
        contrasena="hash",
        rol=rol,
        fecha_registro=date(2026, 1, 1),
        estado=estado,
    )


def test_administrador_accede_a_ruta_protegida():
    client = TestClient(app_roles)
    app_roles.dependency_overrides[usuario_actual] = lambda: _crear_usuario_mock(1, "Administrador")
    try:
        respuesta = client.get("/solo-admin")
        assert respuesta.status_code == 200
        assert "Hola Usuario" in respuesta.json()["mensaje"]
    finally:
        app_roles.dependency_overrides.clear()


def test_cliente_recibe_403_en_ruta_administrador():
    client = TestClient(app_roles)
    app_roles.dependency_overrides[usuario_actual] = lambda: _crear_usuario_mock(2, "Cliente")
    try:
        respuesta = client.get("/solo-admin")
        assert respuesta.status_code == 403
        assert respuesta.json() == {"detail": "No tienes permiso para esta acción"}
    finally:
        app_roles.dependency_overrides.clear()


def test_tecnico_recibe_403_en_ruta_administrador():
    client = TestClient(app_roles)
    app_roles.dependency_overrides[usuario_actual] = lambda: _crear_usuario_mock(3, "Tecnico")
    try:
        respuesta = client.get("/solo-admin")
        assert respuesta.status_code == 403
        assert respuesta.json() == {"detail": "No tienes permiso para esta acción"}
    finally:
        app_roles.dependency_overrides.clear()
