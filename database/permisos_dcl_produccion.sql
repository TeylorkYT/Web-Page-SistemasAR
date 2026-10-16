-- ============================================================
-- Permisos DCL para Servidor VPS de Producción (Hostinger)
-- Ejecutar únicamente en el entorno de producción donde la app
-- y la base de datos conviven en el mismo host (localhost).
-- ============================================================

USE sistemas_ar;

-- 5. CONTROL DE PERMISOS DCL CORREGIDO POR ROL
-- NOTA DE SEGURIDAD: Reemplazar las contraseñas de ejemplo por contraseñas seguras en producción.
CREATE USER IF NOT EXISTS 'admin_user'@'localhost' IDENTIFIED BY 'AdminPass123!';
CREATE USER IF NOT EXISTS 'tecnico_user'@'localhost' IDENTIFIED BY 'TecnicoPass123!';
CREATE USER IF NOT EXISTS 'cliente_user'@'localhost' IDENTIFIED BY 'ClientePass123!';

GRANT ALL PRIVILEGES ON sistemas_ar.* TO 'admin_user'@'localhost';

GRANT SELECT, INSERT, UPDATE ON sistemas_ar.Ticket TO 'tecnico_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON sistemas_ar.Reporte TO 'tecnico_user'@'localhost';
GRANT SELECT, UPDATE ON sistemas_ar.Tecnico TO 'tecnico_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Comentario TO 'tecnico_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Adjunto_Ticket TO 'tecnico_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Historial_Ticket TO 'tecnico_user'@'localhost';
GRANT SELECT, UPDATE ON sistemas_ar.Notificacion TO 'tecnico_user'@'localhost';
GRANT SELECT ON sistemas_ar.Equipo TO 'tecnico_user'@'localhost';
GRANT SELECT ON sistemas_ar.Categoria TO 'tecnico_user'@'localhost';
GRANT SELECT ON sistemas_ar.Ticket_Categoria TO 'tecnico_user'@'localhost';

GRANT SELECT, INSERT ON sistemas_ar.Ticket TO 'cliente_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Ticket_Categoria TO 'cliente_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Adjunto_Ticket TO 'cliente_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Comentario TO 'cliente_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Historial_Ticket TO 'cliente_user'@'localhost';
GRANT SELECT, INSERT ON sistemas_ar.Calificacion TO 'cliente_user'@'localhost';
GRANT SELECT, UPDATE ON sistemas_ar.Notificacion TO 'cliente_user'@'localhost';
GRANT SELECT ON sistemas_ar.Equipo TO 'cliente_user'@'localhost';
GRANT SELECT ON sistemas_ar.Categoria TO 'cliente_user'@'localhost';
GRANT SELECT ON sistemas_ar.Reporte TO 'cliente_user'@'localhost';

FLUSH PRIVILEGES;
