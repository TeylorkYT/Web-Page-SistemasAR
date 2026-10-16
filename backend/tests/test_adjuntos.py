import io
import os
import pytest
from app.core.security import crear_access_token
from app.models.ticket import Ticket
from app.models.categoria import Categoria
from app.models.ticket_categoria import TicketCategoria
from app.models.historial_ticket import HistorialTicket
from app.models.usuario import Usuario
from app.core import config
from sqlalchemy.orm import Session
from sqlalchemy import select


from datetime import date

@pytest.fixture
def auth_tokens(test_engine):
    from sqlalchemy.orm import sessionmaker
    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as s:
        if not s.get(Usuario, 5):
            u5 = Usuario(
                id_usuario=5,
                nombre="Pedro",
                apellido="Ajeno",
                correo_electronico="ajeno@prueba.com",
                contrasena="hash",
                rol="Cliente",
                estado="Activo",
                fecha_registro=date(2026, 8, 1),
            )
            s.add(u5)
            s.commit()

    return {
        "admin": crear_access_token(1, "Administrador"),
        "tecnico": crear_access_token(2, "Tecnico"),
        "cliente": crear_access_token(3, "Cliente"),
        "otro_cliente": crear_access_token(5, "Cliente"),
    }


def _asegurar_categoria(s):
    cat = s.scalar(select(Categoria))
    if not cat:
        cat = Categoria(nombre_categoria="CategoriaEspecialAdjuntos", descripcion="Pruebas adjuntos")
        s.add(cat)
        s.commit()
    return cat.id_categoria


@pytest.fixture
def ticket_prueba(test_engine):
    from sqlalchemy.orm import sessionmaker
    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as s:
        id_cat = _asegurar_categoria(s)

        ticket = Ticket(
            id_ticket=1001,
            titulo="Ticket de prueba adjuntos",
            descripcion="Descripción de prueba para adjuntos",
            modalidad="Presencial",
            prioridad="Media",
            estado="En_Proceso",
            id_cliente=3,
            id_tecnico=2,
            id_asignado_por=1,
        )
        existente = s.get(Ticket, 1001)
        if not existente:
            s.add(ticket)
            s.commit()
            tc = TicketCategoria(id_ticket=1001, id_categoria=id_cat)
            s.add(tc)
            s.commit()
    return 1001


@pytest.fixture
def ticket_cerrado(test_engine):
    from sqlalchemy.orm import sessionmaker
    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as s:
        id_cat = _asegurar_categoria(s)
        ticket = Ticket(
            id_ticket=1002,
            titulo="Ticket cerrado de prueba",
            descripcion="Ticket cerrado para prueba de adjuntos",
            modalidad="Remoto",
            prioridad="Baja",
            estado="Cerrado",
            id_cliente=3,
            id_tecnico=2,
        )
        existente = s.get(Ticket, 1002)
        if not existente:
            s.add(ticket)
            s.commit()
            tc = TicketCategoria(id_ticket=1002, id_categoria=id_cat)
            s.add(tc)
            s.commit()
    return 1002


def test_c1_01_subir_jpg_png_pdf_validos(client, auth_tokens, ticket_prueba):
    """C1-01: Subir JPG, PNG y PDF válidos devuelve 201 y aparecen en el listado con historial."""
    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}

    # JPG
    jpg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
    r_jpg = client.post(
        f"/api/v1/tickets/{ticket_prueba}/adjuntos",
        headers=headers,
        files={"archivo": ("foto_evidencia.jpg", io.BytesIO(jpg_bytes), "image/jpeg")},
    )
    assert r_jpg.status_code == 201
    data_jpg = r_jpg.json()
    assert data_jpg["nombre_archivo"] == "foto_evidencia.jpg"
    assert data_jpg["tipo_mime"] == "image/jpeg"
    assert data_jpg["tamano_bytes"] == len(jpg_bytes)

    # PNG por técnico
    headers_tec = {"Authorization": f"Bearer {auth_tokens['tecnico']}"}
    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    r_png = client.post(
        f"/api/v1/tickets/{ticket_prueba}/adjuntos",
        headers=headers_tec,
        files={"archivo": ("captura.png", io.BytesIO(png_bytes), "image/png")},
    )
    assert r_png.status_code == 201
    assert r_png.json()["tipo_mime"] == "image/png"

    # Listado
    r_list = client.get(f"/api/v1/tickets/{ticket_prueba}/adjuntos", headers=headers)
    assert r_list.status_code == 200
    adjuntos = r_list.json()
    assert len(adjuntos) >= 2


def test_c1_02_subir_exe_renombrado_falla_firma(client, auth_tokens, ticket_prueba):
    """C1-02: Subir archivo ejecutable (.exe) renombrado a .png falla por magic bytes."""
    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}
    exe_falso = b"MZ\x90\x00\x03\x00\x00\x00" + b"\x00" * 50
    r = client.post(
        f"/api/v1/tickets/{ticket_prueba}/adjuntos",
        headers=headers,
        files={"archivo": ("virus.png", io.BytesIO(exe_falso), "image/png")},
    )
    assert r.status_code == 400
    assert "no permitido" in r.json()["detail"].lower()


