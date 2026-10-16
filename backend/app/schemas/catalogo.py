from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# Categorías
# ==========================================
class CategoriaIn(BaseModel):
    nombre_categoria: str = Field(..., min_length=1, max_length=50)
    descripcion: str | None = Field(default=None, max_length=255)


class CategoriaOut(BaseModel):
    id_categoria: int
    nombre_categoria: str
    descripcion: str | None = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Equipos
# ==========================================
TipoEquipo = Literal["Computador", "Impresora", "Servidor", "Red", "Otro"]
EstadoEquipo = Literal["Operativo", "En_Reparacion", "Fuera_de_Servicio"]


class EquipoIn(BaseModel):
    tipo: TipoEquipo
    marca: str = Field(..., min_length=1, max_length=50)
    modelo: str = Field(..., min_length=1, max_length=50)
    serial: str = Field(..., min_length=1, max_length=50)
    sistema_operativo: str | None = Field(default=None, max_length=50)
    area_departamento: str = Field(default="General", max_length=80)
    id_cliente: int | None = None


class EquipoUpdateIn(BaseModel):
    tipo: TipoEquipo | None = None
    marca: str | None = Field(default=None, max_length=50)
    modelo: str | None = Field(default=None, max_length=50)
    serial: str | None = Field(default=None, max_length=50)
    sistema_operativo: str | None = Field(default=None, max_length=50)
    area_departamento: str | None = Field(default=None, max_length=80)
    estado_equipo: EstadoEquipo | None = None


class EquipoOut(BaseModel):
    id_equipo: int
    tipo: str
    marca: str
    modelo: str
    serial: str
    sistema_operativo: str | None = None
    area_departamento: str
    id_cliente: int
    estado_equipo: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Técnicos
# ==========================================
class TecnicoOut(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    especialidad: str
    disponibilidad: str
    tickets_en_proceso: int

    model_config = ConfigDict(from_attributes=True)
