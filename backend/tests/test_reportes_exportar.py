from app.services.exportacion_service import sanitizar_texto_formula


def _auth_headers(client, correo):
    resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo, "contrasena": "Prueba123*"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_exportar_todos_los_reportes_excel_y_pdf(client):
    headers_admin = _auth_headers(client, "admin@prueba.com")

    informes = [
        "por_agente",
        "por_prioridad",
        "tiempos_resolucion",
        "estado_general",
        "incidencias_area_categoria",
    ]

    for inf in informes:
        # 1. Probar exportación a Excel
        resp_excel = client.get(
            f"/api/v1/reportes/{inf}/exportar?formato=excel",
            headers=headers_admin,
        )
        assert resp_excel.status_code == 200
        assert (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            in resp_excel.headers["content-type"]
        )
        assert f"reporte_{inf}_" in resp_excel.headers["content-disposition"]
        assert len(resp_excel.content) > 100

        # 2. Probar exportación a PDF
        resp_pdf = client.get(
            f"/api/v1/reportes/{inf}/exportar?formato=pdf",
            headers=headers_admin,
        )
        assert resp_pdf.status_code == 200
        assert "application/pdf" in resp_pdf.headers["content-type"]
        assert f"reporte_{inf}_" in resp_pdf.headers["content-disposition"]
        assert resp_pdf.content.startswith(b"%PDF")


def test_exportar_permisos_y_autorizacion(client):
    headers_cliente = _auth_headers(client, "cliente@prueba.com")
    headers_tecnico = _auth_headers(client, "tecnico@prueba.com")

    # Sin token -> 401
    resp_anon = client.get("/api/v1/reportes/por_prioridad/exportar?formato=excel")
    assert resp_anon.status_code == 401

    # Cliente -> 403
    resp_cli = client.get(
        "/api/v1/reportes/por_prioridad/exportar?formato=excel",
        headers=headers_cliente,
    )
    assert resp_cli.status_code == 403

    # Técnico -> 403
    resp_tec = client.get(
        "/api/v1/reportes/por_prioridad/exportar?formato=pdf",
        headers=headers_tecnico,
    )
    assert resp_tec.status_code == 403


def test_exportar_validaciones_formato_y_fechas(client):
    headers_admin = _auth_headers(client, "admin@prueba.com")

    # Formato inválido -> 400
    resp_inv = client.get(
        "/api/v1/reportes/por_prioridad/exportar?formato=word",
        headers=headers_admin,
    )
    assert resp_inv.status_code == 400
    assert "Formato de exportación inválido" in resp_inv.json()["detail"]

    # Tipo de informe no existente -> 400
    resp_tipo_inv = client.get(
        "/api/v1/reportes/reporte_fantasma/exportar?formato=excel",
        headers=headers_admin,
    )
    assert resp_tipo_inv.status_code == 400

    # Fecha inválida -> 400
    resp_fecha_inv = client.get(
        "/api/v1/reportes/por_prioridad/exportar?formato=excel&desde=fechainvalida",
        headers=headers_admin,
    )
    assert resp_fecha_inv.status_code == 400


def test_neutralizacion_formulas_inyeccion():
    # Verificación de seguridad de sanitización de fórmulas
    assert sanitizar_texto_formula("=SUMA(A1:A10)") == "'=SUMA(A1:A10)"
    assert sanitizar_texto_formula("+12345") == "'+12345"
    assert sanitizar_texto_formula("-CMD|' /C calc'!A0") == "'-CMD|' /C calc'!A0"
    assert sanitizar_texto_formula("@SUM(B1:B2)") == "'@SUM(B1:B2)"
    # Textos normales no se alteran
    assert sanitizar_texto_formula("Texto normal") == "Texto normal"
    assert sanitizar_texto_formula(100) == 100
    assert sanitizar_texto_formula(None) is None
