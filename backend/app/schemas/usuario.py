from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

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
    nombre: str = Field(..., min_length=1, max_length=50)
    apellido: str = Field(..., min_length=1, max_length=50)
    correo_electronico: str = Field(..., min_length=3, max_length=100)
    contrasena: str = Field(..., min_length=8, max_length=72)
    telefono: str = Field(..., min_length=1, max_length=20)
    direccion: str = Field(..., min_length=1, max_length=150)
    area_departamento: str = Field(default="General", max_length=80)


class RecuperarIn(BaseModel):
    correo_electronico: str = Field(..., min_length=3, max_length=100)


class UsuarioCrearIn(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50)
    apellido: str = Field(..., min_length=1, max_length=50)
    correo_electronico: str = Field(..., min_length=3, max_length=100)
    contrasena: str = Field(..., min_length=8, max_length=72)
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
    correo_electronico: str | None = Field(default=None, min_length=3, max_length=100)
    contrasena: str | None = Field(default=None, min_length=8, max_length=72)
    estado: EstadoUsuario | None = None
    telefono: str | None = Field(default=None, max_length=20)
    direccion: str | None = Field(default=None, max_length=150)
    area_departamento: str | None = Field(default=None, max_length=80)
    especialidad: str | None = Field(default=None, max_length=80)
    disponibilidad: DisponibilidadTecnico | None = None
    cargo: str | None = Field(default=None, max_length=80)
