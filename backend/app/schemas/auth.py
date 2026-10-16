from pydantic import BaseModel


class LoginIn(BaseModel):
    correo_electronico: str
    contrasena: str


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
