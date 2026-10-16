"""Pruebas transversales E2E y de Seguridad (Módulo 5 - QA / Daily 05).

Cubre:
- X-01: Flujo integrado Cliente crea -> Admin asigna -> Técnico resuelve -> Cliente califica -> Verificación de historial y notificaciones.
- X-02: Pruebas de seguridad IDOR (un cliente no puede ver/calificar tickets ajenos),
  sanitización de datos y rechazo de SQL injection/tokens inválidos.
"""
import pytest


def _login(client, correo, clave="Prueba123*"):
    r = client.post("/api/v1/auth/login", json={"correo_electronico": correo, "contrasena": clave})
    assert r.status_code == 200, f"Error en login de {correo}: {r.text}"
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_x01_flujo_transversal_completo_e2e(client):
    """X-01: Flujo E2E completo verificando estados, historial y notificaciones en cada paso."""
    headers_admin = _login(client, "admin@prueba.com")
    headers_cliente = _login(client, "cliente@prueba.com")
    headers_tecnico = _login(client, "tecnico@prueba.com")

    # 1. Admin crea categoría base
    r_cat = client.post(
        "/api/v1/categorias",
        headers=headers_admin,
        json={"nombre_categoria": "Soporte General E2E", "descripcion": "Categoría para prueba X-01"},
    )
    assert r_cat.status_code == 201
    id_cat = r_cat.json()["id_categoria"]

    # 2. Cliente crea ticket
    r_tkt = client.post(
        "/api/v1/tickets",
        headers=headers_cliente,
        json={
            "titulo": "Falla general en estacion de trabajo",
            "descripcion": "El monitor parpadea y el equipo se reinicia cada 10 minutos.",
            "modalidad": "Presencial",
            "categorias": [id_cat],
        },
    )
    assert r_tkt.status_code == 201
    ticket = r_tkt.json()
    id_ticket = ticket["id_ticket"]
    assert ticket["estado"] == "Abierto"
    assert ticket["prioridad"] == "Media"

    # Verificar historial de creación
    r_hist1 = client.get(f"/api/v1/tickets/{id_ticket}/historial", headers=headers_cliente)
    assert r_hist1.status_code == 200
    hist1 = r_hist1.json()
    assert len(hist1) >= 1
    assert hist1[0]["tipo_accion"] == "Creacion"

    # 3. Admin asigna técnico (id_tecnico = 2) y sube prioridad a Alta
    r_asig = client.patch(
        f"/api/v1/tickets/{id_ticket}/asignar",
        headers=headers_admin,
        json={"id_tecnico": 2, "prioridad": "Alta"},
    )
    assert r_asig.status_code == 200
    tkt_asig = r_asig.json()
    assert tkt_asig["estado"] == "En_Proceso"
    assert tkt_asig["prioridad"] == "Alta"
    assert tkt_asig["id_tecnico"] == 2

    # Verificar que el técnico recibió notificación
    r_notif_tec = client.get("/api/v1/notificaciones", headers=headers_tecnico)
    assert r_notif_tec.status_code == 200
    notifs_tec = r_notif_tec.json()
    assert any(n["id_ticket"] == id_ticket and not n["leida"] for n in notifs_tec)

    # 4. Técnico agrega comentario de avance
    r_com = client.post(
        f"/api/v1/tickets/{id_ticket}/comentarios",
        headers=headers_tecnico,
        json={"contenido": "Se ha reemplazado la fuente de poder y el cable de video.", "es_nota_interna": False},
    )
    assert r_com.status_code == 201

    # 5. Técnico registra solución (ticket pasa a Resuelto)
    r_rep = client.post(
        f"/api/v1/tickets/{id_ticket}/reporte",
        headers=headers_tecnico,
        json={"solucion_aplicada": "Reemplazo de fuente de poder certificada de 500W y pruebas de carga exitosas."},
    )
    assert r_rep.status_code == 201
    assert r_rep.json()["id_ticket"] == id_ticket

    # Verificar que el estado del ticket ahora es Resuelto
    r_verif_res = client.get(f"/api/v1/tickets/{id_ticket}", headers=headers_cliente)
    assert r_verif_res.json()["estado"] == "Resuelto"
    assert r_verif_res.json()["fecha_resolucion"] is not None

    # 6. Cliente califica (5 estrellas) y el ticket se cierra
    r_calif = client.post(
        f"/api/v1/tickets/{id_ticket}/calificacion",
        headers=headers_cliente,
        json={"puntuacion": 5, "comentario": "Excelente trabajo y rapidez en la atención."},
    )
    assert r_calif.status_code == 201
    assert r_calif.json()["puntuacion"] == 5

    # 7. Verificar estado final del ticket: Cerrado
    r_final = client.get(f"/api/v1/tickets/{id_ticket}", headers=headers_cliente)
    assert r_final.status_code == 200
    assert r_final.json()["estado"] == "Cerrado"
    assert r_final.json()["fecha_cierre"] is not None

    # 8. Verificar historial completo en orden cronológico
    r_hist_final = client.get(f"/api/v1/tickets/{id_ticket}/historial", headers=headers_cliente)
    assert r_hist_final.status_code == 200
    acciones = [h["tipo_accion"] for h in r_hist_final.json()]
    assert "Creacion" in acciones
    assert "Asignacion" in acciones
    assert "Resolucion" in acciones
    assert "Cierre" in acciones


def test_x02_seguridad_idor_y_filtros(client):
    """X-02: Pruebas de seguridad RBAC e IDOR (prevención de acceso cruzado)."""
    headers_cliente = _login(client, "cliente@prueba.com")
    headers_admin = _login(client, "admin@prueba.com")

    # Intentar acceder con token manipulado o inexistente
    r_unauth = client.get("/api/v1/tickets", headers={"Authorization": "Bearer token.falso.invalido"})
    assert r_unauth.status_code == 401

    # Intentar inyección SQL en endpoints de listado/búsqueda
    r_sql = client.get("/api/v1/tickets?estado=' OR '1'='1", headers=headers_cliente)
    assert r_sql.status_code in (200, 422)  # Controlado, nunca 500

    # IDOR: Cliente intentando calificar un ticket que no le pertenece o no existe
    r_idor = client.post(
        "/api/v1/tickets/999999/calificacion",
        headers=headers_cliente,
        json={"puntuacion": 5},
    )
    assert r_idor.status_code in (404, 400)
    assert r_idor.status_code != 500

    # Cliente intentando reasignar técnico (acción exclusiva de admin)
    r_priv = client.patch(
        "/api/v1/tickets/1/asignar",
        headers=headers_cliente,
        json={"id_tecnico": 2},
    )
    assert r_priv.status_code == 403
