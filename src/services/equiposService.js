import { cliente } from "../api/client";

export async function listarEquipos(params = {}) {
  const { data } = await cliente.get("/equipos", { params });
  return data;
}

export const obtenerEquipos = listarEquipos;

export async function crearEquipo(datos) {
  try {
    const { data } = await cliente.post("/equipos", datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al registrar el equipo");
  }
}

export async function actualizarEquipo(id, datos) {
  try {
    const { data } = await cliente.put(`/equipos/${id}`, datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al actualizar el equipo");
  }
}
