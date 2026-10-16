/**
 * ==============================================================================
 * SISTEMASAR - DATOS FALSOS COMPARTIDOS v2.0 (Documento Definitivo)
 * ==============================================================================
 * Responsable: Teylork (Líder y dueño de la base de datos)
 *
 * Datos alineados 1:1 con el esquema v2.0 y con database/datos_prueba.sql:
 * - 14 entidades oficiales en 3FN
 * - 3 usuarios de prueba para el login: cliente@prueba.com, tecnico@prueba.com, admin@prueba.com (Prueba123*)
 * - Sin inventario, sin SLA ni costos en categorías, sin código de ticket inventado.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. USUARIOS (Tabla: Usuario)
// ------------------------------------------------------------------------------
export const usuarios = [
  {
    id_usuario: 1,
    nombre: "Carlos",
    apellido: "Administrador",
    correo_electronico: "admin@prueba.com",
    contrasena: "Prueba123*",
    rol: "Administrador",
    fecha_registro: "2026-08-01",
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
    nombre: "Andres",
    apellido: "Rojas",
    correo_electronico: "andres.rojas@sistemasar.net",
    contrasena: "Prueba123*",
    rol: "Tecnico",
    fecha_registro: "2026-08-01",
    estado: "Activo"
  },
  {
    id_usuario: 4,
    nombre: "Mario",
    apellido: "Mendoza",
    correo_electronico: "mario.mendoza@sistemasar.net",
    contrasena: "Prueba123*",
    rol: "Tecnico",
    fecha_registro: "2026-08-02",
    estado: "Activo"
  },
  {
    id_usuario: 5,
    nombre: "Laura",
    apellido: "Ramirez",
    correo_electronico: "cliente@prueba.com",
    contrasena: "Prueba123*",
    rol: "Cliente",
    fecha_registro: "2026-08-02",
    estado: "Activo"
  },
  {
    id_usuario: 6,
    nombre: "Carlos",
    apellido: "Ordonez",
    correo_electronico: "carlos.ordonez@empresa.com",
    contrasena: "Prueba123*",
    rol: "Cliente",
    fecha_registro: "2026-08-03",
    estado: "Activo"
  },
  {
    id_usuario: 7,
    nombre: "Maria",
    apellido: "Gomez",
    correo_electronico: "maria.gomez@empresa.com",
    contrasena: "Prueba123*",
    rol: "Cliente",
    fecha_registro: "2026-08-04",
    estado: "Activo"
  }
];

// ------------------------------------------------------------------------------
// 2. SUBTIPOS DE USUARIO: Administrador, Tecnico, Cliente
// ------------------------------------------------------------------------------
export const administradores = [
  {
    id_usuario: 1,
    cargo: "Coordinador de Soporte TI"
  }
];

export const tecnicos = [
  {
    id_usuario: 2,
    especialidad: "Redes y Conectividad",
    disponibilidad: "Disponible"
  },
  {
    id_usuario: 3,
    especialidad: "Mantenimiento Hardware",
    disponibilidad: "Ocupado"
  },
  {
    id_usuario: 4,
    especialidad: "Soporte Software",
    disponibilidad: "Fuera_de_Servicio"
  }
];

export const clientes = [
  {
    id_usuario: 5,
    telefono: "3101234567",
    direccion: "Calle 10 # 5-20",
    area_departamento: "Administracion"
  },
  {
    id_usuario: 6,
    telefono: "3119876543",
    direccion: "Carrera 7 # 12-40",
    area_departamento: "Ventas"
  },
  {
    id_usuario: 7,
    telefono: "3125558899",
    direccion: "Avenida Colombia # 3-15",
    area_departamento: "Operaciones"
  }
];

// ------------------------------------------------------------------------------
// 3. CATEGORÍAS (Tabla: Categoria)
// ------------------------------------------------------------------------------
export const categorias = [
  {
    id_categoria: 1,
    nombre_categoria: "Mantenimiento Hardware",
    descripcion: "Reparacion o reemplazo de componentes fisicos de computadores y perifericos"
  },
  {
    id_categoria: 2,
    nombre_categoria: "Soporte Software",
    descripcion: "Instalacion, configuracion y solucion de errores de programas y sistemas operativos"
  },
  {
    id_categoria: 3,
    nombre_categoria: "Redes y Conectividad",
    descripcion: "Diagnostico y solucion de fallas de internet, cableado estructurado y WiFi"
  },
  {
    id_categoria: 4,
    nombre_categoria: "Seguridad Informatica",
    descripcion: "Revision de malware, antivirus, copias de seguridad y politicas de acceso"
  },
  {
    id_categoria: 5,
    nombre_categoria: "Servidores y Nube",
    descripcion: "Mantenimiento y administracion de servidores locales y servicios en la nube"
  }
];

// ------------------------------------------------------------------------------
// 4. EQUIPOS (Tabla: Equipo)
// ------------------------------------------------------------------------------
export const equipos = [
  {
    id_equipo: 1,
    tipo: "Computador",
    marca: "HP",
    modelo: "ProDesk 400",
    serial: "SN-HP-001",
    sistema_operativo: "Windows 11",
    area_departamento: "Administracion",
    id_cliente: 5,
    estado_equipo: "Operativo"
  },
  {
    id_equipo: 2,
    tipo: "Impresora",
    marca: "Epson",
    modelo: "EcoTank L3250",
    serial: "SN-EPS-002",
    sistema_operativo: null,
    area_departamento: "Ventas",
    id_cliente: 6,
    estado_equipo: "En_Reparacion"
  },
  {
    id_equipo: 3,
    tipo: "Servidor",
    marca: "Dell",
    modelo: "PowerEdge T140",
    serial: "SN-DEL-003",
    sistema_operativo: "Ubuntu Server 22.04",
    area_departamento: "Operaciones",
    id_cliente: 7,
    estado_equipo: "Operativo"
  },
  {
    id_equipo: 4,
    tipo: "Computador",
    marca: "Lenovo",
    modelo: "ThinkPad E14",
    serial: "SN-LEN-004",
    sistema_operativo: "Windows 10 Pro",
    area_departamento: "Administracion",
    id_cliente: 5,
    estado_equipo: "Operativo"
  },
  {
    id_equipo: 5,
    tipo: "Red",
    marca: "Cisco",
    modelo: "Catalyst 2960",
    serial: "SN-CIS-005",
    sistema_operativo: "Cisco IOS",
    area_departamento: "Ventas",
    id_cliente: 6,
    estado_equipo: "Operativo"
  }
];

// ------------------------------------------------------------------------------
// 5. TICKETS (Tabla: Ticket)
// ------------------------------------------------------------------------------
export const tickets = [
  {
    id_ticket: 1,
    titulo: "Equipo no enciende tras corte de energia",
    descripcion: "El computador de recepcion no responde al boton de encendido tras la tormenta de anoche.",
    modalidad: "Presencial",
    fecha_creacion: "2026-08-20 08:30:00",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Alta",
    estado: "Abierto",
    id_cliente: 5,
    id_tecnico: null,
    id_asignado_por: null,
    id_equipo: 1
  },
  {
    id_ticket: 2,
    titulo: "Impresora atasca papel en bandeja principal",
    descripcion: "La impresora atasca las hojas al imprimir mas de 5 paginas seguidas.",
    modalidad: "Presencial",
    fecha_creacion: "2026-08-21 09:15:00",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Media",
    estado: "En_Proceso",
    id_cliente: 6,
    id_tecnico: 3,
    id_asignado_por: 1,
    id_equipo: 2
  },
  {
    id_ticket: 3,
    titulo: "Caida de enlace principal de red local",
    descripcion: "El switch central no distribuye direcciones IP y el servidor no responde a peticiones.",
    modalidad: "Presencial",
    fecha_creacion: "2026-08-10 14:00:00",
    fecha_resolucion: "2026-08-12 16:30:00",
    fecha_cierre: "2026-08-13 10:00:00",
    prioridad: "Critica",
    estado: "Cerrado",
    id_cliente: 7,
    id_tecnico: 2,
    id_asignado_por: 1,
    id_equipo: 3
  },
  {
    id_ticket: 4,
    titulo: "Instalacion de certificado digital y VPN",
    descripcion: "Se requiere configurar la conexion VPN remota en portatil para trabajo desde casa.",
    modalidad: "Remoto",
    fecha_creacion: "2026-08-22 10:00:00",
    fecha_resolucion: "2026-08-22 15:45:00",
    fecha_cierre: null,
    prioridad: "Baja",
    estado: "Resuelto",
    id_cliente: 5,
    id_tecnico: 2,
    id_asignado_por: 1,
    id_equipo: 4
  },
  {
    id_ticket: 5,
    titulo: "Lentitud extrema en sistema de facturacion",
    descripcion: "El sistema tarda mas de un minuto en abrir cada factura. Sospecha de software malicioso.",
    modalidad: "Remoto",
    fecha_creacion: "2026-08-23 11:20:00",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Media",
    estado: "Abierto",
    id_cliente: 6,
    id_tecnico: null,
    id_asignado_por: null,
    id_equipo: 5
  },
  {
    id_ticket: 6,
    titulo: "Falla intermitente en switch de ventas",
    descripcion: "Desconexion recurrente de los terminales de punto de venta cada 30 minutos.",
    modalidad: "Presencial",
    fecha_creacion: "2026-08-15 08:00:00",
    fecha_resolucion: "2026-08-16 11:30:00",
    fecha_cierre: "2026-08-17 09:00:00",
    prioridad: "Alta",
    estado: "Cerrado",
    id_cliente: 6,
    id_tecnico: 3,
    id_asignado_por: 1,
    id_equipo: 5
  },
  {
    id_ticket: 7,
    titulo: "Actualizacion de sistema operativo y parches",
    descripcion: "Actualizacion programada de seguridad en estacion de trabajo principal.",
    modalidad: "Remoto",
    fecha_creacion: "2026-08-24 14:00:00",
    fecha_resolucion: "2026-08-24 18:00:00",
    fecha_cierre: null,
    prioridad: "Baja",
    estado: "Resuelto",
    id_cliente: 7,
    id_tecnico: 2,
    id_asignado_por: 1,
    id_equipo: 3
  },
  {
    id_ticket: 8,
    titulo: "Configuracion de politicas de copia de seguridad",
    descripcion: "Revision de sincronizacion en la nube de base de datos contable.",
    modalidad: "Remoto",
    fecha_creacion: "2026-08-18 09:00:00",
    fecha_resolucion: "2026-08-19 14:00:00",
    fecha_cierre: "2026-08-19 17:00:00",
    prioridad: "Media",
    estado: "Cerrado",
    id_cliente: 5,
    id_tecnico: 3,
    id_asignado_por: 1,
    id_equipo: 1
  },
  {
    id_ticket: 9,
    titulo: "Fuga de corriente en chasis de servidor",
    descripcion: "Se detecta descarga estatica al tocar el bastidor del rack.",
    modalidad: "Presencial",
    fecha_creacion: "2026-08-25 08:00:00",
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: "Critica",
    estado: "En_Proceso",
    id_cliente: 7,
    id_tecnico: 2,
    id_asignado_por: 1,
    id_equipo: 3
  }
];

// ------------------------------------------------------------------------------
// 6. RELACIÓN TICKET - CATEGORÍA (Tabla: Ticket_Categoria)
// ------------------------------------------------------------------------------
export const ticketCategorias = [
  { id_ticket: 1, id_categoria: 1 },
  { id_ticket: 2, id_categoria: 1 },
  { id_ticket: 2, id_categoria: 2 },
  { id_ticket: 3, id_categoria: 3 },
  { id_ticket: 4, id_categoria: 2 },
  { id_ticket: 4, id_categoria: 3 },
  { id_ticket: 5, id_categoria: 2 },
  { id_ticket: 5, id_categoria: 4 },
  { id_ticket: 6, id_categoria: 3 },
  { id_ticket: 7, id_categoria: 2 },
  { id_ticket: 8, id_categoria: 4 },
  { id_ticket: 8, id_categoria: 5 },
  { id_ticket: 9, id_categoria: 1 },
  { id_ticket: 9, id_categoria: 5 }
];

// ------------------------------------------------------------------------------
// 7. ADJUNTOS (Tabla: Adjunto_Ticket)
// ------------------------------------------------------------------------------
export const adjuntos = [
  {
    id_adjunto: 1,
    id_ticket: 1,
    id_usuario: 5,
    nombre_archivo: "pantalla_negra.jpg",
    ruta_url: "/uploads/evidencias/pantalla_negra.jpg",
    tipo_mime: "image/jpeg",
    tamano_bytes: 1450200,
    fecha_subida: "2026-08-20 08:35:00"
  },
  {
    id_adjunto: 2,
    id_ticket: 2,
    id_usuario: 6,
    nombre_archivo: "atasco_rodillo.png",
    ruta_url: "/uploads/evidencias/atasco_rodillo.png",
    tipo_mime: "image/png",
    tamano_bytes: 2048500,
    fecha_subida: "2026-08-21 09:20:00"
  },
  {
    id_adjunto: 3,
    id_ticket: 3,
    id_usuario: 7,
    nombre_archivo: "diagnostico_red.pdf",
    ruta_url: "/uploads/evidencias/diagnostico_red.pdf",
    tipo_mime: "application/pdf",
    tamano_bytes: 856000,
    fecha_subida: "2026-08-10 14:15:00"
  }
];

// ------------------------------------------------------------------------------
// 8. HISTORIAL DE TICKETS (Tabla: Historial_Ticket)
// ------------------------------------------------------------------------------
export const historial = [
  { id_historial: 1,  id_ticket: 1, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-20 08:30:00", id_usuario: 5, detalles: "Ticket registrado por Laura Ramirez desde el portal web" },
  { id_historial: 2,  id_ticket: 2, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-21 09:15:00", id_usuario: 6, detalles: "Ticket registrado por Carlos Ordonez" },
  { id_historial: 3,  id_ticket: 2, tipo_accion: "Asignacion",    estado_anterior: "Abierto",    estado_nuevo: "En_Proceso", fecha_accion: "2026-08-21 10:00:00", id_usuario: 1, detalles: "Asignado al tecnico Andres Rojas por el Administrador Carlos" },
  { id_historial: 4,  id_ticket: 3, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-10 14:00:00", id_usuario: 7, detalles: "Falla critica reportada por Maria Gomez" },
  { id_historial: 5,  id_ticket: 3, tipo_accion: "Asignacion",    estado_anterior: "Abierto",    estado_nuevo: "En_Proceso", fecha_accion: "2026-08-10 14:30:00", id_usuario: 1, detalles: "Asignacion prioritaria al tecnico Diana Paz" },
  { id_historial: 6,  id_ticket: 3, tipo_accion: "Resolucion",    estado_anterior: "En_Proceso", estado_nuevo: "Resuelto",   fecha_accion: "2026-08-12 16:30:00", id_usuario: 2, detalles: "Reemplazo de patch cord y reconfiguracion de VLAN en switch" },
  { id_historial: 7,  id_ticket: 3, tipo_accion: "Cierre",        estado_anterior: "Resuelto",   estado_nuevo: "Cerrado",    fecha_accion: "2026-08-13 10:00:00", id_usuario: 7, detalles: "Cliente valida conectividad y confirma cierre" },
  { id_historial: 8,  id_ticket: 4, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-22 10:00:00", id_usuario: 5, detalles: "Solicitud de instalacion de VPN remota" },
  { id_historial: 9,  id_ticket: 4, tipo_accion: "Asignacion",    estado_anterior: "Abierto",    estado_nuevo: "En_Proceso", fecha_accion: "2026-08-22 10:30:00", id_usuario: 1, detalles: "Asignado a Diana Paz" },
  { id_historial: 10, id_ticket: 4, tipo_accion: "Resolucion",    estado_anterior: "En_Proceso", estado_nuevo: "Resuelto",   fecha_accion: "2026-08-22 15:45:00", id_usuario: 2, detalles: "Instalacion de cliente VPN y certificados completada" },
  { id_historial: 11, id_ticket: 5, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-23 11:20:00", id_usuario: 6, detalles: "Ticket reportado pendiente de triaje" },
  { id_historial: 12, id_ticket: 6, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-15 08:00:00", id_usuario: 6, detalles: "Reporte de intermitencia de red" },
  { id_historial: 13, id_ticket: 6, tipo_accion: "Asignacion",    estado_anterior: "Abierto",    estado_nuevo: "En_Proceso", fecha_accion: "2026-08-15 09:00:00", id_usuario: 1, detalles: "Asignado a Andres Rojas" },
  { id_historial: 14, id_ticket: 6, tipo_accion: "Resolucion",    estado_anterior: "En_Proceso", estado_nuevo: "Resuelto",   fecha_accion: "2026-08-16 11:30:00", id_usuario: 3, detalles: "Se ajusto conector RJ45 flojo en switch" },
  { id_historial: 15, id_ticket: 6, tipo_accion: "Cierre",        estado_anterior: "Resuelto",   estado_nuevo: "Cerrado",    fecha_accion: "2026-08-17 09:00:00", id_usuario: 6, detalles: "Cierre confirmado por cliente" },
  { id_historial: 16, id_ticket: 7, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-24 14:00:00", id_usuario: 7, detalles: "Mantenimiento de software solicitado" },
  { id_historial: 17, id_ticket: 7, tipo_accion: "Asignacion",    estado_anterior: "Abierto",    estado_nuevo: "En_Proceso", fecha_accion: "2026-08-24 14:15:00", id_usuario: 1, detalles: "Asignado a Diana Paz" },
  { id_historial: 18, id_ticket: 7, tipo_accion: "Resolucion",    estado_anterior: "En_Proceso", estado_nuevo: "Resuelto",   fecha_accion: "2026-08-24 18:00:00", id_usuario: 2, detalles: "Actualizaciones aplicadas con exito" },
  { id_historial: 19, id_ticket: 8, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-18 09:00:00", id_usuario: 5, detalles: "Revision de copias de seguridad" },
  { id_historial: 20, id_ticket: 8, tipo_accion: "Asignacion",    estado_anterior: "Abierto",    estado_nuevo: "En_Proceso", fecha_accion: "2026-08-18 09:30:00", id_usuario: 1, detalles: "Asignado a Andres Rojas" },
  { id_historial: 21, id_ticket: 8, tipo_accion: "Resolucion",    estado_anterior: "En_Proceso", estado_nuevo: "Resuelto",   fecha_accion: "2026-08-19 14:00:00", id_usuario: 3, detalles: "Politicas de backup programadas semanalmente" },
  { id_historial: 22, id_ticket: 8, tipo_accion: "Cierre",        estado_anterior: "Resuelto",   estado_nuevo: "Cerrado",    fecha_accion: "2026-08-19 17:00:00", id_usuario: 5, detalles: "Cliente valida almacenamiento de copias" },
  { id_historial: 23, id_ticket: 9, tipo_accion: "Creacion",      estado_anterior: null,         estado_nuevo: "Abierto",    fecha_accion: "2026-08-25 08:00:00", id_usuario: 7, detalles: "Reporte de fuga estatica en rack" },
  { id_historial: 24, id_ticket: 9, tipo_accion: "Asignacion",    estado_anterior: "Abierto",    estado_nuevo: "En_Proceso", fecha_accion: "2026-08-25 08:30:00", id_usuario: 1, detalles: "Asignado a Diana Paz para revision electrica" }
];

// Compatibilidad con vistas/servicios existentes que busquen `historialTickets`
export const historialTickets = historial;

// ------------------------------------------------------------------------------
// 9. COMENTARIOS (Tabla: Comentario)
// ------------------------------------------------------------------------------
export const comentarios = [
  {
    id_comentario: 1,
    id_ticket: 1,
    id_usuario: 5,
    contenido: "Por favor atender pronto, no podemos facturar en recepcion.",
    es_nota_interna: false,
    fecha_creacion: "2026-08-20 08:40:00"
  },
  {
    id_comentario: 2,
    id_ticket: 2,
    id_usuario: 6,
    contenido: "El atasco ocurre con papel bond estandar.",
    es_nota_interna: false,
    fecha_creacion: "2026-08-21 09:25:00"
  },
  {
    id_comentario: 3,
    id_ticket: 2,
    id_usuario: 3,
    contenido: "Se revisara el rodillo de alimentacion y los sensores opticos del mecanismo de arrastre.",
    es_nota_interna: true,
    fecha_creacion: "2026-08-21 10:15:00"
  },
  {
    id_comentario: 4,
    id_ticket: 3,
    id_usuario: 2,
    contenido: "Diagnostico interno: puerto 12 sulfatado. Se procede a cambiar puerto y cable.",
    es_nota_interna: true,
    fecha_creacion: "2026-08-11 11:00:00"
  },
  {
    id_comentario: 5,
    id_ticket: 3,
    id_usuario: 7,
    contenido: "El servicio ya funciona perfectamente en todos los puestos.",
    es_nota_interna: false,
    fecha_creacion: "2026-08-13 09:50:00"
  },
  {
    id_comentario: 6,
    id_ticket: 9,
    id_usuario: 2,
    contenido: "Medicion de voltaje en chasis: 48V AC detectados por falta de linea a tierra.",
    es_nota_interna: true,
    fecha_creacion: "2026-08-25 09:10:00"
  }
];

// ------------------------------------------------------------------------------
// 10. REPORTES TÉCNICOS (Tabla: Reporte)
// ------------------------------------------------------------------------------
export const reportes = [
  {
    id_reporte: 1,
    id_ticket: 3,
    id_tecnico: 2,
    solucion_aplicada: "Se reemplazo cable UTP categoria 6 dañado y se migro la conexion al puerto 16 del switch administrable. Se valido conectividad ping y acceso a servidor con 0% perdida de paquetes.",
    fecha_reporte: "2026-08-12 16:30:00",
    estado: "Aprobado"
  },
  {
    id_reporte: 2,
    id_ticket: 4,
    id_tecnico: 2,
    solucion_aplicada: "Se instalo cliente OpenVPN, se importaron perfiles de usuario y certificados de autenticacion. Se realizo prueba de conexion exitosa hacia los servicios internos.",
    fecha_reporte: "2026-08-22 15:45:00",
    estado: "Aprobado"
  },
  {
    id_reporte: 3,
    id_ticket: 6,
    id_tecnico: 3,
    solucion_aplicada: "Se realizo mantenimiento preventivo al switch, limpieza de polvo en ventiladores y ponchado de nuevos conectores RJ45 en cableado de punto de venta.",
    fecha_reporte: "2026-08-16 11:30:00",
    estado: "Aprobado"
  },
  {
    id_reporte: 4,
    id_ticket: 7,
    id_tecnico: 2,
    solucion_aplicada: "Se ejecutaron scripts de actualizacion del kernel y parches de seguridad de software base, reiniciando los servicios dependientes sin afectacion operativa.",
    fecha_reporte: "2026-08-24 18:00:00",
    estado: "Aprobado"
  },
  {
    id_reporte: 5,
    id_ticket: 8,
    id_tecnico: 3,
    solucion_aplicada: "Se creo tarea automatizada con rsync cifrado hacia almacenamiento seguro en la nube y se configuro alerta por correo ante fallos de sincronizacion.",
    fecha_reporte: "2026-08-19 14:00:00",
    estado: "Aprobado"
  }
];

// ------------------------------------------------------------------------------
// 11. NOTIFICACIONES (Tabla: Notificacion)
// ------------------------------------------------------------------------------
export const notificaciones = [
  {
    id_notificacion: 1,
    id_ticket: 1,
    id_usuario_destino: 5,
    tipo: "Actualizacion",
    mensaje: "Su ticket #1 ha sido registrado exitosamente en el sistema.",
    leida: true,
    fecha_envio: "2026-08-20 08:31:00"
  },
  {
    id_notificacion: 2,
    id_ticket: 2,
    id_usuario_destino: 3,
    tipo: "Asignacion",
    mensaje: "Se le ha asignado el ticket #2: Impresora atasca papel.",
    leida: false,
    fecha_envio: "2026-08-21 10:01:00"
  },
  {
    id_notificacion: 3,
    id_ticket: 3,
    id_usuario_destino: 7,
    tipo: "Resolucion",
    mensaje: "Su ticket #3 ha sido resuelto por el tecnico Diana Paz.",
    leida: true,
    fecha_envio: "2026-08-12 16:31:00"
  },
  {
    id_notificacion: 4,
    id_ticket: 6,
    id_usuario_destino: 1,
    tipo: "Comentario",
    mensaje: "Alerta: El ticket #6 ha recibido una calificacion baja (1 estrella).",
    leida: false,
    fecha_envio: "2026-08-17 09:31:00"
  },
  {
    id_notificacion: 5,
    id_ticket: 9,
    id_usuario_destino: 2,
    tipo: "Asignacion",
    mensaje: "Se le ha asignado el ticket #9 de prioridad Critica.",
    leida: false,
    fecha_envio: "2026-08-25 08:31:00"
  }
];

// ------------------------------------------------------------------------------
// 12. CALIFICACIONES (Tabla: Calificacion)
// ------------------------------------------------------------------------------
export const calificaciones = [
  {
    id_calificacion: 1,
    id_ticket: 3,
    id_cliente: 7,
    id_tecnico: 2,
    puntuacion: 5,
    comentario: "Excelente soporte de Diana, resolvio la falla critica de red muy rapido.",
    fecha_calificacion: "2026-08-13 10:10:00"
  },
  {
    id_calificacion: 2,
    id_ticket: 6,
    id_cliente: 6,
    id_tecnico: 3,
    puntuacion: 1,
    comentario: "El tecnico tardo demasiado en llegar y la conexion volvio a fallar horas despues de la reparacion.",
    fecha_calificacion: "2026-08-17 09:30:00"
  },
  {
    id_calificacion: 3,
    id_ticket: 8,
    id_cliente: 5,
    id_tecnico: 3,
    puntuacion: 4,
    comentario: "Buen trabajo en la configuracion de las copias de seguridad de contabilidad.",
    fecha_calificacion: "2026-08-19 17:15:00"
  }
];

// Compatibilidad para evitar errores en servicios desfasados mientras se descontinua el inventario
export const inventario = [];

// ------------------------------------------------------------------------------
// EXPORTACIÓN POR DEFECTO
// ------------------------------------------------------------------------------
export default {
  usuarios,
  clientes,
  tecnicos,
  administradores,
  categorias,
  equipos,
  tickets,
  ticketCategorias,
  adjuntos,
  historial,
  historialTickets,
  comentarios,
  reportes,
  notificaciones,
  calificaciones,
  inventario
};
