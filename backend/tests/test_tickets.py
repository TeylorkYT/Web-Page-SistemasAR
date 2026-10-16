def _auth_headers(client, correo):
    resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo, "contrasena": "Prueba123*"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_flujo_tickets_creacion_listado_detalle_comentarios(client):
    admin_headers = _auth_headers(client, "admin@prueba.com")
    cliente_headers = _auth_headers(client, "cliente@prueba.com")
    tecnico_headers = _auth_headers(client, "tecnico@prueba.com")

    # 1. Asegurar categoría para la prueba
    cat_resp = client.post(
        "/api/v1/categorias",
        headers=admin_headers,
        json={"nombre_categoria": "Software y Redes", "descripcion": "Problemas de red"},
    )
    id_cat = cat_resp.json()["id_categoria"]

    # 2. Asegurar equipo del cliente (id_usuario = 3)
    eq_resp = client.post(
        "/api/v1/equipos",
        headers=cliente_headers,
        json={
            "tipo": "Computador",
            "marca": "Lenovo",
            "modelo": "ThinkPad",
            "serial": "LENOVO-9988",
        },
    )
    id_equipo = eq_resp.json()["id_equipo"]

    # 3. Cliente crea ticket (201)
    ticket_payload = {
        "titulo": "No hay conexión a internet",
        "descripcion": "El equipo no obtiene dirección IP",
        "modalidad": "Presencial",
        "id_equipo": id_equipo,
        "categorias": [id_cat],
    }
    resp = client.post(
        "/api/v1/tickets",
        headers=cliente_headers,
        json=ticket_payload,
    )
    assert resp.status_code == 201
    ticket_data = resp.json()
    id_ticket = ticket_data["id_ticket"]
    assert ticket_data["titulo"] == "No hay conexión a internet"
    assert ticket_data["estado"] == "Abierto"
    assert ticket_data["prioridad"] == "Media"
    assert ticket_data["id_cliente"] == 3
    assert ticket_data["cliente_nombre"] == "Laura Cliente"
    assert ticket_data["equipo"] == "Lenovo ThinkPad"
    assert len(ticket_data["categorias"]) == 1

    # 4. Validar que técnico no puede crear tickets (403)
    resp_tec_create = client.post(
        "/api/v1/tickets",
        headers=tecnico_headers,
        json=ticket_payload,
    )
    assert resp_tec_create.status_code == 403

    # 5. Listar tickets según rol
    # Cliente ve su ticket
    resp_cli_list = client.get("/api/v1/tickets", headers=cliente_headers)
    assert resp_cli_list.status_code == 200
    assert any(t["id_ticket"] == id_ticket for t in resp_cli_list.json())

    # Admin ve todos
    resp_adm_list = client.get("/api/v1/tickets", headers=admin_headers)
    assert resp_adm_list.status_code == 200
    assert any(t["id_ticket"] == id_ticket for t in resp_adm_list.json())

    # Técnico no lo ve aún (porque aún no está asignado a él)
    resp_tec_list = client.get("/api/v1/tickets", headers=tecnico_headers)
    assert resp_tec_list.status_code == 200
    assert not any(t["id_ticket"] == id_ticket for t in resp_tec_list.json())

    # 6. Detalle del ticket
    resp_detalle = client.get(f"/api/v1/tickets/{id_ticket}", headers=cliente_headers)
    assert resp_detalle.status_code == 200
    assert resp_detalle.json()["id_ticket"] == id_ticket

    # Técnico intenta ver detalle del ticket no asignado -> 404
    resp_tec_detalle = client.get(
        f"/api/v1/tickets/{id_ticket}", headers=tecnico_headers
    )
    assert resp_tec_detalle.status_code == 404

    # 7. Historial del ticket (debe contener el evento 'Creacion')
    resp_hist = client.get(
        f"/api/v1/tickets/{id_ticket}/historial", headers=cliente_headers
    )
    assert resp_hist.status_code == 200
    historial = resp_hist.json()
    assert len(historial) >= 1
    assert historial[0]["tipo_accion"] == "Creacion"
    assert historial[0]["estado_nuevo"] == "Abierto"

    # 8. Comentarios:
    # Cliente comenta con intento de nota interna (debe quedar en False)
    resp_com_cli = client.post(
        f"/api/v1/tickets/{id_ticket}/comentarios",
        headers=cliente_headers,
        json={"contenido": "Ya reinicié el módem y sigue igual", "es_nota_interna": True},
    )
    assert resp_com_cli.status_code == 201
    assert resp_com_cli.json()["es_nota_interna"] is False
    assert resp_com_cli.json()["rol"] == "cliente"

    # Admin agrega nota interna (debe quedar en True)
    resp_com_admin = client.post(
        f"/api/v1/tickets/{id_ticket}/comentarios",
        headers=admin_headers,
        json={"contenido": "Revisar switch del piso 2", "es_nota_interna": True},
    )
    assert resp_com_admin.status_code == 201
    assert resp_com_admin.json()["es_nota_interna"] is True

    # Cliente consulta comentarios: NO debe ver la nota interna
    resp_com_cli_list = client.get(
        f"/api/v1/tickets/{id_ticket}/comentarios", headers=cliente_headers
    )
    assert resp_com_cli_list.status_code == 200
    comentarios_cli = resp_com_cli_list.json()
    assert len(comentarios_cli) == 1
    assert comentarios_cli[0]["contenido"] == "Ya reinicié el módem y sigue igual"
    assert all(c["es_nota_interna"] is False for c in comentarios_cli)

    # Admin consulta comentarios: SÍ ve ambos comentarios
    resp_com_adm_list = client.get(
        f"/api/v1/tickets/{id_ticket}/comentarios", headers=admin_headers
    )
    assert resp_com_adm_list.status_code == 200
    comentarios_adm = resp_com_adm_list.json()
    assert len(comentarios_adm) == 2
    assert any(c["es_nota_interna"] is True for c in comentarios_adm)
