/**
 * ==============================================================================
 * SISTEMASAR - SERVICIO DE ADMINISTRADOR (adminService.js)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Capa de servicios unificada con datos simulados para el módulo de administración:
 * - Vista 20: Calificaciones y feedback de clientes (supervisión técnica)
 * - Vista 17: Gestión de categorías y servicios asociados
 * - Vista 14: Dashboard general del administrador
 * - Vista 16: Asignación de técnico a tickets
 *
 * Cumple con la regla del Daily 2: funciones async que simulan llamadas al backend.
 * ==============================================================================
 */

import {
  categorias as categoriasIniciales
} from "../data/datosFalsos";

// ------------------------------------------------------------------------------
// 1. ESTADO MUTABLE EN MEMORIA PARA CALIFICACIONES (VISTA 20)
// ------------------------------------------------------------------------------

let calificacionesMemoria = [
  {
    id_calificacion: 1,
    codigo_ticket: "TKT-1020",
    id_ticket: 1020,
    tecnico: "Carlos T.",
    id_tecnico: 1,
    puntuacion: 5,
    comentario_resumen: "Excelente trabajo...",
    comentario_completo: "Excelente trabajo en la reparación del equipo, muy rápido y profesional.",
    cliente: "Corporación Norte S.A.S.",
    contacto: "Mario Delgado",
    fecha: "2026-10-12",
    rango: "este_mes"
  },
  {
    id_calificacion: 2,
    codigo_ticket: "TKT-1018",
    id_ticket: 1018,
    tecnico: "Luis F.",
    id_tecnico: 3,
    puntuacion: 3,
    comentario_resumen: "Se demoró un poco...",
    comentario_completo: "Se demoró un poco en conseguir el repuesto, pero el servidor quedó finalmente operativo.",
    cliente: "Industrias Metálicas",
    contacto: "Felipe Orozco",
    fecha: "2026-10-10",
    rango: "este_mes"
  },
  {
    id_calificacion: 3,
    codigo_ticket: "TKT-1015",
    id_ticket: 1015,
    tecnico: "Diana M.",
    id_tecnico: 2,
    puntuacion: 5,
    comentario_resumen: "Muy amable y...",
    comentario_completo: "Muy amable y capacitó al personal sobre el uso correcto y mantenimiento de la red.",
    cliente: "Colegio San José",
    contacto: "Patricia Vélez",
    fecha: "2026-10-08",
    rango: "este_mes"
  },
  {
    id_calificacion: 4,
    codigo_ticket: "TKT-1010",
    id_ticket: 1010,
    tecnico: "Carlos T.",
    id_tecnico: 1,
    puntuacion: 1,
    comentario_resumen: "No resolvió el...",
    comentario_completo: "El técnico llegó 2 horas tarde, no trajo la herramienta adecuada y el router sigue presentando cortes de red.",
    cliente: "Empresa S.A.",
    contacto: "Ana Gómez",
    fecha: "2026-10-05",
    rango: "este_mes",
    esAlerta: true
  },
  {
    id_calificacion: 5,
    codigo_ticket: "TKT-1008",
    id_ticket: 1008,
    tecnico: "Andrés R.",
    id_tecnico: 5,
    puntuacion: 4,
    comentario_resumen: "Buena atención general...",
    comentario_completo: "Buena atención y disposición, aunque faltó un informe más detallado por escrito.",
    cliente: "Logística Express",
    contacto: "Laura Restrepo",
    fecha: "2026-10-02",
    rango: "este_mes"
  },
  {
    id_calificacion: 6,
    codigo_ticket: "TKT-1002",
    id_ticket: 1002,
    tecnico: "Diana M.",
    id_tecnico: 2,
    puntuacion: 5,
    comentario_resumen: "Impecable servicio...",
    comentario_completo: "Impecable diagnóstico y recuperación de datos en tiempo récord.",
    cliente: "Consultoría Contable",
    contacto: "Esteban Rico",
    fecha: "2026-09-28",
    rango: "mes_anterior"
  },
  {
    id_calificacion: 7,
    codigo_ticket: "TKT-995",
    id_ticket: 995,
    tecnico: "Luis F.",
    id_tecnico: 3,
    puntuacion: 2,
    comentario_resumen: "Faltó seguimiento...",
    comentario_completo: "La falla se solucionó temporalmente pero volvió a presentarse a los dos días sin respuesta inmediata.",
    cliente: "Comercializadora Andina",
    contacto: "Rosa Caicedo",
    fecha: "2026-09-20",
    rango: "mes_anterior",
    esAlerta: true
  }
];

// ==============================================================================
// FUNCIONES DE CALIFICACIONES (VISTA 20)
// ==============================================================================

/**
 * Obtiene las métricas de satisfacción general para las tarjetas superiores de la Vista 20.
 */
export async function obtenerMetricasSatisfaccion() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        promedioGeneral: "4.5",
        mejorValorado: {
          nombre: "Diana M.",
          promedio: "4.9"
        },
        alertasBajaCalif: 2
      });
    }, 80);
  });
}

