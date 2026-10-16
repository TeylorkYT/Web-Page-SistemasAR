def _auth_headers(client, correo):
    resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo, "contrasena": "Prueba123*"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_maquina_estados_flujo_completo(client):
    admin_headers = _auth_headers(client, "admin@prueba.com")
    cliente_headers = _auth_headers(client, "cliente@prueba.com")
    tecnico_headers = _auth_headers(client, "tecnico@prueba.com")

    # 1. Crear categoría para el flujo
    cat_resp = client.post(
        "/api/v1/categorias",
        headers=admin_headers,
        json={"nombre_categoria": "Redes y Servidores Test", "descripcion": "Cat test"},
    )
    id_cat = cat_resp.json()["id_categoria"]

    # 2. Cliente crea ticket (Abierto)
    tkt_resp = client.post(
        "/api/v1/tickets",
        headers=cliente_headers,
        json={
            "titulo": "Fallo en servidor de base de datos",
            "descripcion": "El servicio MySQL no inicia",
            "modalidad": "Remoto",
            "categorias": [id_cat],
        },
    )
    assert tkt_resp.status_code == 201
    id_ticket = tkt_resp.json()["id_ticket"]
    assert tkt_resp.json()["estado"] == "Abierto"

    # Intento de cerrar o calificar cuando está Abierto -> 400
    resp_bad_close = client.patch(
        f"/api/v1/tickets/{id_ticket}/estado",
        headers=cliente_headers,
        json={"estado_nuevo": "Cerrado"},
    )
    assert resp_bad_close.status_code == 400
    assert resp_bad_close.json() == {
        "detail": "El ticket no está en un estado válido para esta acción"
    }

    # 3. Asignación: Administrador asigna ticket a técnico (id=2)
    resp_asig = client.patch(
        f"/api/v1/tickets/{id_ticket}/asignar",
        headers=admin_headers,
        json={"id_tecnico": 2, "prioridad": "Alta"},
    )
    assert resp_asig.status_code == 200
    assert resp_asig.json()["estado"] == "En_Proceso"
    assert resp_asig.json()["prioridad"] == "Alta"
    assert resp_asig.json()["id_tecnico"] == 2
    assert resp_asig.json()["tecnico_nombre"] == "Diana Tecnico"

    # 4. Reporte técnico:
    # Intento con solución vacía responde 400
    resp_rep_vacio = client.post(
        f"/api/v1/tickets/{id_ticket}/reporte",
        headers=tecnico_headers,
        json={"solucion_aplicada": "   "},
    )
    assert resp_rep_vacio.status_code == 400
    assert resp_rep_vacio.json() == {"detail": "Debes registrar la solución aplicada"}

    # Reporte válido
    resp_rep = client.post(
        f"/api/v1/tickets/{id_ticket}/reporte",
        headers=tecnico_headers,
        json={"solucion_aplicada": "Se reinició el demonio de MySQL y se reparó la tabla corrupta."},
    )
    assert resp_rep.status_code == 201
    assert resp_rep.json()["estado"] == "Aprobado"

    # Verificar que el ticket quedó Resuelto
    resp_check = client.get(f"/api/v1/tickets/{id_ticket}", headers=cliente_headers)
    assert resp_check.status_code == 200
    assert resp_check.json()["estado"] == "Resuelto"
    assert resp_check.json()["reporte"] is not None

    # 5. Calificación: Cliente califica y cierra
    resp_calif = client.post(
        f"/api/v1/tickets/{id_ticket}/calificacion",
        headers=cliente_headers,
        json={"puntuacion": 5, "comentario": "Excelente soporte y rapidez"},
    )
    assert resp_calif.status_code == 201
    assert resp_calif.json()["puntuacion"] == 5
    assert resp_calif.json()["cliente_nombre"] == "Laura Cliente"
    assert resp_calif.json()["tecnico_nombre"] == "Diana Tecnico"

    # Verificar estado final Cerrado
    resp_final = client.get(f"/api/v1/tickets/{id_ticket}", headers=cliente_headers)
    assert resp_final.json()["estado"] == "Cerrado"
    assert resp_final.json()["fecha_cierre"] is not None

    # Segunda calificación responde 409
    resp_calif_dup = client.post(
        f"/api/v1/tickets/{id_ticket}/calificacion",
        headers=cliente_headers,
        json={"puntuacion": 4},
    )
    assert resp_calif_dup.status_code == 400 or resp_calif_dup.status_code == 409

    # 6. Historial completo (Creacion, Asignacion, Resolucion, Cierre)
    resp_hist = client.get(
        f"/api/v1/tickets/{id_ticket}/historial", headers=cliente_headers
    )
    assert resp_hist.status_code == 200
    acciones = [h["tipo_accion"] for h in resp_hist.json()]
    assert "Creacion" in acciones
    assert "Asignacion" in acciones
    assert "Resolucion" in acciones
    assert "Cierre" in acciones


def test_cierre_ticket_sin_calificar(client):
    admin_headers = _auth_headers(client, "admin@prueba.com")
    cliente_headers = _auth_headers(client, "cliente@prueba.com")
    tecnico_headers = _auth_headers(client, "tecnico@prueba.com")

    # Crear categoría y ticket
    cat_resp = client.post(
        "/api/v1/categorias",
        headers=admin_headers,
        json={"nombre_categoria": "Cat Cierre Directo"},
    )
    id_cat = cat_resp.json()["id_categoria"]

    tkt = client.post(
        "/api/v1/tickets",
        headers=cliente_headers,
        json={"titulo": "Ticket para omitir calificacion", "descripcion": "Desc", "categorias": [id_cat]},
    ).json()
    id_ticket = tkt["id_ticket"]

    # Asignar y resolver
    client.patch(
        f"/api/v1/tickets/{id_ticket}/asignar",
        headers=admin_headers,
        json={"id_tecnico": 2},
    )
    client.post(
        f"/api/v1/tickets/{id_ticket}/reporte",
        headers=tecnico_headers,
        json={"solucion_aplicada": "Problema resuelto"},
    )

    # Cliente cierra sin calificar (PATCH /tickets/{id}/estado)
    resp_cierre = client.patch(
        f"/api/v1/tickets/{id_ticket}/estado",
        headers=cliente_headers,
        json={"estado_nuevo": "Cerrado"},
    )
    assert resp_cierre.status_code == 200
    assert resp_cierre.json()["estado"] == "Cerrado"
    assert resp_cierre.json()["fecha_cierre"] is not None
