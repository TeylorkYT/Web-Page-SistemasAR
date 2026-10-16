-- ============================================================
-- Datos de Prueba - Sistemas AR (sistemas_ar) — Versión 2.0
-- Ejecutar DESPUÉS del script mibasededatos.sql
-- Motor: MySQL 8.0 (InnoDB)
-- ============================================================

USE sistemas_ar;

-- ------------------------------------------------------------
-- 1. TABLA USUARIO Y SUBTIPOS (1 Admin, 3 Técnicos, 3 Clientes)
-- Nota: La columna contrasena almacena HASH_PENDIENTE hasta daily 3 (login)
-- ------------------------------------------------------------
INSERT INTO Usuario (id_usuario, nombre, apellido, correo_electronico, contrasena, rol, fecha_registro, estado) VALUES
(1, 'Carlos', 'Administrador', 'admin@prueba.com',              'HASH_PENDIENTE', 'Administrador', '2026-08-01', 'Activo'),
(2, 'Diana',  'Paz',           'tecnico@prueba.com',            'HASH_PENDIENTE', 'Tecnico',       '2026-08-01', 'Activo'),
(3, 'Andres', 'Rojas',         'andres.rojas@sistemasar.net',   'HASH_PENDIENTE', 'Tecnico',       '2026-08-01', 'Activo'),
(4, 'Mario',  'Mendoza',       'mario.mendoza@sistemasar.net',  'HASH_PENDIENTE', 'Tecnico',       '2026-08-02', 'Activo'),
(5, 'Laura',  'Ramirez',       'cliente@prueba.com',            'HASH_PENDIENTE', 'Cliente',       '2026-08-02', 'Activo'),
(6, 'Carlos', 'Ordonez',       'carlos.ordonez@empresa.com',    'HASH_PENDIENTE', 'Cliente',       '2026-08-03', 'Activo'),
(7, 'Maria',  'Gomez',         'maria.gomez@empresa.com',       'HASH_PENDIENTE', 'Cliente',       '2026-08-04', 'Activo');

-- Subtipo Administrador
INSERT INTO Administrador (id_usuario, cargo) VALUES
(1, 'Coordinador de Soporte TI');

-- Subtipo Tecnico (uno Disponible, uno Ocupado, uno Fuera_de_Servicio)
INSERT INTO Tecnico (id_usuario, especialidad, disponibilidad) VALUES
(2, 'Redes y Conectividad',  'Disponible'),
(3, 'Mantenimiento Hardware','Ocupado'),
(4, 'Soporte Software',      'Fuera_de_Servicio');

-- Subtipo Cliente (3 clientes con diferente area_departamento)
INSERT INTO Cliente (id_usuario, telefono, direccion, area_departamento) VALUES
(5, '3101234567', 'Calle 10 # 5-20',          'Administracion'),
(6, '3119876543', 'Carrera 7 # 12-40',        'Ventas'),
(7, '3125558899', 'Avenida Colombia # 3-15',   'Operaciones');

-- ------------------------------------------------------------
-- 2. CATEGORÍAS DE SOPORTE TÉCNICO (5 categorías)
-- ------------------------------------------------------------
INSERT INTO Categoria (id_categoria, nombre_categoria, descripcion) VALUES
(1, 'Mantenimiento Hardware', 'Reparacion o reemplazo de componentes fisicos de computadores y perifericos'),
(2, 'Soporte Software',       'Instalacion, configuracion y solucion de errores de programas y sistemas operativos'),
(3, 'Redes y Conectividad',   'Diagnostico y solucion de fallas de internet, cableado estructurado y WiFi'),
(4, 'Seguridad Informatica',  'Revision de malware, antivirus, copias de seguridad y politicas de acceso'),
(5, 'Servidores y Nube',      'Mantenimiento y administracion de servidores locales y servicios en la nube');

-- ------------------------------------------------------------
-- 3. EQUIPOS DE LOS CLIENTES (5 equipos con serial único)
-- ------------------------------------------------------------
INSERT INTO Equipo (id_equipo, tipo, marca, modelo, serial, sistema_operativo, area_departamento, id_cliente, estado_equipo) VALUES
(1, 'Computador', 'HP',     'ProDesk 400',    'SN-HP-001',  'Windows 11',         'Administracion', 5, 'Operativo'),
(2, 'Impresora',  'Epson',  'EcoTank L3250',  'SN-EPS-002', NULL,                 'Ventas',         6, 'En_Reparacion'),
(3, 'Servidor',   'Dell',   'PowerEdge T140', 'SN-DEL-003', 'Ubuntu Server 22.04', 'Operaciones',    7, 'Operativo'),
(4, 'Computador', 'Lenovo', 'ThinkPad E14',   'SN-LEN-004', 'Windows 10 Pro',     'Administracion', 5, 'Operativo'),
(5, 'Red',        'Cisco',  'Catalyst 2960',  'SN-CIS-005', 'Cisco IOS',          'Ventas',         6, 'Operativo');

