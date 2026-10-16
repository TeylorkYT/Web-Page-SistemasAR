from datetime import date
import re
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StringConstraints

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validar_correo(valor: str) -> str:
    valor = valor.strip().lower()
    if not _EMAIL_RE.match(valor):
        raise ValueError("Correo electrónico inválido")
    return valor


def _validar_clave_bcrypt(valor: str) -> str:
    # bcrypt limita a 72 BYTES (no caracteres): evita ValueError -> HTTP 500
    if len(valor.encode("utf-8")) > 72:
        raise ValueError("La contraseña no puede superar 72 bytes")
    return valor


Correo = Annotated[str, StringConstraints(max_length=100), AfterValidator(_validar_correo)]
Clave = Annotated[str, Field(min_length=8, max_length=72), AfterValidator(_validar_clave_bcrypt)]
TextoLimpio50 = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]

RolUsuario = Literal["cliente", "tecnico", "administrador"]
RolInput = Literal["Cliente", "Tecnico", "Administrador", "cliente", "tecnico", "administrador"]
EstadoUsuario = Literal["Activo", "Inactivo"]
DisponibilidadTecnico = Literal["Disponible", "Ocupado", "En_Almuerzo", "Fuera_de_Servicio"]


class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    correo_electronico: str
    rol: RolUsuario
    estado: EstadoUsuario
    fecha_registro: date
    telefono: str | None = None
    direccion: str | None = None
    area_departamento: str | None = None
    especialidad: str | None = None
    disponibilidad: str | None = None
    cargo: str | None = None

    model_config = ConfigDict(from_attributes=True)


class RegistroClienteIn(BaseModel):
    nombre: TextoLimpio50
    apellido: TextoLimpio50
    correo_electronico: Correo
    contrasena: Clave
    telefono: str = Field(..., min_length=1, max_length=20)
    direccion: str = Field(..., min_length=1, max_length=150)
    area_departamento: str = Field(default="General", max_length=80)


class RecuperarIn(BaseModel):
    correo_electronico: Correo


class UsuarioCrearIn(BaseModel):
    nombre: TextoLimpio50
    apellido: TextoLimpio50
    correo_electronico: Correo
    contrasena: Clave
    rol: RolInput
    estado: EstadoUsuario = "Activo"
    telefono: str | None = Field(default=None, max_length=20)
    direccion: str | None = Field(default=None, max_length=150)
    area_departamento: str | None = Field(default="General", max_length=80)
    especialidad: str | None = Field(default="Soporte General TI", max_length=80)
    disponibilidad: DisponibilidadTecnico | None = "Disponible"
    cargo: str | None = Field(default="Coordinador de Soporte TI", max_length=80)


class UsuarioUpdateIn(BaseModel):
    nombre: str | None = Field(default=None, max_length=50)
    apellido: str | None = Field(default=None, max_length=50)
    correo_electronico: Correo | None = None
    contrasena: Clave | None = None
    estado: EstadoUsuario | None = None
    telefono: str | None = Field(default=None, max_length=20)
    direccion: str | None = Field(default=None, max_length=150)
    area_departamento: str | None = Field(default=None, max_length=80)
    especialidad: str | None = Field(default=None, max_length=80)
    disponibilidad: DisponibilidadTecnico | None = None
    cargo: str | None = Field(default=None, max_length=80)
