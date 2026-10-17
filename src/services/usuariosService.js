import { cliente } from "../api/client";

export async function listarUsuarios(params = {}) {
  const { data } = await cliente.get("/usuarios", { params });
  return data;
}

export async function crearUsuario(datos) {
  try {
    const { data } = await cliente.post("/usuarios", datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al crear el usuario");
  }
}

export async function actualizarUsuario(idUsuario, datos) {
  try {
    const { data } = await cliente.put(`/usuarios/${idUsuario}`, datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al actualizar el usuario");
  }
}