-- ------------------------------------------------------------
-- 4. TICKETS (9 tickets: 4 estados, 4 prioridades, 2 modalidades, con y sin técnico)
-- ------------------------------------------------------------
INSERT INTO Ticket (id_ticket, titulo, descripcion, modalidad, fecha_creacion, fecha_resolucion, fecha_cierre, prioridad, estado, id_cliente, id_tecnico, id_asignado_por, id_equipo) VALUES
(1, 'Equipo no enciende tras corte de energia',               'El computador de recepcion no responde al boton de encendido tras la tormenta de anoche.',  'Presencial', '2026-08-20 08:30:00', NULL,                  NULL,                  'Alta',    'Abierto',    5, NULL, NULL, 1),
(2, 'Impresora atasca papel en bandeja principal',           'La impresora atasca las hojas al imprimir mas de 5 paginas seguidas.',                       'Presencial', '2026-08-21 09:15:00', NULL,                  NULL,                  'Media',   'En_Proceso', 6, 3,    1,    2),
(3, 'Caida de enlace principal de red local',                'El switch central no distribuye direcciones IP y el servidor no responde a peticiones.',     'Presencial', '2026-08-10 14:00:00', '2026-08-12 16:30:00', '2026-08-13 10:00:00', 'Critica', 'Cerrado',    7, 2,    1,    3),
(4, 'Instalacion de certificado digital y VPN',               'Se requiere configurar la conexion VPN remota en portatil para trabajo desde casa.',          'Remoto',     '2026-08-22 10:00:00', '2026-08-22 15:45:00', NULL,                  'Baja',    'Resuelto',   5, 2,    1,    4),
(5, 'Lentitud extrema en sistema de facturacion',             'El sistema tarda mas de un minuto en abrir cada factura. Sospecha de software malicioso.',   'Remoto',     '2026-08-23 11:20:00', NULL,                  NULL,                  'Media',   'Abierto',    6, NULL, NULL, 5),
(6, 'Falla intermitente en switch de ventas',                'Desconexion recurrente de los terminales de punto de venta cada 30 minutos.',                'Presencial', '2026-08-15 08:00:00', '2026-08-16 11:30:00', '2026-08-17 09:00:00', 'Alta',    'Cerrado',    6, 3,    1,    5),
(7, 'Actualizacion de sistema operativo y parches',          'Actualizacion programada de seguridad en estacion de trabajo principal.',                    'Remoto',     '2026-08-24 14:00:00', '2026-08-24 18:00:00', NULL,                  'Baja',    'Resuelto',   7, 2,    1,    3),
(8, 'Configuracion de politicas de copia de seguridad',       'Revision de sincronizacion en la nube de base de datos contable.',                           'Remoto',     '2026-08-18 09:00:00', '2026-08-19 14:00:00', '2026-08-19 17:00:00', 'Media',   'Cerrado',    5, 3,    1,    1),
(9, 'Fuga de corriente en chasis de servidor',                'Se detecta descarga estatica al tocar el bastidor del rack.',                                'Presencial', '2026-08-25 08:00:00', NULL,                  NULL,                  'Critica', 'En_Proceso', 7, 2,    1,    3);

-- Relación N:M Ticket - Categoría (tickets con múltiples categorías)
INSERT INTO Ticket_Categoria (id_ticket, id_categoria) VALUES
(1, 1),
(2, 1),
(2, 2),
(3, 3),
(4, 2),
(4, 3),
(5, 2),
(5, 4),
(6, 3),
(7, 2),
(8, 4),
(8, 5),
(9, 1),
(9, 5);

-- ------------------------------------------------------------
-- 5. ADJUNTOS DE TICKETS (validación mime y límite de 5 MB)
-- ------------------------------------------------------------
INSERT INTO Adjunto_Ticket (id_adjunto, id_ticket, id_usuario, nombre_archivo, ruta_url, tipo_mime, tamano_bytes, fecha_subida) VALUES
(1, 1, 5, 'pantalla_negra.jpg',   '/uploads/evidencias/pantalla_negra.jpg',   'image/jpeg',      1450200, '2026-08-20 08:35:00'),
(2, 2, 6, 'atasco_rodillo.png',   '/uploads/evidencias/atasco_rodillo.png',   'image/png',       2048500, '2026-08-21 09:20:00'),
(3, 3, 7, 'diagnostico_red.pdf',   '/uploads/evidencias/diagnostico_red.pdf',  'application/pdf',  856000, '2026-08-10 14:15:00');

