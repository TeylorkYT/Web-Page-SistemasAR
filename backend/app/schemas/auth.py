from pydantic import BaseModel, field_validator


class LoginIn(BaseModel):
    correo_electronico: str
    contrasena: str

    @field_validator("correo_electronico")
    @classmethod
    def _normalizar_correo(cls, v: str) -> str:
        return v.strip().lower()


class RefreshIn(BaseModel):
    refresh_token: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str


class PerfilOut(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    correo_electronico: str
    rol: str
