def _auth_headers(client, correo):
    resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo, "contrasena": "Prueba123*"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ==========================================
# C-0: registrar_historial
# ==========================================
def test_registrar_historial_service(client, test_engine):
    from sqlalchemy.orm import sessionmaker
    from app.services.historial_service import registrar_historial
    from app.models.historial_ticket import HistorialTicket
    from app.models.ticket import Ticket

    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as db:
        # Crear ticket para la prueba de historial
        ticket = Ticket(
            titulo="Ticket de prueba",
            descripcion="Descripción de prueba",
            id_cliente=3,
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        registrar_historial(
            db=db,
            id_ticket=ticket.id_ticket,
            tipo_accion="Creacion",
            id_usuario=3,
            estado_nuevo="Abierto",
            detalles="Ticket creado en test",
        )
        db.commit()

        hist = db.query(HistorialTicket).filter_by(id_ticket=ticket.id_ticket).first()
        assert hist is not None
        assert hist.tipo_accion == "Creacion"
        assert hist.estado_nuevo == "Abierto"
        assert hist.id_usuario == 3


# ==========================================
# Categorías
# ==========================================
def test_categorias_crud(client):
    admin_headers = _auth_headers(client, "admin@prueba.com")
    cliente_headers = _auth_headers(client, "cliente@prueba.com")

    # 1. Sin sesión responde 401
    resp = client.get("/api/v1/categorias")
    assert resp.status_code == 401

    # 2. Cliente no puede crear categoría (403)
    resp = client.post(
        "/api/v1/categorias",
        headers=cliente_headers,
        json={"nombre_categoria": "Hardware", "descripcion": "Problemas de hardware"},
    )
    assert resp.status_code == 403

    # 3. Administrador crea categoría (201)
    resp = client.post(
        "/api/v1/categorias",
        headers=admin_headers,
        json={"nombre_categoria": "Hardware", "descripcion": "Problemas de hardware"},
    )
    assert resp.status_code == 201
    data = resp.json()
    id_cat = data["id_categoria"]
    assert data["nombre_categoria"] == "Hardware"

    # 4. Nombre duplicado responde 409
    resp = client.post(
        "/api/v1/categorias",
        headers=admin_headers,
        json={"nombre_categoria": "Hardware", "descripcion": "Otro"},
    )
    assert resp.status_code == 409

    # 5. Listar categorías como cliente responde 200
    resp = client.get("/api/v1/categorias", headers=cliente_headers)
    assert resp.status_code == 200
    cats = resp.json()
    assert any(c["nombre_categoria"] == "Hardware" for c in cats)

    # 6. Actualizar categoría como admin (200)
    resp = client.put(
        f"/api/v1/categorias/{id_cat}",
        headers=admin_headers,
        json={"nombre_categoria": "Hardware y Partes", "descripcion": "Actualizado"},
    )
    assert resp.status_code == 200
    assert resp.json()["nombre_categoria"] == "Hardware y Partes"


# ==========================================
# Equipos
# ==========================================
def test_equipos_crud_y_permisos(client):
    admin_headers = _auth_headers(client, "admin@prueba.com")
    cliente_headers = _auth_headers(client, "cliente@prueba.com")
    tecnico_headers = _auth_headers(client, "tecnico@prueba.com")

    # 1. Cliente crea equipo (id_cliente tomado del token)
    resp = client.post(
        "/api/v1/equipos",
        headers=cliente_headers,
        json={
            "tipo": "Computador",
            "marca": "Dell",
            "modelo": "Latitude 5420",
            "serial": "DELL-12345",
            "sistema_operativo": "Windows 11 Pro",
            "area_departamento": "Ventas",
        },
    )
    assert resp.status_code == 201
    equipo_data = resp.json()
    id_equipo = equipo_data["id_equipo"]
    assert equipo_data["id_cliente"] == 3
    assert equipo_data["estado_equipo"] == "Operativo"

    # 2. Serial duplicado responde 409
    resp = client.post(
        "/api/v1/equipos",
        headers=cliente_headers,
        json={
            "tipo": "Computador",
            "marca": "HP",
            "modelo": "ProBook",
            "serial": "DELL-12345",
        },
    )
    assert resp.status_code == 409

    # 3. Cliente lista sus propios equipos
    resp = client.get("/api/v1/equipos", headers=cliente_headers)
    assert resp.status_code == 200
    equipos_cliente = resp.json()
    assert len(equipos_cliente) >= 1
    assert all(e["id_cliente"] == 3 for e in equipos_cliente)

    # 4. Técnico lista equipos (todos, solo lectura)
    resp = client.get("/api/v1/equipos", headers=tecnico_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # Técnico no puede crear equipos (403)
    resp = client.post(
        "/api/v1/equipos",
        headers=tecnico_headers,
        json={
            "tipo": "Impresora",
            "marca": "Epson",
            "modelo": "L3150",
            "serial": "EPSON-001",
        },
    )
    assert resp.status_code == 403

    # 5. Admin crea equipo especificando id_cliente
    resp = client.post(
        "/api/v1/equipos",
        headers=admin_headers,
        json={
            "tipo": "Impresora",
            "marca": "HP",
            "modelo": "LaserJet",
            "serial": "HP-PRINT-99",
            "id_cliente": 3,
            "area_departamento": "Administracion",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["id_cliente"] == 3

    # 6. Actualizar equipo
    resp = client.put(
        f"/api/v1/equipos/{id_equipo}",
        headers=cliente_headers,
        json={"estado_equipo": "En_Reparacion"},
    )
    assert resp.status_code == 200
    assert resp.json()["estado_equipo"] == "En_Reparacion"


# ==========================================
# Técnicos
# ==========================================
def test_tecnicos_listado(client):
    admin_headers = _auth_headers(client, "admin@prueba.com")
    cliente_headers = _auth_headers(client, "cliente@prueba.com")

    # Cliente recibe 403
    resp = client.get("/api/v1/tecnicos", headers=cliente_headers)
    assert resp.status_code == 403

    # Admin recibe 200 y ve al técnico con tickets_en_proceso
    resp = client.get("/api/v1/tecnicos", headers=admin_headers)
    assert resp.status_code == 200
    tecnicos = resp.json()
    assert len(tecnicos) >= 1
    tecnico = next(t for t in tecnicos if t["id_usuario"] == 2)
    assert tecnico["nombre"] == "Diana"
    assert tecnico["apellido"] == "Tecnico"
    assert tecnico["especialidad"] == "Soporte General TI"
    assert tecnico["disponibilidad"] == "Disponible"
    assert "tickets_en_proceso" in tecnico
    assert isinstance(tecnico["tickets_en_proceso"], int)