-- ------------------------------------------------------------
-- 6. HISTORIAL DE TICKETS (trazabilidad de auditoría)
-- ------------------------------------------------------------
INSERT INTO Historial_Ticket (id_historial, id_ticket, tipo_accion, estado_anterior, estado_nuevo, fecha_accion, id_usuario, detalles) VALUES
(1,  1, 'Creacion',      NULL,         'Abierto',    '2026-08-20 08:30:00', 5, 'Ticket registrado por Laura Ramirez desde el portal web'),
(2,  2, 'Creacion',      NULL,         'Abierto',    '2026-08-21 09:15:00', 6, 'Ticket registrado por Carlos Ordonez'),
(3,  2, 'Asignacion',    'Abierto',    'En_Proceso', '2026-08-21 10:00:00', 1, 'Asignado al tecnico Andres Rojas por el Administrador Carlos'),
(4,  3, 'Creacion',      NULL,         'Abierto',    '2026-08-10 14:00:00', 7, 'Falla critica reportada por Maria Gomez'),
(5,  3, 'Asignacion',    'Abierto',    'En_Proceso', '2026-08-10 14:30:00', 1, 'Asignacion prioritaria al tecnico Diana Paz'),
(6,  3, 'Resolucion',    'En_Proceso', 'Resuelto',   '2026-08-12 16:30:00', 2, 'Reemplazo de patch cord y reconfiguracion de VLAN en switch'),
(7,  3, 'Cierre',        'Resuelto',   'Cerrado',    '2026-08-13 10:00:00', 7, 'Cliente valida conectividad y confirma cierre'),
(8,  4, 'Creacion',      NULL,         'Abierto',    '2026-08-22 10:00:00', 5, 'Solicitud de instalacion de VPN remota'),
(9,  4, 'Asignacion',    'Abierto',    'En_Proceso', '2026-08-22 10:30:00', 1, 'Asignado a Diana Paz'),
(10, 4, 'Resolucion',    'En_Proceso', 'Resuelto',   '2026-08-22 15:45:00', 2, 'Instalacion de cliente VPN y certificados completada'),
(11, 5, 'Creacion',      NULL,         'Abierto',    '2026-08-23 11:20:00', 6, 'Ticket reportado pendiente de triaje'),
(12, 6, 'Creacion',      NULL,         'Abierto',    '2026-08-15 08:00:00', 6, 'Reporte de intermitencia de red'),
(13, 6, 'Asignacion',    'Abierto',    'En_Proceso', '2026-08-15 09:00:00', 1, 'Asignado a Andres Rojas'),
(14, 6, 'Resolucion',    'En_Proceso', 'Resuelto',   '2026-08-16 11:30:00', 3, 'Se ajusto conector RJ45 flojo en switch'),
(15, 6, 'Cierre',        'Resuelto',   'Cerrado',    '2026-08-17 09:00:00', 6, 'Cierre confirmado por cliente'),
(16, 7, 'Creacion',      NULL,         'Abierto',    '2026-08-24 14:00:00', 7, 'Mantenimiento de software solicitado'),
(17, 7, 'Asignacion',    'Abierto',    'En_Proceso', '2026-08-24 14:15:00', 1, 'Asignado a Diana Paz'),
(18, 7, 'Resolucion',    'En_Proceso', 'Resuelto',   '2026-08-24 18:00:00', 2, 'Actualizaciones aplicadas con exito'),
(19, 8, 'Creacion',      NULL,         'Abierto',    '2026-08-18 09:00:00', 5, 'Revision de copias de seguridad'),
(20, 8, 'Asignacion',    'Abierto',    'En_Proceso', '2026-08-18 09:30:00', 1, 'Asignado a Andres Rojas'),
(21, 8, 'Resolucion',    'En_Proceso', 'Resuelto',   '2026-08-19 14:00:00', 3, 'Politicas de backup programadas semanalmente'),
(22, 8, 'Cierre',        'Resuelto',   'Cerrado',    '2026-08-19 17:00:00', 5, 'Cliente valida almacenamiento de copias'),
(23, 9, 'Creacion',      NULL,         'Abierto',    '2026-08-25 08:00:00', 7, 'Reporte de fuga estatica en rack'),
(24, 9, 'Asignacion',    'Abierto',    'En_Proceso', '2026-08-25 08:30:00', 1, 'Asignado a Diana Paz para revision electrica');

