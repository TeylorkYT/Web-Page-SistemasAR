import { cliente } from "../api/client";

export async function listarCategorias() {
  const { data } = await cliente.get("/categorias");
  return data;
}

export const obtenerCategorias = listarCategorias;

export async function crearCategoria(datos) {
  try {
    const { data } = await cliente.post("/categorias", datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al crear la categoría");
  }
}

export async function actualizarCategoria(id, datos) {
  try {
    const { data } = await cliente.put(`/categorias/${id}`, datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al actualizar la categoría");
  }
}

export async function eliminarCategoria(id) {
  try {
    const { data } = await cliente.delete(`/categorias/${id}`);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al eliminar la categoría");
  }
}