/**
 * Obtiene la lista de calificaciones con filtros aplicados (Técnico, Rango de tiempo, Puntaje).
 */
export async function obtenerCalificacionesSupervision(filtros = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let resultado = [...calificacionesMemoria];

      // Filtro por técnico
      if (filtros.tecnico && filtros.tecnico !== "todos") {
        resultado = resultado.filter((c) =>
          c.tecnico.toLowerCase().includes(filtros.tecnico.toLowerCase())
        );
      }

      // Filtro por rango
      if (filtros.rango && filtros.rango !== "todos") {
        if (filtros.rango === "este_mes") {
          resultado = resultado.filter((c) => c.rango === "este_mes");
        }
      }

      // Filtro por puntaje
      if (filtros.puntaje && filtros.puntaje !== "todos") {
        const numPuntaje = Number(filtros.puntaje);
        resultado = resultado.filter((c) => c.puntuacion === numPuntaje);
      }

      resolve(resultado);
    }, 100);
  });
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

// ==============================================================================
// 2. DASHBOARD DEL ADMINISTRADOR (VISTA 14)
// ==============================================================================

export async function obtenerMetricasDashboard() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ticketsTotales: 120,
        ticketsAbiertos: 25,
        tecnicosActivos: 12,
        graficoSemanal: [
          { etiqueta: "Sem 1", abiertos: 60, cerrados: 40, porcentaje: 85 },
          { etiqueta: "Sem 2", abiertos: 45, cerrados: 35, porcentaje: 58 },
          { etiqueta: "Sem 3", abiertos: 25, cerrados: 20, porcentaje: 30 },
          { etiqueta: "Sem 4", abiertos: 15, cerrados: 12, porcentaje: 20 }
        ],
        graficoMensual: [
          { etiqueta: "Mayo", abiertos: 80, cerrados: 75, porcentaje: 70 },
          { etiqueta: "Junio", abiertos: 95, cerrados: 88, porcentaje: 82 },
          { etiqueta: "Julio", abiertos: 110, cerrados: 100, porcentaje: 95 },
          { etiqueta: "Agosto", abiertos: 120, cerrados: 95, porcentaje: 100 }
        ],
        tecnicosMonitoreo: [
          { id: 1, nombre: "Carlos T.", estado: "Ocupado", ticketActual: "TKT-1029" },
          { id: 2, nombre: "Diana M.", estado: "Libre", ticketActual: "-" },
          { id: 3, nombre: "Luis F.", estado: "Ocupado", ticketActual: "TKT-1030" },
          { id: 4, nombre: "Andrés R.", estado: "Ocupado", ticketActual: "TKT-1031" },
          { id: 5, nombre: "Sofía C.", estado: "Libre", ticketActual: "-" }
        ]
      });
    }, 100);
  });
}

// ==============================================================================
// 3. ASIGNACIÓN DE TÉCNICOS (VISTA 16)
// ==============================================================================

export async function obtenerTicketsPendientes(_filtroPrioridad = "TODAS") {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 80);
  });
}

export async function obtenerTecnicosParaAsignar() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id_tecnico: 2, nombre: "Diana M.", estado: "Libre", cargaTickets: 0 },
        { id_tecnico: 1, nombre: "Carlos T.", estado: "1 Tkt", cargaTickets: 1 },
        { id_tecnico: 3, nombre: "Luis F.", estado: "2 Tkts", cargaTickets: 2 }
      ]);
    }, 80);
  });
}

export async function asignarTecnicoATicket(_idTicket, _idTecnico) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ exito: true, mensaje: "Técnico asignado exitosamente." });
    }, 100);
  });
}

// ==============================================================================
// 4. GESTIÓN DE CATEGORÍAS Y SERVICIOS (VISTA 17)
// ==============================================================================

export async function obtenerCategorias() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...categoriasIniciales]);
    }, 100);
  });
}

export async function crearCategoria(datos) {
  const nombreLimpio = (datos.nombre_categoria || "").trim();
  if (!nombreLimpio) throw new Error("El nombre de la categoría es obligatorio");
  return { id_categoria: Date.now(), nombre_categoria: nombreLimpio, descripcion: datos.descripcion || "" };
}

export async function actualizarCategoria(idCategoria, datos) {
  return { id_categoria: Number(idCategoria), nombre_categoria: datos.nombre_categoria, descripcion: datos.descripcion };
}

export async function eliminarCategoria(_idCategoria) {
  return { exito: true, mensaje: "Categoría eliminada con éxito" };
}

export async function obtenerServicios(_idCategoria = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 80);
  });
}

export async function crearServicio(datos) {
  return { id_servicio: Date.now(), ...datos };
}

export async function actualizarServicio(idServicio, datos) {
  return { id_servicio: Number(idServicio), ...datos };
}

export async function eliminarServicio(_idServicio) {
  return { exito: true, mensaje: "Servicio eliminado con éxito" };
}