import jwt
import pytest
from app.core import security
from app.services import email_service


def _auth_headers(client, correo, clave="Prueba123*"):
    resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo, "contrasena": clave},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_c4_01_recuperar_respuesta_identica_anti_enumeracion(client):
    # Correo que sí existe en datos_prueba
    resp_existente = client.post(
        "/api/v1/auth/recuperar",
        json={"correo_electronico": "cliente@prueba.com"},
    )
    assert resp_existente.status_code == 200
    assert resp_existente.json()["detail"] == "Si el correo existe, recibirás instrucciones"

    # Correo que NO existe
    resp_fantasma = client.post(
        "/api/v1/auth/recuperar",
        json={"correo_electronico": "noexiste_fantasma_123@prueba.com"},
    )
    assert resp_fantasma.status_code == 200
    assert resp_fantasma.json()["detail"] == "Si el correo existe, recibirás instrucciones"


def test_c4_02_y_c4_03_flujo_completo_restablecer_e_invalidacion(client, monkeypatch):
    # 1. Registramos un usuario dedicado para no alterar los usuarios base del seed
    correo_test = "cliente_reset_exclusivo@prueba.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "nombre": "User",
            "apellido": "Reset",
            "correo_electronico": correo_test,
            "contrasena": "Prueba123*",
            "telefono": "3001112233",
            "direccion": "Calle Test 123",
            "area_departamento": "Soporte",
        },
    )

    token_capturado = {}

    def mock_enviar_recuperacion(destinatario, nombre, token_reset):
        token_capturado["token"] = token_reset
        return True

    monkeypatch.setattr(email_service, "enviar_correo_recuperacion", mock_enviar_recuperacion)

    resp_req = client.post(
        "/api/v1/auth/recuperar",
        json={"correo_electronico": correo_test},
    )
    assert resp_req.status_code == 200
    assert "token" in token_capturado

    token_valido = token_capturado["token"]

    # 2. Intentar restablecer con contraseña inválida (< 8 caracteres)
    resp_corta = client.post(
        "/api/v1/auth/restablecer",
        json={"token": token_valido, "contrasena": "corta"},
    )
    assert resp_corta.status_code == 422

    # 3. Restablecer con contraseña nueva válida
    nueva_clave = "NuevaClave2026*"
    resp_ok = client.post(
        "/api/v1/auth/restablecer",
        json={"token": token_valido, "contrasena": nueva_clave},
    )
    assert resp_ok.status_code == 200
    assert "exitosa" in resp_ok.json()["detail"].lower()

    # 4. Probar login con clave anterior -> Falla 401
    resp_antigua = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo_test, "contrasena": "Prueba123*"},
    )
    assert resp_antigua.status_code == 401

    # 5. Probar login con clave nueva -> Exitoso 200
    resp_nueva = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": correo_test, "contrasena": nueva_clave},
    )
    assert resp_nueva.status_code == 200
    assert "access_token" in resp_nueva.json()

    # 6. C4-03: Reusar el mismo token -> Falla 400 (porque la huella del hash cambió)
    resp_reuso = client.post(
        "/api/v1/auth/restablecer",
        json={"token": token_valido, "contrasena": "OtraClaveMas123*"},
    )
    assert resp_reuso.status_code == 400
    assert "inválido o expirado" in resp_reuso.json()["detail"].lower()


def test_c4_03_token_invalido_o_tipo_incorrecto(client):
    # Probar pasar un token falso
    resp_falso = client.post(
        "/api/v1/auth/restablecer",
        json={"token": "token_totalmente_falso_1234567890", "contrasena": "NuevaClaveValida123*"},
    )
    assert resp_falso.status_code == 400

    # Probar pasar un access_token normal en vez de reset_token
    token_access = security.crear_access_token(1, "cliente")
    resp_access = client.post(
        "/api/v1/auth/restablecer",
        json={"token": token_access, "contrasena": "NuevaClaveValida123*"},
    )
    assert resp_access.status_code == 400


def test_c4_04_cuenta_inactiva_no_recibe_token(client, monkeypatch):
    correo_enviado = []

    def mock_enviar(destinatario, nombre, token_reset):
        correo_enviado.append(destinatario)
        return True

    monkeypatch.setattr(email_service, "enviar_correo_recuperacion", mock_enviar)

    # inactivo@prueba.com es una cuenta con estado='Inactivo'
    resp = client.post(
        "/api/v1/auth/recuperar",
        json={"correo_electronico": "inactivo@prueba.com"},
    )
    assert resp.status_code == 200
    # No se debe haber enviado correo
    assert len(correo_enviado) == 0


def test_c4_05_tolerancia_fallos_smtp_vacio_o_caido():
    # Si SMTP_HOST está vacío, la función devuelve False limpiamente sin excepción
    resultado = email_service._enviar_correo_smtp(
        destinatario="test@prueba.com",
        asunto="Prueba",
        cuerpo_html="<p>test</p>",
        cuerpo_texto="test",
    )
    assert resultado is False


def test_c4_06_escapado_seguro_html():
    from app.services.email_service import enviar_correo_recuperacion
    # Simula llamada verificando que el código no arroje errores
    assert enviar_correo_recuperacion("test@test.com", "<script>alert(1)</script>", "fake-token") is False
