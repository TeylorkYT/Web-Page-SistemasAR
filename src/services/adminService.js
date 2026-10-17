/**
 * ==============================================================================
 * SISTEMASAR - SERVICIO DE ADMINISTRADOR (adminService.js)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Capa de servicios con datos falsos para el módulo de administración:
 * - Vista 14: Dashboard general del administrador (métricas, gráficos y técnicos)
 * - Vista 16: Asignación de técnico a tickets (tickets pendientes, técnicos y asignación)
 * - Vista 17: Gestión de categorías y servicios asociados
 * - Vista 20: Calificaciones y feedback recibidos (métricas de satisfacción, filtros y alertas)
 *
 * Cumple con la regla del Daily 2: funciones async que simulan llamadas al backend.
 * ==============================================================================
 */

import { cliente } from "../api/client";
// ==============================================================================
// 1. DASHBOARD DEL ADMINISTRADOR (VISTA 14)
// ==============================================================================

/**
 * Obtiene las métricas generales del dashboard: totales, abiertos, técnicos activos,
 * series para el gráfico comparativo y el listado de técnicos activos en tiempo real.
 */
export async function obtenerMetricasDashboard() {
  try {
    const [
      { data: general },
      { data: tecnicosList },
      { data: ticketsList },
      { data: califList },
      { data: catList }
    ] = await Promise.all([
      cliente.get("/reportes/estado_general"),
      cliente.get("/tecnicos"),
      cliente.get("/tickets"),
      cliente.get("/calificaciones").catch(() => ({ data: [] })),
      cliente.get("/categorias").catch(() => ({ data: [] }))
    ]);

    const totalTickets = general.tickets_totales || (ticketsList || []).length || 0;
    const abiertos = general.abiertos ?? (ticketsList || []).filter((t) => t.estado === "Abierto").length;
    const enProceso = general.en_proceso ?? (ticketsList || []).filter((t) => t.estado === "En_Proceso").length;
    const resueltos = general.resueltos ?? (ticketsList || []).filter((t) => t.estado === "Resuelto").length;
    const cerrados = general.cerrados ?? (ticketsList || []).filter((t) => t.estado === "Cerrado").length;
    const sinAsignar = (ticketsList || []).filter((t) => !t.id_tecnico).length;
    const criticos = (ticketsList || []).filter((t) => t.prioridad === "Critica").length;
    const altos = (ticketsList || []).filter((t) => t.prioridad === "Alta").length;

    const tasaResolucion = totalTickets > 0 ? Math.round(((resueltos + cerrados) / totalTickets) * 100) : 0;

    const sumaCalificaciones = (califList || []).reduce((acc, c) => acc + (Number(c.puntuacion) || 0), 0);
    const promedioCalificacion = (califList || []).length
      ? (sumaCalificaciones / califList.length).toFixed(1)
      : "5.0";

    // Gráfico semanal con datos duales (abiertos y cerrados reales)
    const graficoSemanal = (general.serie_semanal || []).map((s) => {
      const maxVal = Math.max(s.abiertos || 0, s.cerrados || 0, 1);
      return {
        etiqueta: s.semana,
        abiertos: s.abiertos || 0,
        cerrados: s.cerrados || 0,
        alturaAbiertos: Math.min(100, Math.round(((s.abiertos || 0) / (maxVal * 1.25)) * 100) + 10),
        alturaCerrados: Math.min(100, Math.round(((s.cerrados || 0) / (maxVal * 1.25)) * 100) + 10)
      };
    });

    const graficoMensual = [
      {
        etiqueta: "Mes Anterior",
        abiertos: Math.round(abiertos * 0.8),
        cerrados: Math.round((cerrados + resueltos) * 0.9),
        alturaAbiertos: 65,
        alturaCerrados: 75
      },
      {
        etiqueta: "Mes Actual",
        abiertos: abiertos,
        cerrados: cerrados + resueltos,
        alturaAbiertos: 80,
        alturaCerrados: 90
      }
    ];

    // Distribución por prioridad
    const conteoPrioridades = {
      Critica: criticos,
      Alta: altos,
      Media: (ticketsList || []).filter((t) => t.prioridad === "Media").length,
      Baja: (ticketsList || []).filter((t) => t.prioridad === "Baja").length
    };

    // Distribución por categorías
    const categoriasIncidencias = (catList || []).map((c) => {
      const totalEnCat = (c.total_tickets !== undefined)
        ? c.total_tickets
        : (ticketsList || []).filter((t) => (t.categorias || []).some((tc) => (typeof tc === 'object' ? tc.id_categoria : tc) === c.id_categoria || (typeof tc === 'string' && tc === c.nombre_categoria))).length;
      return {
        id: c.id_categoria,
        nombre: c.nombre_categoria,
        total: totalEnCat,
        porcentaje: totalTickets > 0 ? Math.round((totalEnCat / totalTickets) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);

    // Monitoreo de técnicos
    const tecnicosMonitoreo = (tecnicosList || []).map((tec) => {
      const asignados = (ticketsList || []).filter((t) => t.id_tecnico === tec.id_usuario && (t.estado === "En_Proceso" || t.estado === "Abierto"));
      const ticketEnProceso = asignados.find((t) => t.estado === "En_Proceso") || asignados[0];
      return {
        id: tec.id_usuario,
        nombre: `${tec.nombre} ${tec.apellido}`.trim(),
        correo: tec.correo_electronico,
        especialidad: tec.especialidad || "Soporte General",
        estado: tec.disponibilidad || "Disponible",
        ticketsActivos: asignados.length,
        ticketActual: ticketEnProceso ? `TKT-${ticketEnProceso.id_ticket}` : "-"
      };
    });

    // Tickets urgentes / cola de triaje
    const ticketsUrgentes = [...(ticketsList || [])]
      .filter((t) => t.estado === "Abierto" || t.estado === "En_Proceso")
      .sort((a, b) => {
        if (!a.id_tecnico && b.id_tecnico) return -1;
        if (a.id_tecnico && !b.id_tecnico) return 1;
        const peso = { Critica: 4, Alta: 3, Media: 2, Baja: 1 };
        return (peso[b.prioridad] || 0) - (peso[a.prioridad] || 0);
      });

    return {
      ticketsTotales: totalTickets,
      ticketsAbiertos: abiertos,
      ticketsEnProceso: enProceso,
      ticketsResueltos: resueltos,
      ticketsCerrados: cerrados,
      ticketsSinAsignar: sinAsignar,
      ticketsCriticos: criticos,
      ticketsAltos: altos,
      tasaResolucion,
      tecnicosActivos: general.tecnicos_activos || (tecnicosList || []).filter((t) => t.disponibilidad !== "Fuera_de_Servicio").length,
      promedioCalificacion,
      totalCalificaciones: (califList || []).length,
      calificacionesRecientes: (califList || []).slice(0, 4),
      graficoSemanal: graficoSemanal.length ? graficoSemanal : [
        { etiqueta: "Sem 1", abiertos: abiertos, cerrados: cerrados, alturaAbiertos: 70, alturaCerrados: 60 }
      ],
      graficoMensual,
      conteoPrioridades,
      categoriasIncidencias,
      tecnicosMonitoreo,
      ticketsUrgentes
    };
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    throw error;
  }
}

// ==============================================================================
// 2. GESTIÓN DE CATEGORÍAS (VISTA 17)
// ==============================================================================

/**
 * Obtiene el listado completo de categorías registradas.
 */
export async function obtenerCategorias() {
  const { data } = await cliente.get("/categorias");
  return data;
}

export async function crearCategoria(datos) {
  try {
    const { data } = await cliente.post("/categorias", datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al crear la categoría");
  }
}

export async function actualizarCategoria(idCategoria, datos) {
  try {
    const { data } = await cliente.put(`/categorias/${idCategoria}`, datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al actualizar la categoría");
  }
}

export async function eliminarCategoria(idCategoria) {
  try {
    const { data } = await cliente.delete(`/categorias/${idCategoria}`);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al eliminar la categoría");
  }
}

// ==============================================================================
// 4. ASIGNACIÓN DE TÉCNICOS (VISTA 16)
// ==============================================================================

/**
 * Obtiene la lista de tickets pendientes de asignación con opción de filtro por prioridad.
 */
export async function obtenerTicketsPendientes(filtroPrioridad = "TODAS") {
  const params = { estado: "Abierto" };
  if (filtroPrioridad && filtroPrioridad !== "TODAS") {
    params.prioridad = filtroPrioridad;
  }
  const { data } = await cliente.get("/tickets", { params });
  return data.map((t) => ({
    id_ticket: t.id_ticket,
    codigo: `TKT-${t.id_ticket}`,
    titulo: t.titulo,
    cliente: t.cliente_nombre || `Cliente #${t.id_cliente}`,
    falla: t.titulo,
    descripcion: t.descripcion,
    prioridad: t.prioridad,
    modalidad: t.modalidad,
    fecha_creacion: t.fecha_creacion,
    fecha_creacion_texto: t.fecha_creacion ? t.fecha_creacion.substring(0, 10) : "",
    categorias: (t.categorias || []).map((c) => c.nombre_categoria || c),
    categoria: (t.categorias || []).map((c) => c.nombre_categoria || c).join(", ") || "General",
    estado: t.estado,
    id_tecnico: t.id_tecnico,
  }));
}

export async function obtenerDetalleTicketAsignar(idTicket) {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  const { data } = await cliente.get(`/tickets/${idStr}`);
  return {
    id_ticket: data.id_ticket,
    codigo: `TKT-${data.id_ticket}`,
    titulo: data.titulo,
    cliente: data.cliente_nombre || `Cliente #${data.id_cliente}`,
    falla: data.titulo,
    descripcion: data.descripcion,
    prioridad: data.prioridad,
    modalidad: data.modalidad,
    fecha_creacion: data.fecha_creacion,
    fecha_creacion_texto: data.fecha_creacion ? data.fecha_creacion.substring(0, 10) : "",
    categorias: (data.categorias || []).map((c) => c.nombre_categoria || c),
    categoria: (data.categorias || []).map((c) => c.nombre_categoria || c).join(", ") || "General",
    estado: data.estado,
    id_tecnico: data.id_tecnico,
  };
}

export async function obtenerTecnicosParaAsignar() {
  const { data } = await cliente.get("/tecnicos");
  return data.map((tec) => ({
    id_tecnico: tec.id_usuario,
    nombre: `${tec.nombre} ${tec.apellido}`,
    especialidad: tec.especialidad,
    disponibilidad: tec.disponibilidad,
    ticketsEnProceso: tec.tickets_en_proceso,
    alertaCarga: tec.tickets_en_proceso >= 5,
    deshabilitado: tec.disponibilidad === "Fuera_de_Servicio",
    estado: tec.disponibilidad.replace(/_/g, " "),
  }));
}

export async function asignarTecnicoATicket(idTicket, idTecnico, prioridadAjustada = null) {
  try {
    const payload = {
      id_tecnico: Number(idTecnico),
    };
    if (prioridadAjustada && prioridadAjustada !== "TODAS") {
      payload.prioridad = prioridadAjustada;
    }
    const { data } = await cliente.patch(`/tickets/${idTicket}/asignar`, payload);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al asignar el técnico");
  }
}

// ==============================================================================
// 5. CALIFICACIONES Y FEEDBACK (VISTA 20)
// ==============================================================================

/**
 * Obtiene las métricas de satisfacción general para las tarjetas superiores de la Vista 20.
 */
/**
 * Obtiene las métricas de satisfacción general para las tarjetas superiores de la Vista 20 (v2.0).
 */
export async function obtenerMetricasSatisfaccion() {
  try {
    const { data } = await cliente.get("/calificaciones");
    if (!data || data.length === 0) {
      return {
        promedioGeneral: "0.0",
        mejorValorado: { nombre: "Sin registros", promedio: "0.0" },
        alertasBajaCalif: 0
      };
    }

    const totalPuntos = data.reduce((acc, c) => acc + c.puntuacion, 0);
    const promedioGeneral = (totalPuntos / data.length).toFixed(1);

    const promediosPorTecnico = {};
    data.forEach((c) => {
      if (!promediosPorTecnico[c.id_tecnico]) {
        promediosPorTecnico[c.id_tecnico] = { nombre: c.tecnico_nombre, suma: 0, count: 0 };
      }
      promediosPorTecnico[c.id_tecnico].suma += c.puntuacion;
      promediosPorTecnico[c.id_tecnico].count += 1;
    });

    let mejor = { nombre: "-", promedio: "0.0" };
    let maxProm = -1;
    Object.values(promediosPorTecnico).forEach((t) => {
      const prom = t.suma / t.count;
      if (prom > maxProm) {
        maxProm = prom;
        mejor = { nombre: t.nombre, promedio: prom.toFixed(1) };
      }
    });

    const alertasBajaCalif = data.filter((c) => c.puntuacion <= 2).length;

    return {
      promedioGeneral,
      mejorValorado: mejor,
      alertasBajaCalif
    };
  } catch {
    return {
      promedioGeneral: "0.0",
      mejorValorado: { nombre: "-", promedio: "0.0" },
      alertasBajaCalif: 0
    };
  }
}

export async function obtenerCalificacionesSupervision(filtros = {}) {
  const params = {};
  if (filtros.tecnico && filtros.tecnico !== "todos") {
    if (!isNaN(Number(filtros.tecnico))) {
      params.id_tecnico = Number(filtros.tecnico);
    } else {
      params.tecnico = filtros.tecnico;
    }
  }
  if (filtros.fechaInicio) params.desde = filtros.fechaInicio;
  if (filtros.fechaFin) params.hasta = filtros.fechaFin;
  if (filtros.puntaje && filtros.puntaje !== "todos") {
    params.puntuacion = Number(filtros.puntaje);
  }

  const { data } = await cliente.get("/calificaciones", { params });

  return data.map((c) => ({
    id_calificacion: c.id_calificacion,
    id_ticket: c.id_ticket,
    codigo_ticket: `TKT-${c.id_ticket}`,
    id_tecnico: c.id_tecnico,
    tecnico: c.tecnico_nombre || `Técnico #${c.id_tecnico}`,
    id_cliente: c.id_cliente,
    cliente: c.cliente_nombre || `Cliente #${c.id_cliente}`,
    contacto: "-",
    correo_cliente: "-",
    puntuacion: c.puntuacion,
    comentario: c.comentario || "",
    comentario_resumen: c.comentario && c.comentario.length > 28 ? c.comentario.substring(0, 25) + "..." : (c.comentario || "Sin comentario"),
    comentario_completo: c.comentario || "Sin comentario",
    fecha_calificacion: c.fecha_calificacion,
    fecha: c.fecha_calificacion ? c.fecha_calificacion.substring(0, 10) : "",
    rango: "este_mes",
    esAlerta: c.puntuacion <= 2,
    titulo_ticket: `Ticket #${c.id_ticket}`
  }));
}

export async function obtenerHistorialTicketCalificacion(idTicket) {
  try {
    const { data } = await cliente.get(`/tickets/${idTicket}/historial`);
    return data;
  } catch {
    return [];
  }
}

/**
 * Simula el envío de un correo de seguimiento al cliente que emitió feedback.
 */
export async function enviarCorreoSeguimientoCliente(codigoTicket, _datosContacto) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        exito: true,
        mensaje: `Correo de seguimiento enviado exitosamente al cliente del ticket #${codigoTicket}.`
      });
    }, 120);
  });
}

/**
 * Obtiene las calificaciones con datos expandidos de cliente, técnico y ticket (base).
 */
export async function obtenerCalificacionesAdmin() {
  return obtenerCalificacionesSupervision();
}