-- ------------------------------------------------------------
-- 7. COMENTARIOS (públicos y notas internas)
-- ------------------------------------------------------------
INSERT INTO Comentario (id_comentario, contenido, es_nota_interna, fecha_creacion, id_usuario, id_ticket) VALUES
(1, 'Por favor atender pronto, no podemos facturar en recepcion.',                                  FALSE, '2026-08-20 08:40:00', 5, 1),
(2, 'El atasco ocurre con papel bond estandar.',                                                    FALSE, '2026-08-21 09:25:00', 6, 2),
(3, 'Se revisara el rodillo de alimentacion y los sensores opticos del mecanismo de arrastre.',     TRUE,  '2026-08-21 10:15:00', 3, 2),
(4, 'Diagnostico interno: puerto 12 sulfatado. Se procede a cambiar puerto y cable.',               TRUE,  '2026-08-11 11:00:00', 2, 3),
(5, 'El servicio ya funciona perfectamente en todos los puestos.',                                  FALSE, '2026-08-13 09:50:00', 7, 3),
(6, 'Medicion de voltaje en chasis: 48V AC detectados por falta de linea a tierra.',                TRUE,  '2026-08-25 09:10:00', 2, 9);

-- ------------------------------------------------------------
-- 8. REPORTES TÉCNICOS (1 por cada ticket Resuelto o Cerrado)
-- ------------------------------------------------------------
INSERT INTO Reporte (id_reporte, id_ticket, id_tecnico, solucion_aplicada, fecha_reporte, estado) VALUES
(1, 3, 2, 'Se reemplazo cable UTP categoria 6 dañado y se migro la conexion al puerto 16 del switch administrable. Se valido conectividad ping y acceso a servidor con 0% perdida de paquetes.', '2026-08-12 16:30:00', 'Aprobado'),
(2, 4, 2, 'Se instalo cliente OpenVPN, se importaron perfiles de usuario y certificados de autenticacion. Se realizo prueba de conexion exitosa hacia los servicios internos.',                    '2026-08-22 15:45:00', 'Aprobado'),
(3, 6, 3, 'Se realizo mantenimiento preventivo al switch, limpieza de polvo en ventiladores y ponchado de nuevos conectores RJ45 en cableado de punto de venta.',                                  '2026-08-16 11:30:00', 'Aprobado'),
(4, 7, 2, 'Se ejecutaron scripts de actualizacion del kernel y parches de seguridad de software base, reiniciando los servicios dependientes sin afectacion operativa.',                           '2026-08-24 18:00:00', 'Aprobado'),
(5, 8, 3, 'Se creo tarea automatizada con rsync cifrado hacia almacenamiento seguro en la nube y se configuro alerta por correo ante fallos de sincronizacion.',                                    '2026-08-19 14:00:00', 'Aprobado');

-- ------------------------------------------------------------
-- 9. NOTIFICACIONES (leídas y sin leer)
-- ------------------------------------------------------------
INSERT INTO Notificacion (id_notificacion, mensaje, tipo, leida, fecha_envio, id_usuario_destino, id_ticket) VALUES
(1, 'Su ticket #1 ha sido registrado exitosamente en el sistema.',               'Actualizacion', TRUE,  '2026-08-20 08:31:00', 5, 1),
(2, 'Se le ha asignado el ticket #2: Impresora atasca papel.',                   'Asignacion',    FALSE, '2026-08-21 10:01:00', 3, 2),
(3, 'Su ticket #3 ha sido resuelto por el tecnico Diana Paz.',                   'Resolucion',    TRUE,  '2026-08-12 16:31:00', 7, 3),
(4, 'Alerta: El ticket #6 ha recibido una calificacion baja (1 estrella).',       'Comentario',    FALSE, '2026-08-17 09:31:00', 1, 6),
(5, 'Se le ha asignado el ticket #9 de prioridad Critica.',                      'Asignacion',    FALSE, '2026-08-25 08:31:00', 2, 9);

-- ------------------------------------------------------------
-- 10. CALIFICACIONES (1 por ticket cerrado, incluye 1 estrella)
-- ------------------------------------------------------------
INSERT INTO Calificacion (id_calificacion, id_ticket, id_cliente, id_tecnico, puntuacion, comentario, fecha_calificacion) VALUES
(1, 3, 7, 2, 5, 'Excelente soporte de Diana, resolvio la falla critica de red muy rapido.',                               '2026-08-13 10:10:00'),
(2, 6, 6, 3, 1, 'El tecnico tardo demasiado en llegar y la conexion volvio a fallar horas despues de la reparacion.',     '2026-08-17 09:30:00'),
(3, 8, 5, 3, 4, 'Buen trabajo en la configuracion de las copias de seguridad de contabilidad.',                           '2026-08-19 17:15:00');
