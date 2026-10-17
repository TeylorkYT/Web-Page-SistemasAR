/**
 * ==============================================================================
 * SISTEMASAR - SERVICIO DE TÉCNICO (tecnicoService.js)
 * ==============================================================================
 * Desarrollado por: Cristian (Responsable del Módulo Técnico)
 *
 * Capa de servicios asíncronos con datos falsos para el módulo técnico:
 * - Vista 10: Dashboard del técnico (tickets asignados, métricas de trabajo)
 * - Vista 11: Detalle del ticket asignado (información completa y cambio de estado)
 * - Vista 12: Actualizar avance (registro en el historial y bitácora del ticket)
 * - Vista 13: Consulta de inventario / repuestos disponibles (solo lectura)
 *
 * Cumple con las reglas del Daily 2:
 * 1. Funciones async que simulan llamadas al backend.
 * 2. Ninguna vista accede directamente a datosFalsos.js.
 * 3. Los campos coinciden exactamente con el DDL de database/.
 * ==============================================================================
 */

import { cliente } from "../api/client";

// Técnico por defecto para la sesión simulada (Diana Paz - ID 2)
export const TECNICO_ACTUAL = {
  id_usuario: 2,
  nombre: "Diana",
  apellido: "Paz",
  correo_electronico: "tecnico@prueba.com",
  rol: "Tecnico"
};

/**
 * Obtiene los datos del técnico activo
 */
export async function obtenerTecnicoActual() {
  return { ...TECNICO_ACTUAL };
}

/**
 * Vista 10: Obtiene todos los tickets asignados al técnico especificado
 */
export async function obtenerTicketsTecnico() {
  const { data } = await cliente.get("/tickets");
  return data.map((t) => ({
    ...t,
    codigo: `TKT-${t.id_ticket}`,
    cliente: {
      id_usuario: t.id_cliente,
      nombre: (t.cliente_nombre || "").split(" ")[0] || "Cliente",
      apellido: (t.cliente_nombre || "").split(" ").slice(1).join(" ") || "",
    },
    nombresCategorias: (t.categorias || []).map((c) => c.nombre_categoria || c),
  }));
}

export async function obtenerMetricasDashboardTecnico() {
  const { data: tickets } = await cliente.get("/tickets");
  const asignados = tickets.length;
  const enProceso = tickets.filter((t) => t.estado === "En_Proceso").length;
  const resueltos = tickets.filter((t) => t.estado === "Resuelto").length;
  const cerrados = tickets.filter((t) => t.estado === "Cerrado").length;

  return {
    ticketsAsignados: asignados,
    ticketsEnProceso: enProceso,
    ticketsResueltos: resueltos,
    ticketsCerrados: cerrados,
    disponiblesRepuestos: 0,
  };
}

export async function obtenerDetalleTicket(idTicket) {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  const [ticketResp, histResp, comResp] = await Promise.all([
    cliente.get(`/tickets/${idStr}`),
    cliente.get(`/tickets/${idStr}/historial`),
    cliente.get(`/tickets/${idStr}/comentarios`),
  ]);

  const t = ticketResp.data;
  return {
    ...t,
    codigo: `TKT-${t.id_ticket}`,
    cliente: {
      id_usuario: t.id_cliente,
      nombre: (t.cliente_nombre || "").split(" ")[0] || "Cliente",
      apellido: (t.cliente_nombre || "").split(" ").slice(1).join(" ") || "",
      correo_electronico: "",
    },
    nombresCategorias: (t.categorias || []).map((c) => c.nombre_categoria || c),
    historial: histResp.data.map((h) => ({
      ...h,
      detalles: h.detalles || h.tipo_accion,
    })),
    comentarios: comResp.data.map((c) => ({
      ...c,
      autor: c.usuario_nombre,
      rolAutor: c.rol,
    })),
  };
}

export async function cambiarEstadoTicket(idTicket, nuevoEstado, detalles = "") {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  try {
    if (nuevoEstado === "Resuelto") {
      await cliente.post(`/tickets/${idStr}/reporte`, {
        solucion_aplicada: detalles || "Solución técnica aplicada",
      });
    } else if (nuevoEstado === "Cerrado") {
      await cliente.patch(`/tickets/${idStr}/estado`, {
        estado_nuevo: "Cerrado",
      });
    }
    const { data } = await cliente.get(`/tickets/${idStr}`);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al cambiar el estado del ticket");
  }
}

export async function registrarAvance(idTicket, { detalles, tipoAccion: _tipoAccion = "Comentario", nuevoEstado = null, solucion_aplicada = null, es_nota_interna = false }) {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  try {
    if (detalles && detalles.trim()) {
      await cliente.post(`/tickets/${idStr}/comentarios`, {
        contenido: detalles.trim(),
        es_nota_interna: Boolean(es_nota_interna),
      });
    }
    if (nuevoEstado === "Resuelto") {
      await cliente.post(`/tickets/${idStr}/reporte`, {
        solucion_aplicada: solucion_aplicada || detalles || "Solución técnica aplicada",
      });
    } else if (nuevoEstado === "Cerrado") {
      await cliente.patch(`/tickets/${idStr}/estado`, {
        estado_nuevo: "Cerrado",
      });
    }
    return { exito: true };
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al registrar el avance");
  }
}

export {
  subirAdjunto,
  listarAdjuntos,
  descargarAdjunto,
} from "./ticketsService";