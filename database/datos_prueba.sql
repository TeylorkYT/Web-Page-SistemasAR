-- ============================================================
-- Datos de Prueba - Sistemas AR
-- Ejecutar DESPUÉS del script ddl.sql
-- ============================================================

USE sistemas_ar;

-- ------------------------------------------------------------
-- USUARIOS (1 administrador, 2 clientes, 2 técnicos)
-- Nota: Las contraseñas se encriptarán cuando se implemente
-- el módulo de login. Por ahora se usan valores placeholder.
-- ------------------------------------------------------------
INSERT INTO Usuario (nombre, apellido, correo_electronico, contrasena, rol, fecha_registro) VALUES
('Marlon',  'Monsalve', 'marlon.monsalve@sistemasar.net', 'hash_pass1', 'Administrador', '2026-08-01'),
('Laura',   'Ramirez',  'laura.ramirez@empresa.com',      'hash_pass2', 'Cliente',       '2026-08-02'),
('Carlos',  'Ordonez',  'carlos.ordonez@empresa.com',      'hash_pass3', 'Cliente',       '2026-08-03'),
('Diana',   'Paz',      'diana.paz@sistemasar.net',        'hash_pass4', 'Tecnico',       '2026-08-01'),
('Andres',  'Rojas',    'andres.rojas@sistemasar.net',     'hash_pass5', 'Tecnico',       '2026-08-01');

-- Subtipos de usuario
INSERT INTO Administrador (id_usuario) VALUES (1);
INSERT INTO Cliente (id_usuario) VALUES (2), (3);
INSERT INTO Tecnico (id_usuario) VALUES (4), (5);

-- ------------------------------------------------------------
-- CATEGORÍAS DE SERVICIO
-- ------------------------------------------------------------
INSERT INTO Categoria (nombre_categoria, descripcion) VALUES
('Mantenimiento Hardware', 'Reparacion o reemplazo de componentes fisicos'),
('Soporte Software',       'Instalacion y configuracion de programas o S.O.'),
('Redes y Conectividad',   'Fallas de internet, cableado o redes locales');

-- ------------------------------------------------------------
-- EQUIPOS (pertenecen a los clientes)
-- ------------------------------------------------------------
INSERT INTO Equipo (tipo, marca, modelo, serial, sistema_operativo, id_cliente, estado_equipo) VALUES
('Computador', 'HP',   'ProDesk 400',    'SN-0001', 'Windows 11',    2, 'Operativo'),
('Impresora',  'Epson', 'L3250',         'SN-0002', NULL,            3, 'En_Reparacion'),
('Servidor',   'Dell',  'PowerEdge R440', 'SN-0003', 'Ubuntu Server', 2, 'Operativo');

-- ------------------------------------------------------------
-- TICKETS (cubriendo varios estados del ENUM)
-- ------------------------------------------------------------
INSERT INTO Ticket (titulo, descripcion, fecha_creacion, fecha_resolucion, fecha_cierre, prioridad, estado, id_cliente, id_tecnico, id_asignado_por, id_equipo) VALUES
('Equipo no enciende',       'El computador no enciende desde ayer.',              '2026-08-24', NULL,         NULL,         'Alta',    'En_Proceso', 2, 4, 1, 1),
('Impresora atasca papel',   'La impresora atasca el papel constantemente.',       '2026-08-18', '2026-08-20', NULL,         'Media',   'Resuelto',   3, 5, 1, 2),
('Falla de conexion a Red',  'El servidor no responde a peticiones locales.',      '2026-08-10', '2026-08-12', '2026-08-13', 'Critica', 'Cerrado',    2, 4, 1, 3);

-- Relación N:M Ticket - Categoría
INSERT INTO Ticket_Categoria (id_ticket, id_categoria) VALUES
(1, 1),
(2, 1),
(2, 2),
(3, 3);

-- ------------------------------------------------------------
-- HISTORIAL DE TICKETS (trazabilidad de cambios de estado)
-- ------------------------------------------------------------
INSERT INTO Historial_Ticket (id_ticket, tipo_accion, estado_anterior, estado_nuevo, id_usuario, detalles) VALUES
(1, 'Creacion',      NULL,          'Abierto',    2, 'Ticket creado por el cliente'),
(1, 'Asignacion',    'Abierto',     'En_Proceso', 1, 'Asignado al tecnico Diana Paz'),
(2, 'Resolucion',    'En_Proceso',  'Resuelto',   5, 'Se reemplazo el rodillo de arrastre'),
(3, 'Cambio_Estado', 'Abierto',     'En_Proceso', 1, 'Iniciando diagnostico de red'),
(3, 'Resolucion',    'En_Proceso',  'Resuelto',   4, 'Reconfiguracion de IP completada'),
(3, 'Cierre',        'Resuelto',    'Cerrado',    2, 'Cliente confirma conformidad del servicio');

-- ------------------------------------------------------------
-- COMENTARIOS
-- ------------------------------------------------------------
INSERT INTO Comentario (contenido, id_usuario, id_ticket) VALUES
('Por favor revisar con urgencia, lo necesito para trabajar.', 2, 1),
('Quedo revisando el equipo esta tarde.', 4, 1);

-- ------------------------------------------------------------
-- REPORTES TÉCNICOS
-- ------------------------------------------------------------
INSERT INTO Reporte (id_ticket, id_tecnico, solucion_aplicada, fecha_reporte, estado) VALUES
(2, 5, 'Se limpio el mecanismo y se reemplazo el rodillo de arrastre.', '2026-08-20', 'Aprobado'),
(3, 4, 'Se reinicio el adaptador de red y se reasignaron IPs estaticas.', '2026-08-12', 'Aprobado');

-- ------------------------------------------------------------
-- NOTIFICACIONES
-- ------------------------------------------------------------
INSERT INTO Notificacion (mensaje, tipo, id_usuario_destino, id_ticket) VALUES
('Su ticket ha sido asignado a un tecnico.', 'Asignacion', 2, 1),
('Su ticket ha sido resuelto.', 'Resolucion', 3, 2);

-- ------------------------------------------------------------
-- CALIFICACIONES
-- ------------------------------------------------------------
INSERT INTO Calificacion (id_ticket, id_cliente, id_tecnico, puntuacion, comentario, fecha_calificacion) VALUES
(2, 3, 5, 5, 'Excelente atencion y rapidez.', '2026-08-21'),
(3, 2, 4, 5, 'Servicio restaurado con exito.', '2026-08-13');
