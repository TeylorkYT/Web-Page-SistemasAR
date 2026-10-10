-- =======================================================
-- PROYECTO: sistemasar.net
-- AUTOR: Teylork
-- DESCRIPCIÓN: Datos iniciales y de prueba
-- NOTA: Las contraseñas son provisionales para pruebas.
--       Se encriptarán el día de la implementación del login.
-- =======================================================

USE sistemasar_db;

-- -------------------------------------------------------
-- 1. Insertar Roles del Sistema
-- -------------------------------------------------------
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'administrador', 'Acceso total y administración del sistema'),
(2, 'tecnico', 'Gestión y atención de órdenes de trabajo asignadas'),
(3, 'cliente', 'Solicitud y consulta del estado de servicios')
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion);

-- -------------------------------------------------------
-- 2. Insertar Usuarios de Prueba (uno por cada rol)
-- Contraseña provisional: prueba123
-- -------------------------------------------------------
INSERT INTO usuarios (id, nombre, correo, contrasena, rol_id, activo) VALUES
(1, 'Administrador SistemasAR', 'admin@sistemasar.net', 'prueba123', 1, TRUE),
(2, 'Carlos Técnico', 'tecnico@sistemasar.net', 'prueba123', 2, TRUE),
(3, 'Ana Cliente', 'cliente@sistemasar.net', 'prueba123', 3, TRUE)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- -------------------------------------------------------
-- 3. Perfil de Cliente
-- -------------------------------------------------------
INSERT INTO clientes (id, usuario_id, telefono, direccion, documento) VALUES
(1, 3, '3001234567', 'Calle 45 # 12-34, Bogotá', '1020304050')
ON DUPLICATE KEY UPDATE telefono=VALUES(telefono);

-- -------------------------------------------------------
-- 4. Perfil de Técnico
-- -------------------------------------------------------
INSERT INTO tecnicos (id, usuario_id, especialidad, disponible) VALUES
(1, 2, 'Mantenimiento de computadores y redes', TRUE)
ON DUPLICATE KEY UPDATE especialidad=VALUES(especialidad);

-- -------------------------------------------------------
-- 5. Catálogo de Servicios Iniciales
-- -------------------------------------------------------
INSERT INTO servicios (id, nombre, descripcion, precio, activo) VALUES
(1, 'Mantenimiento Preventivo', 'Limpieza física, cambio de pasta térmica y optimización de software', 60000.00, TRUE),
(2, 'Formateo e Instalación de SO', 'Instalación limpia de Windows/Linux con drivers y programas básicos', 80000.00, TRUE),
(3, 'Diagnóstico y Reparación de Hardware', 'Revisión técnica de componentes electrónicos y cambio de piezas', 120000.00, TRUE),
(4, 'Configuración de Redes', 'Instalación y configuración de routers, switches y cableado estructurado', 95000.00, TRUE)
ON DUPLICATE KEY UPDATE precio=VALUES(precio);

-- -------------------------------------------------------
-- 6. Orden de Trabajo de Prueba
-- -------------------------------------------------------
INSERT INTO ordenes_trabajo (id, cliente_id, tecnico_id, descripcion, estado, prioridad, fecha_inicio) VALUES
(1, 1, 1, 'Equipo portátil no enciende tras descarga eléctrica. Requiere revisión urgente.', 'en_progreso', 'alta', CURDATE())
ON DUPLICATE KEY UPDATE estado=VALUES(estado);

-- -------------------------------------------------------
-- 7. Detalle de la Orden
-- -------------------------------------------------------
INSERT INTO detalle_ordenes (id, orden_id, servicio_id, cantidad, precio_unitario, subtotal, notas) VALUES
(1, 1, 3, 1, 120000.00, 120000.00, 'Revisión de fuente de poder y placa base')
ON DUPLICATE KEY UPDATE subtotal=VALUES(subtotal);

-- -------------------------------------------------------
-- 8. Historial Inicial
-- -------------------------------------------------------
INSERT INTO historial (id, orden_id, usuario_id, accion, detalle) VALUES
(1, 1, 1, 'Creación de orden', 'Orden de trabajo registrada por el administrador en el sistema'),
(2, 1, 2, 'Asignación de técnico', 'Orden asignada al técnico Carlos Técnico')
ON DUPLICATE KEY UPDATE accion=VALUES(accion);
