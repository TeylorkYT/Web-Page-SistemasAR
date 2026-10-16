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

import {
  tickets as ticketsIniciales,
  usuarios as usuariosIniciales,
  equipos as equiposIniciales,
  categorias as categoriasIniciales,
  historialTickets as historialInicial,
  comentarios as comentariosIniciales,
  inventario as inventarioInicial
} from "../data/datosFalsos";

// ------------------------------------------------------------------------------
// ESTADO MUTABLE EN MEMORIA PARA LA SESIÓN ACTIVA
// ------------------------------------------------------------------------------
let ticketsMemoria = JSON.parse(JSON.stringify(ticketsIniciales));
let historialMemoria = JSON.parse(JSON.stringify(historialInicial));
let comentariosMemoria = JSON.parse(JSON.stringify(comentariosIniciales));
let inventarioMemoria = JSON.parse(JSON.stringify(inventarioInicial));

// Técnico por defecto para la sesión simulada (Diana Paz - ID 2)
export const TECNICO_ACTUAL = {
  id_usuario: 2,
  nombre: "Diana",
  apellido: "Paz",
  correo_electronico: "tecnico@prueba.com",
  rol: "Tecnico"
};

/**
 * Simula una breve latencia de red para dar realismo a las promesas
 */
const simularLatencia = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Obtiene los datos del técnico activo en la sesión simulada
 */
export async function obtenerTecnicoActual() {
  await simularLatencia(60);
  return { ...TECNICO_ACTUAL };
}

/**
 * Enriquece un objeto ticket con la información relacionada de cliente, equipo y categorías
 */
function enriquecerTicket(ticket) {
  if (!ticket) return null;

  const cliente = usuariosIniciales.find((u) => u.id_usuario === ticket.id_cliente) || {
    id_usuario: ticket.id_cliente,
    nombre: "Cliente",
    apellido: "Desconocido",
    correo_electronico: "sin_correo@empresa.com"
  };

  const equipo = equiposIniciales.find((e) => e.id_equipo === ticket.id_equipo) || null;

  const categoriasAsociadas = (ticket.categorias_ids || [])
    .map((catId) => {
      const cat = categoriasIniciales.find((c) => c.id_categoria === catId);
      return cat ? cat.nombre_categoria : null;
    })
    .filter(Boolean);

  return {
    ...ticket,
    cliente,
    equipo,
    nombresCategorias: categoriasAsociadas
  };
}

/**
 * Vista 10: Obtiene todos los tickets asignados al técnico especificado
 * @param {number} [idTecnico=2] - ID del técnico
 */
export async function obtenerTicketsTecnico(idTecnico = TECNICO_ACTUAL.id_usuario) {
  await simularLatencia();
  const asignados = ticketsMemoria.filter((t) => Number(t.id_tecnico) === Number(idTecnico));
  return asignados.map(enriquecerTicket);
}

/**
 * Vista 10: Obtiene el resumen numérico de tickets para el dashboard
 * @param {number} [idTecnico=2]
 */
export async function obtenerMetricasDashboardTecnico(idTecnico = TECNICO_ACTUAL.id_usuario) {
  await simularLatencia(80);
  const ticketsTecnico = ticketsMemoria.filter((t) => Number(t.id_tecnico) === Number(idTecnico));

  const asignados = ticketsTecnico.length;
  const enProceso = ticketsTecnico.filter((t) => t.estado === "En_Proceso").length;
  const resueltos = ticketsTecnico.filter((t) => t.estado === "Resuelto").length;
  const cerrados = ticketsTecnico.filter((t) => t.estado === "Cerrado").length;

  return {
    ticketsAsignados: asignados,
    ticketsEnProceso: enProceso,
    ticketsResueltos: resueltos,
    ticketsCerrados: cerrados,
    disponiblesRepuestos: inventarioMemoria.filter((i) => i.estado === "Disponible").length
  };
}

/**
 * Vista 11: Obtiene el detalle completo de un ticket específico con su historial y comentarios
 * @param {number|string} idTicket
 */
export async function obtenerDetalleTicket(idTicket) {
  await simularLatencia();
  const ticketEncontrado = ticketsMemoria.find((t) => String(t.id_ticket) === String(idTicket));

  if (!ticketEncontrado) {
    throw new Error(`El ticket #${idTicket} no fue encontrado.`);
  }

  const enriquecido = enriquecerTicket(ticketEncontrado);

  const historial = historialMemoria
    .filter((h) => String(h.id_ticket) === String(idTicket))
    .sort((a, b) => new Date(b.fecha_accion) - new Date(a.fecha_accion));

  const comentarios = comentariosMemoria
    .filter((c) => String(c.id_ticket) === String(idTicket))
    .map((c) => {
      const autor = usuariosIniciales.find((u) => u.id_usuario === c.id_usuario);
      return {
        ...c,
        autor: autor ? `${autor.nombre} ${autor.apellido}` : "Usuario",
        rolAutor: autor ? autor.rol : "Desconocido"
      };
    })
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

  return {
    ...enriquecido,
    historial,
    comentarios
  };
}

/**
 * Vista 11: Cambia el estado de un ticket y registra la acción en el historial
 * @param {number|string} idTicket
 * @param {string} nuevoEstado - 'Abierto' | 'En_Proceso' | 'Resuelto' | 'Cerrado'
 * @param {string} [detalles=''] - Nota opcional sobre el cambio
 */
