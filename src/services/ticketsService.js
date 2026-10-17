import { cliente } from "../api/client";

/**
 * Lista todos los tickets aplicando filtros según el rol del usuario autenticado
 * @param {Object} [filtros={}] - Filtros opcionales (estado, prioridad, id_tecnico)
 */
export async function listarTickets(filtros = {}) {
  const { data } = await cliente.get("/tickets", { params: filtros });
  return data.map((t) => ({
    ...t,
    codigo: `TKT-${t.id_ticket}`,
    categorias: (t.categorias || []).map((c) =>
      typeof c === "object" ? c.nombre_categoria : c
    ),
  }));
}

/**
 * Obtiene el detalle completo de un ticket (incluye reporte, calificación, historial y comentarios)
 * @param {number|string} id
 */
export async function obtenerTicket(id) {
  const [ticketResp, histResp, comResp] = await Promise.all([
    cliente.get(`/tickets/${id}`),
    cliente.get(`/tickets/${id}/historial`),
    cliente.get(`/tickets/${id}/comentarios`),
  ]);

  const t = ticketResp.data;
  return {
    ...t,
    codigo: `TKT-${t.id_ticket}`,
    categorias: (t.categorias || []).map((c) =>
      typeof c === "object" ? c.nombre_categoria : c
    ),
    historial: histResp.data.map((h) => ({
      ...h,
      nombre_usuario: h.usuario_nombre,
    })),
    comentarios: comResp.data.map((c) => ({
      ...c,
      autor: c.usuario_nombre,
      rolAutor: c.rol,
    })),
  };
}

/**
 * Registra un nuevo ticket en el sistema
 * @param {{ titulo: string, descripcion: string, modalidad?: string, id_equipo?: number|null, categorias?: number[], categorias_ids?: number[] }} datos
 */
export async function crearTicket(datos) {
  try {
    const payload = {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      modalidad: datos.modalidad || "Presencial",
      id_equipo: datos.id_equipo ?? null,
      categorias: datos.categorias || datos.categorias_ids || [],
    };
    const { data } = await cliente.post("/tickets", payload);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al crear el ticket");
  }
}

/**
 * Obtiene el historial cronológico de acciones sobre el ticket
 * @param {number|string} id
 */
export async function obtenerHistorial(id) {
  const { data } = await cliente.get(`/tickets/${id}/historial`);
  return data.map((h) => ({
    ...h,
    nombre_usuario: h.usuario_nombre,
  }));
}

/**
 * Obtiene los comentarios del ticket (oculta notas internas si el usuario es cliente)
 * @param {number|string} id
 */
export async function obtenerComentarios(id) {
  const { data } = await cliente.get(`/tickets/${id}/comentarios`);
  return data.map((c) => ({
    ...c,
    autor: c.usuario_nombre,
    rolAutor: c.rol,
  }));
}

/**
 * Agrega un nuevo comentario o nota interna
 * @param {number|string} id
 * @param {{ contenido: string, es_nota_interna?: boolean }} datos
 */
export async function comentar(id, datos) {
  try {
    const { data } = await cliente.post(`/tickets/${id}/comentarios`, datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al enviar el comentario");
  }
}

/**
 * Califica la atención de un ticket resuelto y lo transiciona a Cerrado
 * @param {number|string} id
 * @param {{ puntuacion: number, comentario?: string }} datos
 */
export async function calificar(id, datos) {
  try {
    const { data } = await cliente.post(`/tickets/${id}/calificacion`, datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al enviar la calificación");
  }
}

/**
 * Calificar ticket (versión con id_ticket dentro del objeto para compatibilidad de vistas existentes)
 */
export async function calificarTicket(datos) {
  const id = datos.id_ticket;
  return calificar(id, {
    puntuacion: datos.puntuacion,
    comentario: datos.comentario || null,
  });
}

/**
 * Cierra un ticket resuelto sin calificar
 * @param {number|string} id
 */
export async function cerrarTicket(id) {
  try {
    const { data } = await cliente.patch(`/tickets/${id}/estado`, {
      estado_nuevo: "Cerrado",
    });
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al cerrar el ticket");
  }
}

/**
 * Lista las categorías activas
 */
export async function listarCategorias() {
  const { data } = await cliente.get("/categorias");
  return data;
}

/**
 * Sube un archivo adjunto como evidencia a un ticket
 * @param {number|string} idTicket
 * @param {File} archivo
 */
export async function subirAdjunto(idTicket, archivo) {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  const formData = new FormData();
  formData.append("archivo", archivo);

  try {
    const { data } = await cliente.post(`/tickets/${idStr}/adjuntos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al subir el archivo adjunto");
  }
}

/**
 * Obtiene la lista de adjuntos de un ticket
 * @param {number|string} idTicket
 */
export async function listarAdjuntos(idTicket) {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  try {
    const { data } = await cliente.get(`/tickets/${idStr}/adjuntos`);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al obtener adjuntos");
  }
}

/**
 * Descarga de manera segura un archivo adjunto con token de autenticación
 * @param {number|string} idTicket
 * @param {number|string} idAdjunto
 * @param {string} [nombreArchivo]
 */
export async function descargarAdjunto(idTicket, idAdjunto, nombreArchivo = "adjunto") {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  try {
    const respuesta = await cliente.get(`/tickets/${idStr}/adjuntos/${idAdjunto}/descargar`, {
      responseType: "blob",
    });

    const tipoMime = respuesta.headers["content-type"] || "application/octet-stream";
    const blob = new Blob([respuesta.data], { type: tipoMime });
    const blobUrl = window.URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = blobUrl;
    enlace.setAttribute("download", nombreArchivo);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al descargar el archivo");
  }
}
