import os

from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", os.getenv("ENVIRONMENT", "development")).lower()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "sistemas_ar")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "60"))
REFRESH_TOKEN_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "7"))

CORS_ORIGINS = [orig.strip() for orig in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if orig.strip()]
if ENV == "production":
    CORS_ORIGINS = [orig for orig in CORS_ORIGINS if orig != "*"]

UPLOAD_DIR = os.getenv(
    "UPLOAD_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads")),
)
os.makedirs(UPLOAD_DIR, exist_ok=True)


def validar_configuracion_produccion() -> None:
    if ENV == "production":
        secreto_inseguro = "clave-secreta-jwt-sistemas-ar-desarrollo-local"
        if not JWT_SECRET or JWT_SECRET.strip() == "" or JWT_SECRET == secreto_inseguro:
            raise RuntimeError("JWT_SECRET obligatorio y seguro en entorno de producción")


validar_configuracion_produccion()