export async function cambiarEstadoTicket(idTicket, nuevoEstado, detalles = "") {
  await simularLatencia(150);
  const index = ticketsMemoria.findIndex((t) => String(t.id_ticket) === String(idTicket));

  if (index === -1) {
    throw new Error(`El ticket #${idTicket} no existe.`);
  }

  const estadoAnterior = ticketsMemoria[index].estado;
  ticketsMemoria[index].estado = nuevoEstado;

  const ahora = new Date();
  const fechaStr = ahora.toISOString().split("T")[0];
  const horaStr = ahora.toTimeString().split(" ")[0];
  const fechaCompleta = `${fechaStr} ${horaStr}`;

  if (nuevoEstado === "Resuelto" && !ticketsMemoria[index].fecha_resolucion) {
    ticketsMemoria[index].fecha_resolucion = fechaStr;
  }
  if (nuevoEstado === "Cerrado" && !ticketsMemoria[index].fecha_cierre) {
    ticketsMemoria[index].fecha_cierre = fechaStr;
  }

  // Registrar en historial
  const nuevoHistorial = {
    id_historial: historialMemoria.length + 1,
    id_ticket: Number(idTicket),
    tipo_accion: "Cambio_Estado",
    estado_anterior: estadoAnterior,
    estado_nuevo: nuevoEstado,
    fecha_accion: fechaCompleta,
    id_usuario: TECNICO_ACTUAL.id_usuario,
    detalles: detalles || `Estado cambiado de ${estadoAnterior} a ${nuevoEstado} por ${TECNICO_ACTUAL.nombre} ${TECNICO_ACTUAL.apellido}`
  };

  historialMemoria.unshift(nuevoHistorial);

  return enriquecerTicket(ticketsMemoria[index]);
}

/**
 * Vista 12: Registra un avance o trabajo técnico en el historial y bitácora del ticket
 * @param {number|string} idTicket
 * @param {Object} datosAvance
 * @param {string} datosAvance.detalles - Descripción detallada del trabajo realizado
 * @param {string} [datosAvance.tipoAccion='Comentario'] - 'Comentario' | 'Diagnostico' | 'Reparacion'
 * @param {string} [datosAvance.nuevoEstado] - Si se desea transicionar de estado a la vez
 */
export async function registrarAvance(idTicket, { detalles, tipoAccion = "Comentario", nuevoEstado = null }) {
  await simularLatencia(180);

  if (!detalles || detalles.trim().length === 0) {
    throw new Error("El detalle del avance no puede estar vacío.");
  }

  const index = ticketsMemoria.findIndex((t) => String(t.id_ticket) === String(idTicket));
  if (index === -1) {
    throw new Error(`El ticket #${idTicket} no existe.`);
  }

  const ahora = new Date();
  const fechaStr = ahora.toISOString().split("T")[0];
  const horaStr = ahora.toTimeString().split(" ")[0];
  const fechaCompleta = `${fechaStr} ${horaStr}`;

  let estadoAnterior = ticketsMemoria[index].estado;
  let estadoFinal = estadoAnterior;

  if (nuevoEstado && nuevoEstado !== estadoAnterior) {
    ticketsMemoria[index].estado = nuevoEstado;
    estadoFinal = nuevoEstado;

    if (nuevoEstado === "Resuelto" && !ticketsMemoria[index].fecha_resolucion) {
      ticketsMemoria[index].fecha_resolucion = fechaStr;
    }
  }

  // Registrar en historial
  const entradaHistorial = {
    id_historial: historialMemoria.length + 1,
    id_ticket: Number(idTicket),
    tipo_accion: tipoAccion,
    estado_anterior: estadoAnterior,
    estado_nuevo: estadoFinal,
    fecha_accion: fechaCompleta,
    id_usuario: TECNICO_ACTUAL.id_usuario,
    detalles: detalles.trim()
  };
  historialMemoria.unshift(entradaHistorial);

  // Registrar también como comentario de bitácora
  const nuevoComentario = {
    id_comentario: comentariosMemoria.length + 1,
    contenido: `[${tipoAccion}] ${detalles.trim()}`,
    fecha_creacion: fechaCompleta,
    id_usuario: TECNICO_ACTUAL.id_usuario,
    id_ticket: Number(idTicket)
  };
  comentariosMemoria.unshift(nuevoComentario);

  return {
    ticket: enriquecerTicket(ticketsMemoria[index]),
    historial: entradaHistorial
  };
}

/**
 * Vista 13: Consulta de inventario / repuestos para el técnico (solo lectura)
 * Permite filtrar por texto y por tipo de componente
 */
export async function consultarInventarioTecnico({ termino = "", tipo = "Todos", soloDisponibles = false } = {}) {
  await simularLatencia(100);

  let resultado = [...inventarioMemoria];

  if (soloDisponibles) {
    resultado = resultado.filter((item) => item.estado === "Disponible" && item.stock > 0);
  }

  if (tipo && tipo !== "Todos") {
    resultado = resultado.filter((item) => item.tipo.toLowerCase() === tipo.toLowerCase());
  }

  if (termino && termino.trim()) {
    const q = termino.trim().toLowerCase();
    resultado = resultado.filter(
      (item) =>
        item.nombre.toLowerCase().includes(q) ||
        item.codigo.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        item.ubicacion.toLowerCase().includes(q)
    );
  }

  return resultado;
}