def test_login_correcto_tres_roles_activos(client):
    usuarios = [
        ("admin@prueba.com", "administrador"),
        ("tecnico@prueba.com", "tecnico"),
        ("cliente@prueba.com", "cliente"),
    ]

    for correo, rol_esperado in usuarios:
        respuesta = client.post(
            "/api/v1/auth/login",
            json={"correo_electronico": correo, "contrasena": "Prueba123*"},
        )
        assert respuesta.status_code == 200
        datos = respuesta.json()
        assert "access_token" in datos
        assert "refresh_token" in datos
        assert datos["token_type"] == "bearer"
        assert datos["rol"] == rol_esperado
        assert isinstance(datos["nombre"], str) and len(datos["nombre"]) > 0


def test_login_contrasena_incorrecta(client):
    respuesta = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": "admin@prueba.com", "contrasena": "ClaveIncorrecta"},
    )
    assert respuesta.status_code == 401
    assert respuesta.json() == {"detail": "Correo o contraseña incorrectos"}


def test_login_correo_inexistente(client):
    respuesta = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": "inexistente@prueba.com", "contrasena": "Prueba123*"},
    )
    assert respuesta.status_code == 401
    assert respuesta.json() == {"detail": "Correo o contraseña incorrectos"}


def test_login_usuario_inactivo(client):
    respuesta = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": "inactivo@prueba.com", "contrasena": "Prueba123*"},
    )
    assert respuesta.status_code == 403
    assert respuesta.json() == {"detail": "Cuenta inactiva"}


def test_me_sin_token_responde_401(client):
    respuesta = client.get("/api/v1/auth/me")
    assert respuesta.status_code == 401
    assert respuesta.json() == {"detail": "Token inválido o vencido"}


def test_me_con_token_valido_responde_200(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": "cliente@prueba.com", "contrasena": "Prueba123*"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    respuesta = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert datos["correo_electronico"] == "cliente@prueba.com"
    assert datos["rol"] == "cliente"
    assert "nombre" in datos
    assert "apellido" in datos
    assert "id_usuario" in datos


def test_refresh_token_valido_e_invalido(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"correo_electronico": "tecnico@prueba.com", "contrasena": "Prueba123*"},
    )
    assert login_resp.status_code == 200
    refresh_token = login_resp.json()["refresh_token"]
    access_token = login_resp.json()["access_token"]

    # Con refresh token válido -> 200 y tokens nuevos
    resp_refresh = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert resp_refresh.status_code == 200
    nuevos_tokens = resp_refresh.json()
    assert "access_token" in nuevos_tokens
    assert "refresh_token" in nuevos_tokens
    assert nuevos_tokens["rol"] == "tecnico"

    # Con un access token en lugar del refresh token -> 401
    resp_invalido = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": access_token},
    )
    assert resp_invalido.status_code == 401
    assert resp_invalido.json() == {"detail": "Refresh token inválido o vencido"}
