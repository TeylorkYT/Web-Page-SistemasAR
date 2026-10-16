"""Regresiones de validación de entrada (auditoría QA)."""
import pytest

REG = dict(
    nombre="Ana", apellido="Pérez", correo_electronico="ana@ejemplo.com",
    contrasena="Prueba123*", telefono="3001112233", direccion="Calle 1",
)


@pytest.mark.parametrize("correo", ["abc", "a@b", "a b@c.com", "@x.com", ""])
def test_registro_rechaza_correo_invalido(client, correo):
    r = client.post("/api/v1/auth/register", json={**REG, "correo_electronico": correo})
    assert r.status_code == 422


def test_registro_rechaza_nombre_solo_espacios(client):
    r = client.post("/api/v1/auth/register", json={**REG, "nombre": "   ", "correo_electronico": "n1@ejemplo.com"})
    assert r.status_code == 422


def test_registro_rechaza_clave_multibyte_mayor_72_bytes(client):
    r = client.post("/api/v1/auth/register", json={**REG, "correo_electronico": "n2@ejemplo.com", "contrasena": "ñ" * 40})
    assert r.status_code == 422


def test_correo_se_normaliza_a_minusculas(client):
    r = client.post("/api/v1/auth/register", json={**REG, "correo_electronico": "  MAYUS@Ejemplo.COM "})
    assert r.status_code == 201
    assert r.json()["correo_electronico"] == "mayus@ejemplo.com"
    login = client.post("/api/v1/auth/login", json={"correo_electronico": "MAYUS@EJEMPLO.COM", "contrasena": "Prueba123*"})
    assert login.status_code == 200


@pytest.mark.parametrize("param", ["desde", "hasta"])
def test_reportes_rechaza_fecha_invalida(client, param):
    t = client.post("/api/v1/auth/login", json={"correo_electronico": "admin@prueba.com", "contrasena": "Prueba123*"}).json()["access_token"]
    r = client.get(f"/api/v1/reportes/por_agente?{param}=basura", headers={"Authorization": f"Bearer {t}"})
    assert r.status_code == 400
