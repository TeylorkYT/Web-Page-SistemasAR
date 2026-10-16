def _auth_headers(client, correo):
    resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo, "contrasena": "Prueba123*"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_notificaciones_reportes_y_flujo_completo(client):
    headers_admin = _auth_headers(client, "admin@prueba.com")
    headers_cliente = _auth_headers(client, "cliente@prueba.com")
    headers_tecnico = _auth_headers(client, "tecnico@prueba.com")

    # 1. Asegurar categoría para la prueba
    cat_resp = client.post(
        "/api/v1/categorias",
        headers=headers_admin,
        json={"nombre_categoria": "Soporte General P2", "descripcion": "Cat P2"},
    )
    if cat_resp.status_code == 201:
        id_cat = cat_resp.json()["id_categoria"]
    else:
        # Si ya existe, listamos las categorías
        cats = client.get("/api/v1/categorias", headers=headers_admin).json()
        id_cat = cats[0]["id_categoria"]

    # 2. Obtenemos datos del técnico de prueba para conocer su id
    resp_tecs = client.get("/api/v1/tecnicos", headers=headers_admin)
    assert resp_tecs.status_code == 200
    tecs = resp_tecs.json()
    assert len(tecs) > 0
    id_tecnico = tecs[0]["id_usuario"]

    # 3. Cliente crea un ticket
    payload_ticket = {
        "titulo": "Ticket Flujo P2 Notificaciones",
        "descripcion": "Probando reportes y notificaciones automáticas",
        "modalidad": "Presencial",
        "categorias": [id_cat],
    }
    resp_crear = client.post(
        "/api/v1/tickets", json=payload_ticket, headers=headers_cliente
    )
    assert resp_crear.status_code == 201
    ticket = resp_crear.json()
    id_ticket = ticket["id_ticket"]

    # 4. Administrador debe tener notificación de nuevo ticket
    resp_notif_admin = client.get("/api/v1/notificaciones", headers=headers_admin)
    assert resp_notif_admin.status_code == 200
    notifs_admin = resp_notif_admin.json()
    assert any(n["id_ticket"] == id_ticket and n["tipo"] == "Actualizacion" for n in notifs_admin)

    # 5. Administrador asigna ticket al técnico
    resp_asignar = client.patch(
        f"/api/v1/tickets/{id_ticket}/asignar",
        json={"id_tecnico": id_tecnico, "prioridad": "Alta"},
        headers=headers_admin,
    )
    assert resp_asignar.status_code == 200
    assert resp_asignar.json()["estado"] == "En_Proceso"

    # 6. Técnico y cliente deben haber recibido notificación de asignación
    resp_notif_tec = client.get("/api/v1/notificaciones", headers=headers_tecnico)
    assert resp_notif_tec.status_code == 200
    notifs_tec = resp_notif_tec.json()
    notif_asig = next((n for n in notifs_tec if n["id_ticket"] == id_ticket and n["tipo"] == "Asignacion"), None)
    assert notif_asig is not None
    assert notif_asig["leida"] is False

    # Técnico marca notificación como leída
    resp_leida = client.patch(
        f"/api/v1/notificaciones/{notif_asig['id_notificacion']}/leida",
        headers=headers_tecnico,
    )
    assert resp_leida.status_code == 200
    assert resp_leida.json()["leida"] is True

    # 7. Técnico registra reporte de solución
    resp_reporte = client.post(
        f"/api/v1/tickets/{id_ticket}/reporte",
        json={"solucion_aplicada": "Mantenimiento preventivo y limpieza realizada con éxito"},
        headers=headers_tecnico,
    )
    assert resp_reporte.status_code == 201
    assert resp_reporte.json()["solucion_aplicada"] == "Mantenimiento preventivo y limpieza realizada con éxito"

    # Cliente debe haber recibido notificación de resolución
    resp_notif_cli = client.get("/api/v1/notificaciones", headers=headers_cliente)
    assert resp_notif_cli.status_code == 200
    notifs_cli = resp_notif_cli.json()
    assert any(n["id_ticket"] == id_ticket and n["tipo"] == "Resolucion" for n in notifs_cli)

    # 8. Cliente califica el ticket con puntuación 2 (baja calificación -> alerta)
    resp_calif = client.post(
        f"/api/v1/tickets/{id_ticket}/calificacion",
        json={"puntuacion": 2, "comentario": "Tardó demasiado tiempo"},
        headers=headers_cliente,
    )
    assert resp_calif.status_code == 201
    calif_data = resp_calif.json()
    assert calif_data["puntuacion"] == 2

    # 9. Admin verifica lista de calificaciones
    resp_list_calif = client.get("/api/v1/calificaciones", headers=headers_admin)
    assert resp_list_calif.status_code == 200
    calificaciones = resp_list_calif.json()
    assert any(c["id_ticket"] == id_ticket and c["puntuacion"] == 2 for c in calificaciones)

    # Admin verifica filtros de calificaciones
    resp_filtro = client.get(
        f"/api/v1/calificaciones?puntuacion=2&id_tecnico={id_tecnico}",
        headers=headers_admin,
    )
    assert resp_filtro.status_code == 200
    assert all(c["puntuacion"] == 2 for c in resp_filtro.json())

    # 10. Verificar los 5 reportes del administrador
    tipos_informes = [
        "por_agente",
        "por_prioridad",
        "tiempos_resolucion",
        "estado_general",
        "incidencias_area_categoria",
    ]
    for tipo in tipos_informes:
        resp_rep = client.get(f"/api/v1/reportes/{tipo}", headers=headers_admin)
        assert resp_rep.status_code == 200, f"Fallo en reporte {tipo}: {resp_rep.text}"

    # Validar formato de reporte tiempos_resolucion
    resp_tiempos = client.get("/api/v1/reportes/tiempos_resolucion", headers=headers_admin)
    assert "promedio_horas" in resp_tiempos.json()
    assert "tickets" in resp_tiempos.json()

    # Validar formato de reporte estado_general
    resp_general = client.get("/api/v1/reportes/estado_general", headers=headers_admin)
    gen_data = resp_general.json()
    assert "tickets_totales" in gen_data
    assert "abiertos" in gen_data
    assert "cerrados" in gen_data
    assert "tecnicos_activos" in gen_data
    assert "por_estado" in gen_data
    assert "serie_semanal" in gen_data

    # Validar que tipo de reporte inválido devuelve 400
    resp_invalido = client.get("/api/v1/reportes/tipo_inventado", headers=headers_admin)
    assert resp_invalido.status_code == 400

    # Validar que un cliente no puede consultar reportes (403)
    resp_prohibido = client.get("/api/v1/reportes/estado_general", headers=headers_cliente)
    assert resp_prohibido.status_code == 403
