def _auth_headers(client, correo):
    resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo, "contrasena": "Prueba123*"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ==========================================
# BE-M1: Registro y Recuperar
# ==========================================
def test_registro_cliente_y_validaciones(client):
    # 1. Registro exitoso
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "nombre": "Esteban",
            "apellido": "Gomez",
            "correo_electronico": "esteban@prueba.com",
            "contrasena": "Password123*",
            "telefono": "3109876543",
            "direccion": "Av Siempre Viva 742",
            "area_departamento": "Finanzas",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["correo_electronico"] == "esteban@prueba.com"
    assert data["rol"] == "cliente"  # En minúscula según contrato
    assert data["estado"] == "Activo"
    assert data["telefono"] == "3109876543"
    assert data["direccion"] == "Av Siempre Viva 742"
    assert data["area_departamento"] == "Finanzas"

    # 2. Correo duplicado responde 409
    resp_dup = client.post(
        "/api/v1/auth/register",
        json={
            "nombre": "Otro",
            "apellido": "Usuario",
            "correo_electronico": "esteban@prueba.com",
            "contrasena": "Password123*",
            "telefono": "3000000000",
            "direccion": "Calle 2",
        },
    )
    assert resp_dup.status_code == 409
    assert resp_dup.json() == {"detail": "El correo ya está registrado"}

    # 3. Contraseña corta responde 422
    resp_corta = client.post(
        "/api/v1/auth/register",
        json={
            "nombre": "Corto",
            "apellido": "Pass",
            "correo_electronico": "corto@prueba.com",
            "contrasena": "12345",  # menos de 8 chars
            "telefono": "3000000000",
            "direccion": "Calle 2",
        },
    )
    assert resp_corta.status_code == 422


def test_recuperar_contrasena(client):
    resp = client.post(
        "/api/v1/auth/recuperar",
        json={"correo_electronico": "cualquiera@prueba.com"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"detail": "Si el correo existe, recibirás instrucciones"}


# ==========================================
# BE-M2: CRUD de Usuarios (Administrador)
# ==========================================
def test_crud_usuarios_admin(client):
    admin_headers = _auth_headers(client, "admin@prueba.com")
    cliente_headers = _auth_headers(client, "cliente@prueba.com")

    # 1. Cliente no puede listar usuarios (403)
    resp = client.get("/api/v1/usuarios", headers=cliente_headers)
    assert resp.status_code == 403

    # 2. Admin lista usuarios
    resp = client.get("/api/v1/usuarios", headers=admin_headers)
    assert resp.status_code == 200
    usuarios = resp.json()
    assert len(usuarios) >= 3

    # 3. Admin crea un nuevo técnico
    resp = client.post(
        "/api/v1/usuarios",
        headers=admin_headers,
        json={
            "nombre": "Marcos",
            "apellido": "Soporte",
            "correo_electronico": "marcos.tec@prueba.com",
            "contrasena": "ClaveSegura123*",
            "rol": "tecnico",
            "especialidad": "Redes y Servidores",
            "disponibilidad": "Disponible",
        },
    )
    assert resp.status_code == 201
    tec_data = resp.json()
    id_marcos = tec_data["id_usuario"]
    assert tec_data["rol"] == "tecnico"
    assert tec_data["especialidad"] == "Redes y Servidores"

    # 4. Admin actualiza datos de marcos
    resp = client.put(
        f"/api/v1/usuarios/{id_marcos}",
        headers=admin_headers,
        json={
            "especialidad": "Seguridad Informática",
            "disponibilidad": "Ocupado",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["especialidad"] == "Seguridad Informática"
    assert resp.json()["disponibilidad"] == "Ocupado"

    # 5. Admin NO puede inactivarse a sí mismo (400)
    # admin@prueba.com tiene id_usuario = 1
    resp = client.put(
        "/api/v1/usuarios/1",
        headers=admin_headers,
        json={"estado": "Inactivo"},
    )
    assert resp.status_code == 400
    assert resp.json() == {"detail": "Un administrador no puede inactivarse a sí mismo"}
