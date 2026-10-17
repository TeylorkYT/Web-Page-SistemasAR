"""
Script de pruebas de carga y estrés con Locust (Tarea T5-07 / RNF-02).
Simula hasta 100 usuarios concurrentes sobre el backend de SistemasAR:
- Inicio de sesión (autenticación JWT)
- Consulta de perfil
- Listado de tickets
- Creación de ticket

Uso:
  pip install locust
  locust -f deploy/test_carga_locust.py --headless -u 100 -r 10 --run-time 1m --host http://127.0.0.1:8000
"""

import random
from locust import HttpUser, task, between


class UsuarioMesaAyuda(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        """Autenticación inicial de cada usuario virtual."""
        correos = [
            "cliente@prueba.com",
            "tecnico@prueba.com",
            "admin@prueba.com",
        ]
        correo = random.choice(correos)
        resp = self.client.post(
            "/api/v1/auth/login",
            json={"correo_electronico": correo, "contrasena": "Prueba123*"},
            name="/api/v1/auth/login",
        )
        if resp.status_code == 200:
            self.token = resp.json().get("access_token")

    @property
    def headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    @task(3)
    def listar_tickets(self):
        """Consultar listado de tickets."""
        if not self.token:
            return
        self.client.get("/api/v1/tickets", headers=self.headers, name="/api/v1/tickets [listado]")

    @task(2)
    def consultar_perfil(self):
        """Consultar datos de perfil."""
        if not self.token:
            return
        self.client.get("/api/v1/auth/me", headers=self.headers, name="/api/v1/auth/me")

    @task(1)
    def crear_ticket(self):
        """Creación de ticket de prueba."""
        if not self.token:
            return
        payload = {
            "titulo": f"Ticket de carga concurrente #{random.randint(1000, 999999)}",
            "descripcion": "Incidencia generada durante prueba de estrés de 100 usuarios concurrentes.",
            "modalidad": "Remoto",
            "categorias": [1],
        }
        self.client.post("/api/v1/tickets", json=payload, headers=self.headers, name="/api/v1/tickets [creación]")