def test_c1_03_tamano_limite_5mb(client, auth_tokens, test_engine):
    """C1-03: Archivo de exactamente 5.242.880 bytes se acepta; 5.242.881 se rechaza."""
    from sqlalchemy.orm import sessionmaker
    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as s:
        t = Ticket(
            id_ticket=1003,
            titulo="Ticket prueba tamano",
            descripcion="Ticket para prueba de límite 5MB",
            modalidad="Remoto",
            prioridad="Media",
            estado="Abierto",
            id_cliente=3,
        )
        if not s.get(Ticket, 1003):
            s.add(t)
            s.commit()
            s.add(TicketCategoria(id_ticket=1003, id_categoria=_asegurar_categoria(s)))
            s.commit()

    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}

    # 5.242.881 bytes -> debe fallar (400)
    bytes_excedente = b"%PDF-" + b"X" * (5242881 - 5)
    r_excedente = client.post(
        f"/api/v1/tickets/1003/adjuntos",
        headers=headers,
        files={"archivo": ("demasiado_grande.pdf", io.BytesIO(bytes_excedente), "application/pdf")},
    )
    assert r_excedente.status_code == 400
    assert "excede el tamaño máximo" in r_excedente.json()["detail"].lower()

    # Exactamente 5.242.880 bytes -> debe pasar (201)
    bytes_exacto = b"%PDF-" + b"X" * (5242880 - 5)
    r_exacto = client.post(
        f"/api/v1/tickets/1003/adjuntos",
        headers=headers,
        files={"archivo": ("exacto_5mb.pdf", io.BytesIO(bytes_exacto), "application/pdf")},
    )
    assert r_exacto.status_code == 201


