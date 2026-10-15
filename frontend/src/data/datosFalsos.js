/**
 * ==============================================================================
 * SISTEMASAR - DATOS FALSOS COMPARTIDOS (KIT-5)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Este archivo centraliza la capa de datos simulados para el desarrollo del frontend.
 * Los nombres de tablas y columnas coinciden fielmente con el script DDL de MySQL
 * ubicado en database/ddl.sql y los registros de database/datos_prueba.sql.
 *
 * Incluye los 3 usuarios obligatorios de autenticación con contraseña 'Prueba123*':
 * - cliente@prueba.com
 * - tecnico@prueba.com
 * - admin@prueba.com
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. USUARIOS (Tabla: Usuario, Cliente, Tecnico, Administrador)
// ------------------------------------------------------------------------------
export const usuarios = [
  {
    id_usuario: 1,
    nombre: "Laura",
    apellido: "Ramírez",
    correo_electronico: "cliente@prueba.com",
    contrasena: "Prueba123*",
    rol: "Cliente",
    fecha_registro: "2026-08-02",
    estado: "Activo"
  },
  {
    id_usuario: 2,
    nombre: "Diana",
    apellido: "Paz",
    correo_electronico: "tecnico@prueba.com",
    contrasena: "Prueba123*",
    rol: "Tecnico",
    fecha_registro: "2026-08-01",
    estado: "Activo"
  },
  {
    id_usuario: 3,
    nombre: "Marlon",
    apellido: "Monsalve",
    correo_electronico: "admin@prueba.com",
    contrasena: "Prueba123*",
    rol: "Administrador",
    fecha_registro: "2026-08-01",
    estado: "Activo"
  },
  {
    id_usuario: 4,
    nombre: "Carlos",
    apellido: "Ordóñez",
    correo_electronico: "carlos.ordonez@empresa.com",
    contrasena: "Prueba123*",
    rol: "Cliente",
    fecha_registro: "2026-08-03",
    estado: "Activo"
  },
  {
    id_usuario: 5,
    nombre: "Andrés",
    apellido: "Rojas",
    correo_electronico: "andres.rojas@sistemasar.net",
    contrasena: "Prueba123*",
    rol: "Tecnico",
    fecha_registro: "2026-08-01",
    estado: "Activo"
  },
  {
    id_usuario: 6,
    nombre: "Sofía",
    apellido: "Castro",
    correo_electronico: "sofia.castro@sistemasar.net",
    contrasena: "Prueba123*",
    rol: "Tecnico",
    fecha_registro: "2026-08-05",
    estado: "Activo"
  },
  {
    id_usuario: 7,
    nombre: "Pedro",
    apellido: "Morales",
    correo_electronico: "pedro.morales@inactivo.com",
    contrasena: "Prueba123*",
    rol: "Cliente",
    fecha_registro: "2026-07-15",
    estado: "Inactivo"
  }
];

// ------------------------------------------------------------------------------
// 2. CATEGORÍAS (Tabla: Categoria)
// ------------------------------------------------------------------------------
export const categorias = [
  {
    id_categoria: 1,
    nombre_categoria: "Mantenimiento Hardware",
    descripcion: "Reparación, diagnóstico o reemplazo de componentes físicos de cómputo."
  },
  {
    id_categoria: 2,
    nombre_categoria: "Soporte Software",
    descripcion: "Instalación, actualización y configuración de sistemas operativos y programas."
  },
  {
    id_categoria: 3,
    nombre_categoria: "Redes y Conectividad",
    descripcion: "Fallas de enlace a internet, cableado estructurado, switches y redes LAN/Wi-Fi."
  },
  {
    id_categoria: 4,
    nombre_categoria: "Seguridad Informática",
    descripcion: "Desinfección de malware, configuración de firewalls y copias de seguridad."
  },
  {
    id_categoria: 5,
    nombre_categoria: "Periféricos e Impresoras",
    descripcion: "Mantenimiento correctivo de impresoras, escáneres y dispositivos de entrada/salida."
  }
];

// ------------------------------------------------------------------------------
// 3. EQUIPOS (Tabla: Equipo)
// ------------------------------------------------------------------------------
export const equipos = [
  {
    id_equipo: 1,
    tipo: "Computador",
    marca: "HP",
    modelo: "ProDesk 400 G6",
    serial: "SN-HP-001",
    sistema_operativo: "Windows 11 Pro",
    id_cliente: 1,
    estado_equipo: "Operativo"
  },
  {
    id_equipo: 2,
    tipo: "Impresora",
    marca: "Epson",
    modelo: "EcoTank L3250",
    serial: "SN-EPS-002",
    sistema_operativo: null,
    id_cliente: 4,
    estado_equipo: "En_Reparacion"
  },
  {
    id_equipo: 3,
    tipo: "Servidor",
    marca: "Dell",
    modelo: "PowerEdge R440",
    serial: "SN-DELL-003",
    sistema_operativo: "Ubuntu Server 22.04 LTS",
    id_cliente: 1,
    estado_equipo: "Operativo"
  },
  {
    id_equipo: 4,
    tipo: "Computador",
    marca: "Lenovo",
    modelo: "ThinkPad E14 Gen 4",
    serial: "SN-LEN-004",
    sistema_operativo: "Windows 11 Home",
    id_cliente: 1,
    estado_equipo: "Operativo"
  },
  {
    id_equipo: 5,
    tipo: "Red",
    marca: "Cisco",
    modelo: "Router RV340 Dual WAN",
    serial: "SN-CIS-005",
    sistema_operativo: "Cisco Firmware v1.2",
    id_cliente: 4,
    estado_equipo: "Operativo"
  },
  {
    id_equipo: 6,
    tipo: "Otro",
    marca: "APC",
    modelo: "UPS Smart-UPS 1500VA",
    serial: "SN-APC-006",
    sistema_operativo: null,
    id_cliente: 1,
    estado_equipo: "Fuera_de_Servicio"
  }
];

// ------------------------------------------------------------------------------
// 4. TICKETS (Tabla: Ticket)
// ------------------------------------------------------------------------------
export const tickets = [
  {
    id_ticket: 1,
    titulo: "Equipo no enciende tras corte de energía",
    descripcion: "El computador de escritorio no responde al botón de encendido después de una tormenta eléctrica.",
    fecha_creacion: "2026-08-24",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Alta",
    estado: "En_Proceso",
    id_cliente: 1,
    id_tecnico: 2,
    id_asignado_por: 3,
    id_equipo: 1,
    categorias_ids: [1]
  },
  {
    id_ticket: 2,
    titulo: "Impresora atasca papel constantemente",
    descripcion: "Al mandar a imprimir más de 3 hojas, el rodillo principal se detiene y marca atasco.",
    fecha_creacion: "2026-08-18",
    fecha_resolucion: "2026-08-20",
    fecha_cierre: null,
    prioridad: "Media",
    estado: "Resuelto",
    id_cliente: 4,
    id_tecnico: 5,
    id_asignado_por: 3,
    id_equipo: 2,
    categorias_ids: [1, 5]
  },
  {
    id_ticket: 3,
    titulo: "Falla de conexión a Red en Servidor local",
    descripcion: "El servidor Dell dejó de responder peticiones HTTP y SSH dentro de la subred local.",
    fecha_creacion: "2026-08-10",
    fecha_resolucion: "2026-08-12",
    fecha_cierre: "2026-08-13",
    prioridad: "Critica",
    estado: "Cerrado",
    id_cliente: 1,
    id_tecnico: 2,
    id_asignado_por: 3,
    id_equipo: 3,
    categorias_ids: [2, 3]
  },
  {
    id_ticket: 4,
    titulo: "Lentitud extrema y pantalla azul esporádica",
    descripcion: "El equipo presenta bloqueo al abrir hojas de cálculo grandes y reinicios inesperados con error MEMORY_MANAGEMENT.",
    fecha_creacion: "2026-08-25",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Media",
    estado: "Abierto",
    id_cliente: 1,
    id_tecnico: null,
    id_asignado_por: null,
    id_equipo: 4,
    categorias_ids: [1, 2]
  },
  {
    id_ticket: 5,
    titulo: "Configuración de router y apertura de puertos VPN",
    descripcion: "Se requiere configurar una DMZ y redirigir el puerto 1194 para teletrabajo seguro.",
    fecha_creacion: "2026-08-25",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Baja",
    estado: "Abierto",
    id_cliente: 4,
    id_tecnico: null,
    id_asignado_por: null,
    id_equipo: 5,
    categorias_ids: [3, 4]
  },
  {
    id_ticket: 6,
    titulo: "Infección de malware en terminal de ventas",
    descripcion: "Aparecen pop-ups sospechosos y el navegador redirige a sitios no autorizados.",
    fecha_creacion: "2026-08-23",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Alta",
    estado: "En_Proceso",
    id_cliente: 1,
    id_tecnico: 6,
    id_asignado_por: 3,
    id_equipo: 1,
    categorias_ids: [2, 4]
  },
  {
    id_ticket: 7,
    titulo: "Reemplazo preventivo de batería UPS",
    descripcion: "La unidad de respaldo emite un pitido continuo indicando fin de vida útil de las celdas.",
    fecha_creacion: "2026-08-15",
    fecha_resolucion: "2026-08-16",
    fecha_cierre: "2026-08-17",
    prioridad: "Baja",
    estado: "Cerrado",
    id_cliente: 1,
    id_tecnico: 5,
    id_asignado_por: 3,
    id_equipo: 6,
    categorias_ids: [1]
  }
];

// ------------------------------------------------------------------------------
// 5. RELACIÓN N:M TICKET - CATEGORÍA (Tabla: Ticket_Categoria)
// ------------------------------------------------------------------------------
export const ticketCategorias = [
  { id_ticket: 1, id_categoria: 1 },
  { id_ticket: 2, id_categoria: 1 },
  { id_ticket: 2, id_categoria: 5 },
  { id_ticket: 3, id_categoria: 2 },
  { id_ticket: 3, id_categoria: 3 },
  { id_ticket: 4, id_categoria: 1 },
  { id_ticket: 4, id_categoria: 2 },
  { id_ticket: 5, id_categoria: 3 },
  { id_ticket: 5, id_categoria: 4 },
  { id_ticket: 6, id_categoria: 2 },
  { id_ticket: 6, id_categoria: 4 },
  { id_ticket: 7, id_categoria: 1 }
];

// ------------------------------------------------------------------------------
// 6. HISTORIAL DE TICKETS (Tabla: Historial_Ticket)
// ------------------------------------------------------------------------------
export const historialTickets = [
  {
    id_historial: 1,
    id_ticket: 1,
    tipo_accion: "Creacion",
    estado_anterior: null,
    estado_nuevo: "Abierto",
    fecha_accion: "2026-08-24 08:30:00",
    id_usuario: 1,
    detalles: "Ticket creado por el cliente Laura Ramírez"
  },
  {
    id_historial: 2,
    id_ticket: 1,
    tipo_accion: "Asignacion",
    estado_anterior: "Abierto",
    estado_nuevo: "En_Proceso",
    fecha_accion: "2026-08-24 09:15:00",
    id_usuario: 3,
    detalles: "Asignado a la técnico Diana Paz por Administrador"
  },
  {
    id_historial: 3,
    id_ticket: 1,
    tipo_accion: "Comentario",
    estado_anterior: "En_Proceso",
    estado_nuevo: "En_Proceso",
    fecha_accion: "2026-08-24 11:20:00",
    id_usuario: 2,
    detalles: "Diagnóstico inicial: Fuente de poder dañada, se solicita repuesto."
  },
  {
    id_historial: 4,
    id_ticket: 2,
    tipo_accion: "Creacion",
    estado_anterior: null,
    estado_nuevo: "Abierto",
    fecha_accion: "2026-08-18 10:00:00",
    id_usuario: 4,
    detalles: "Ticket creado por el cliente Carlos Ordóñez"
  },
  {
    id_historial: 5,
    id_ticket: 2,
    tipo_accion: "Asignacion",
    estado_anterior: "Abierto",
    estado_nuevo: "En_Proceso",
    fecha_accion: "2026-08-18 10:45:00",
    id_usuario: 3,
    detalles: "Asignado al técnico Andrés Rojas"
  },
  {
    id_historial: 6,
    id_ticket: 2,
    tipo_accion: "Resolucion",
    estado_anterior: "En_Proceso",
    estado_nuevo: "Resuelto",
    fecha_accion: "2026-08-20 15:30:00",
    id_usuario: 5,
    detalles: "Mantenimiento y limpieza de rodillos de arrastre completado con éxito."
  },
  {
    id_historial: 7,
    id_ticket: 3,
    tipo_accion: "Creacion",
    estado_anterior: null,
    estado_nuevo: "Abierto",
    fecha_accion: "2026-08-10 07:45:00",
    id_usuario: 1,
    detalles: "Reporte de servidor caído"
  },
  {
    id_historial: 8,
    id_ticket: 3,
    tipo_accion: "Asignacion",
    estado_anterior: "Abierto",
    estado_nuevo: "En_Proceso",
    fecha_accion: "2026-08-10 08:00:00",
    id_usuario: 3,
    detalles: "Asignado de emergencia a Diana Paz"
  },
  {
    id_historial: 9,
    id_ticket: 3,
    tipo_accion: "Resolucion",
    estado_anterior: "En_Proceso",
    estado_nuevo: "Resuelto",
    fecha_accion: "2026-08-12 17:00:00",
    id_usuario: 2,
    detalles: "Reemplazo de switch de acceso y configuración de interfaz eth0."
  },
  {
    id_historial: 10,
    id_ticket: 3,
    tipo_accion: "Cierre",
    estado_anterior: "Resuelto",
    estado_nuevo: "Cerrado",
    fecha_accion: "2026-08-13 09:00:00",
    id_usuario: 1,
    detalles: "Cliente confirma conformidad y cierre formal del ticket."
  }
];

// ------------------------------------------------------------------------------
// 7. COMENTARIOS (Tabla: Comentario)
// ------------------------------------------------------------------------------
export const comentarios = [
  {
    id_comentario: 1,
    contenido: "Por favor revisar con urgencia, es la estación principal de facturación.",
    fecha_creacion: "2026-08-24 08:35:00",
    id_usuario: 1,
    id_ticket: 1
  },
  {
    id_comentario: 2,
    contenido: "Entendido, estoy trasladándome con multímetro y fuente de prueba.",
    fecha_creacion: "2026-08-24 09:30:00",
    id_usuario: 2,
    id_ticket: 1
  },
  {
    id_comentario: 3,
    contenido: "Las impresiones salen con manchas de tinta en los bordes.",
    fecha_creacion: "2026-08-18 10:15:00",
    id_usuario: 4,
    id_ticket: 2
  },
  {
    id_comentario: 4,
    contenido: "Se limpiaron los inyectores y se ajustó la tensión del rodillo alimentador.",
    fecha_creacion: "2026-08-20 14:00:00",
    id_usuario: 5,
    id_ticket: 2
  }
];

// ------------------------------------------------------------------------------
// 8. REPORTES TÉCNICOS (Tabla: Reporte)
// ------------------------------------------------------------------------------
export const reportes = [
  {
    id_reporte: 1,
    id_ticket: 2,
    id_tecnico: 5,
    solucion_aplicada: "Desarme del tren de arrastre de papel, limpieza de almohadillas residuales y sustitución del rodillo de tracción.",
    fecha_reporte: "2026-08-20",
    estado: "Aprobado"
  },
  {
    id_reporte: 2,
    id_ticket: 3,
    id_tecnico: 2,
    solucion_aplicada: "Sustitución de cable UTP categoría 6 defectuoso y reconfiguración de gateway en Netplan de Ubuntu.",
    fecha_reporte: "2026-08-12",
    estado: "Aprobado"
  },
  {
    id_reporte: 3,
    id_ticket: 7,
    id_tecnico: 5,
    solucion_aplicada: "Instalación de módulo de baterías 12V 9Ah selladas y calibración de ciclos de carga.",
    fecha_reporte: "2026-08-16",
    estado: "Aprobado"
  }
];

// ------------------------------------------------------------------------------
// 9. CALIFICACIONES (Tabla: Calificacion)
// ------------------------------------------------------------------------------
export const calificaciones = [
  {
    id_calificacion: 1,
    id_ticket: 2,
    id_cliente: 4,
    id_tecnico: 5,
    puntuacion: 5,
    comentario: "Excelente atención y rapidez. La impresora quedó funcionando como nueva.",
    fecha_calificacion: "2026-08-21"
  },
  {
    id_calificacion: 2,
    id_ticket: 3,
    id_cliente: 1,
    id_tecnico: 2,
    puntuacion: 5,
    comentario: "Servicio restaurado de forma impecable en tiempo récord.",
    fecha_calificacion: "2026-08-13"
  },
  {
    id_calificacion: 3,
    id_ticket: 7,
    id_cliente: 1,
    id_tecnico: 5,
    puntuacion: 4,
    comentario: "Buen servicio, solo tomó un poco más de tiempo de lo previsto conseguir las baterías.",
    fecha_calificacion: "2026-08-17"
  }
];

// ------------------------------------------------------------------------------
// 10. INVENTARIO / REPUESTOS (Vistas 13 y 18)
// ------------------------------------------------------------------------------
export const inventario = [
  {
    id_inventario: 1,
    codigo: "REP-RAM-001",
    nombre: "Memoria RAM DDR4 8GB 3200MHz Kingston Fury",
    tipo: "Memoria",
    stock: 12,
    ubicacion: "Estante A-1",
    estado: "Disponible",
    descripcion: "Módulo de memoria para equipos de escritorio corporativos."
  },
  {
    id_inventario: 2,
    codigo: "REP-SSD-002",
    nombre: "Unidad SSD 500GB NVMe M.2 Western Digital Black",
    tipo: "Almacenamiento",
    stock: 8,
    ubicacion: "Estante A-2",
    estado: "Disponible",
    descripcion: "Almacenamiento de alta velocidad para repotenciación."
  },
  {
    id_inventario: 3,
    codigo: "REP-FTE-003",
    nombre: "Fuente de Poder 500W 80 Plus Bronze EVGA",
    tipo: "Energía",
    stock: 3,
    ubicacion: "Estante B-1",
    estado: "Disponible",
    descripcion: "Fuente certificada para reemplazo en torres ATX."
  },
  {
    id_inventario: 4,
    codigo: "REP-IMP-004",
    nombre: "Kit Rodillo de Arrastre para Epson Serie L",
    tipo: "Impresoras",
    stock: 5,
    ubicacion: "Gaveta C-3",
    estado: "Disponible",
    descripcion: "Repuesto original para problemas de atasco de papel."
  },
  {
    id_inventario: 5,
    codigo: "REP-BAT-005",
    nombre: "Batería Sellada 12V 9Ah para UPS APC",
    tipo: "Energía",
    stock: 2,
    ubicacion: "Piso Bodega 1",
    estado: "Disponible",
    descripcion: "Batería de gel libre de mantenimiento para respaldo eléctrico."
  },
  {
    id_inventario: 6,
    codigo: "REP-RED-006",
    nombre: "Bobina Cable UTP Cat 6 305m Furukawa",
    tipo: "Redes",
    stock: 1,
    ubicacion: "Bodega Redes",
    estado: "Disponible",
    descripcion: "Cable de red para cableado estructurado horizontal."
  },
  {
    id_inventario: 7,
    codigo: "REP-DIS-007",
    nombre: "Disco Duro Mecánico 1TB 7200RPM Seagate Barracuda",
    tipo: "Almacenamiento",
    stock: 0,
    ubicacion: "Estante A-3",
    estado: "Agotado",
    descripcion: "Disco rígido SATA III de 3.5 pulgadas."
  },
  {
    id_inventario: 8,
    codigo: "REP-MOT-008",
    nombre: "Placa Madre Gigabyte H410M LGA1200",
    tipo: "Hardware",
    stock: 0,
    ubicacion: "Estante Desecho",
    estado: "De_Baja",
    descripcion: "Tarjeta principal con falla en socket de procesador, dada de baja."
  }
];

// ------------------------------------------------------------------------------
// 11. NOTIFICACIONES (Tabla: Notificacion)
// ------------------------------------------------------------------------------
export const notificaciones = [
  {
    id_notificacion: 1,
    mensaje: "Su ticket #1 ha sido asignado a la técnico Diana Paz.",
    tipo: "Asignacion",
    fecha_envio: "2026-08-24 09:15:00",
    id_usuario_destino: 1,
    id_ticket: 1
  },
  {
    id_notificacion: 2,
    mensaje: "Su ticket #2 ha sido resuelto por el técnico Andrés Rojas.",
    tipo: "Resolucion",
    fecha_envio: "2026-08-20 15:30:00",
    id_usuario_destino: 4,
    id_ticket: 2
  },
  {
    id_notificacion: 3,
    mensaje: "Nuevo comentario en el ticket #1.",
    tipo: "Comentario",
    fecha_envio: "2026-08-24 11:20:00",
    id_usuario_destino: 1,
    id_ticket: 1
  }
];

// ------------------------------------------------------------------------------
// EXPORTACIÓN POR DEFECTO
// ------------------------------------------------------------------------------
export default {
  usuarios,
  categorias,
  equipos,
  tickets,
  ticketCategorias,
  historialTickets,
  comentarios,
  reportes,
  calificaciones,
  inventario,
  notificaciones
};
