from datetime import date
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hashear_contrasena
from app.db.database import Base, get_db
from app.main import app
from app.models.usuario import Usuario  # Asegura registro de tabla en Base.metadata


def _obtener_engine_pruebas():
    # Si hay variables TEST_DB_*, intentar conectar a MySQL
    if os.getenv("TEST_DB_HOST") and os.getenv("TEST_DB_USER"):
        url = URL.create(
            "mysql+pymysql",
            username=os.getenv("TEST_DB_USER"),
            password=os.getenv("TEST_DB_PASSWORD"),
            host=os.getenv("TEST_DB_HOST"),
            port=int(os.getenv("TEST_DB_PORT", "3306")),
            database=os.getenv("TEST_DB_NAME", "sistemas_ar_test"),
            query={"charset": "utf8mb4"},
        )
        try:
            engine = create_engine(url, pool_pre_ping=True)
            with engine.connect():
                return engine
        except Exception:
            pass

    # SQLite con StaticPool mantiene las tablas y datos compartidos en memoria
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    return engine


def _poblar_usuarios_prueba(session):
    hash_prueba = hashear_contrasena("Prueba123*")
    usuarios = [
        Usuario(
            id_usuario=1,
            nombre="Carlos",
            apellido="Admin",
            correo_electronico="admin@prueba.com",
            contrasena=hash_prueba,
            rol="Administrador",
            fecha_registro=date(2026, 8, 1),
            estado="Activo",
        ),
        Usuario(
            id_usuario=2,
            nombre="Diana",
            apellido="Tecnico",
            correo_electronico="tecnico@prueba.com",
            contrasena=hash_prueba,
            rol="Tecnico",
            fecha_registro=date(2026, 8, 1),
            estado="Activo",
        ),
        Usuario(
            id_usuario=3,
            nombre="Laura",
            apellido="Cliente",
            correo_electronico="cliente@prueba.com",
            contrasena=hash_prueba,
            rol="Cliente",
            fecha_registro=date(2026, 8, 2),
            estado="Activo",
        ),
        Usuario(
            id_usuario=4,
            nombre="Inactivo",
            apellido="Prueba",
            correo_electronico="inactivo@prueba.com",
            contrasena=hash_prueba,
            rol="Cliente",
            fecha_registro=date(2026, 8, 5),
            estado="Inactivo",
        ),
    ]
    for u in usuarios:
        existente = session.get(Usuario, u.id_usuario)
        if not existente:
            session.add(u)
    session.commit()


@pytest.fixture(scope="session")
def test_engine():
    engine = _obtener_engine_pruebas()
    Base.metadata.create_all(engine)
    sesiones = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with sesiones() as s:
        _poblar_usuarios_prueba(s)
    return engine


@pytest.fixture()
def client(test_engine):
    sesiones = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)

    def get_db_pruebas():
        db = sesiones()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_db_pruebas
    yield TestClient(app)
    app.dependency_overrides.clear()