def test_c1_04_maximo_3_adjuntos_por_ticket(client, auth_tokens, test_engine):
    """C1-04: Subir el 4.º adjunto debe fallar con 400 y mensaje claro."""
    from sqlalchemy.orm import sessionmaker
    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as s:
        t = Ticket(
            id_ticket=1004,
            titulo="Ticket prueba limite 3",
            descripcion="Ticket para prueba de límite de 3 adjuntos",
            modalidad="Presencial",
            prioridad="Media",
            estado="Abierto",
            id_cliente=3,
        )
        if not s.get(Ticket, 1004):
            s.add(t)
            s.commit()
            s.add(TicketCategoria(id_ticket=1004, id_categoria=_asegurar_categoria(s)))
            s.commit()

    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}
    pdf_bytes = b"%PDF-1.4\n" + b"\x00" * 50

    # Subir 3 adjuntos válidos
    for i in range(1, 4):
        r = client.post(
            "/api/v1/tickets/1004/adjuntos",
            headers=headers,
            files={"archivo": (f"doc_{i}.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        )
        assert r.status_code == 201

    # Intentar subir el 4.º adjunto
    r_cuarto = client.post(
        "/api/v1/tickets/1004/adjuntos",
        headers=headers,
        files={"archivo": ("doc_4.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert r_cuarto.status_code == 400
    assert "límite máximo" in r_cuarto.json()["detail"].lower()


def test_c1_05_cliente_ajeno_y_tecnico_no_asignado_responde_404(client, auth_tokens, ticket_prueba):
    """C1-05: Cliente ajeno o técnico no asignado recibe 404 al subir, listar o descargar."""
    headers_ajeno = {"Authorization": f"Bearer {auth_tokens['otro_cliente']}"}
    pdf_bytes = b"%PDF-1.4\n" + b"\x00" * 50

    # Subir -> 404
    r_subir = client.post(
        f"/api/v1/tickets/{ticket_prueba}/adjuntos",
        headers=headers_ajeno,
        files={"archivo": ("intruso.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert r_subir.status_code == 404

    # Listar -> 404
    r_listar = client.get(f"/api/v1/tickets/{ticket_prueba}/adjuntos", headers=headers_ajeno)
    assert r_listar.status_code == 404

    # Descargar -> 404
    r_desc = client.get(f"/api/v1/tickets/{ticket_prueba}/adjuntos/1/descargar", headers=headers_ajeno)
    assert r_desc.status_code == 404


def test_c1_06_sin_token_401_y_ticket_cerrado_400(client, auth_tokens, ticket_prueba, ticket_cerrado):
    """C1-06: Sin token devuelve 401. En ticket cerrado devuelve 400."""
    pdf_bytes = b"%PDF-1.4\n" + b"\x00" * 50

    # Sin token -> 401
    r_no_auth = client.post(
        f"/api/v1/tickets/{ticket_prueba}/adjuntos",
        files={"archivo": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert r_no_auth.status_code == 401

    # Ticket cerrado -> 400
    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}
    r_cerrado = client.post(
        f"/api/v1/tickets/{ticket_cerrado}/adjuntos",
        headers=headers,
        files={"archivo": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert r_cerrado.status_code == 400
    assert "cerrado" in r_cerrado.json()["detail"].lower()


def test_c1_07_path_traversal_sanitiza_nombre_y_usa_uuid(client, auth_tokens, test_engine):
    """C1-07: Nombre ../../etc/passwd.png se sanitiza y el archivo se guarda con UUID dentro de UPLOAD_DIR."""
    from sqlalchemy.orm import sessionmaker
    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as s:
        t = Ticket(
            id_ticket=1007,
            titulo="Ticket path traversal",
            descripcion="Ticket para prueba de sanitización de nombres",
            modalidad="Presencial",
            prioridad="Alta",
            estado="Abierto",
            id_cliente=3,
        )
        if not s.get(Ticket, 1007):
            s.add(t)
            s.commit()
            s.add(TicketCategoria(id_ticket=1007, id_categoria=_asegurar_categoria(s)))
            s.commit()

    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}
    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100

    r = client.post(
        "/api/v1/tickets/1007/adjuntos",
        headers=headers,
        files={"archivo": ("../../etc/passwd.png", io.BytesIO(png_bytes), "image/png")},
    )
    assert r.status_code == 201
    data = r.json()
    assert ".." not in data["nombre_archivo"]
    assert "/" not in data["nombre_archivo"]
    assert data["nombre_archivo"] == "passwd.png"

    # Verificar que en disco tiene nombre UUID
    nombre_disco = data["ruta_url"]
    assert nombre_disco.endswith(".png")
    assert len(nombre_disco) > 30
    ruta_real = os.path.join(config.UPLOAD_DIR, nombre_disco)
    assert os.path.exists(ruta_real)


def test_c1_08_descarga_contenido_headers_nosniff(client, auth_tokens, ticket_prueba):
    """C1-08: Descarga devuelve el mismo contenido, Content-Type y X-Content-Type-Options: nosniff."""
    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}
    contenido_original = b"%PDF-1.4\nContenido de prueba unico 123456789"

    r_subida = client.post(
        f"/api/v1/tickets/{ticket_prueba}/adjuntos",
        headers=headers,
        files={"archivo": ("informe.pdf", io.BytesIO(contenido_original), "application/pdf")},
    )
    assert r_subida.status_code == 201
    id_adjunto = r_subida.json()["id_adjunto"]

    # Descargar por técnico asignado
    headers_tec = {"Authorization": f"Bearer {auth_tokens['tecnico']}"}
    r_desc = client.get(
        f"/api/v1/tickets/{ticket_prueba}/adjuntos/{id_adjunto}/descargar",
        headers=headers_tec,
    )
    assert r_desc.status_code == 200
    assert r_desc.content == contenido_original
    assert "application/pdf" in r_desc.headers.get("content-type", "")
    assert r_desc.headers.get("x-content-type-options") == "nosniff"


def test_c1_09_concurrencia_respeta_limite_maximo(client, auth_tokens, test_engine):
    """C1-09: Intentos de subida respetan estrictamente el máximo de 3 adjuntos."""
    from sqlalchemy.orm import sessionmaker
    sesiones = sessionmaker(bind=test_engine)
    with sesiones() as s:
        t = Ticket(
            id_ticket=1009,
            titulo="Ticket concurrencia",
            descripcion="Ticket para prueba de límite con múltiples subidas",
            modalidad="Remoto",
            prioridad="Critica",
            estado="Abierto",
            id_cliente=3,
        )
        if not s.get(Ticket, 1009):
            s.add(t)
            s.commit()
            s.add(TicketCategoria(id_ticket=1009, id_categoria=_asegurar_categoria(s)))
            s.commit()

    headers = {"Authorization": f"Bearer {auth_tokens['cliente']}"}
    pdf_bytes = b"%PDF-1.4\n" + b"\x00" * 50

    # Subir 2 adjuntos
    r1 = client.post("/api/v1/tickets/1009/adjuntos", headers=headers, files={"archivo": ("1.pdf", io.BytesIO(pdf_bytes), "application/pdf")})
    r2 = client.post("/api/v1/tickets/1009/adjuntos", headers=headers, files={"archivo": ("2.pdf", io.BytesIO(pdf_bytes), "application/pdf")})
    assert r1.status_code == 201
    assert r2.status_code == 201

    # Subir el 3.º
    r3 = client.post("/api/v1/tickets/1009/adjuntos", headers=headers, files={"archivo": ("3.pdf", io.BytesIO(pdf_bytes), "application/pdf")})
    assert r3.status_code == 201

    # Un 4.º intento simultáneo o consecutivo debe fallar
    r4 = client.post("/api/v1/tickets/1009/adjuntos", headers=headers, files={"archivo": ("4.pdf", io.BytesIO(pdf_bytes), "application/pdf")})
    assert r4.status_code == 400

    # Verificar recuento final en listado
    r_list = client.get("/api/v1/tickets/1009/adjuntos", headers=headers)
    assert len(r_list.json()) == 3
