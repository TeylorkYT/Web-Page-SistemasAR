-- ============================================================
-- Base de Datos: Sistemas AR (sistemas_ar) — Versión 2.0 Corregida
-- Sistema de Gestión de Tickets de Soporte Técnico y Mantenimiento
-- Motor: MySQL 8.0 (InnoDB) · Proyecto Formativo ADSO Ficha 228118 / 3176597
-- ============================================================

CREATE DATABASE IF NOT EXISTS sistemas_ar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistemas_ar;

-- ------------------------------------------------------------
-- 1. TABLA USUARIO Y SUBTIPOS (HERENCIA 1:1)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('Cliente', 'Administrador', 'Tecnico') NOT NULL,
    fecha_registro DATE NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    PRIMARY KEY (id_usuario),
    UNIQUE (correo_electronico)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Cliente (
    id_usuario INT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(150) NOT NULL,
    area_departamento VARCHAR(80) NOT NULL DEFAULT 'General',
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Administrador (
    id_usuario INT NOT NULL,
    cargo VARCHAR(80) NOT NULL DEFAULT 'Coordinador de Soporte TI',
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Tecnico (
    id_usuario INT NOT NULL,
    especialidad VARCHAR(80) NOT NULL DEFAULT 'Soporte General TI',
    disponibilidad ENUM('Disponible', 'Ocupado', 'En_Almuerzo', 'Fuera_de_Servicio') NOT NULL DEFAULT 'Disponible',
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. TABLAS CATEGORIA, EQUIPO Y TICKET
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Categoria (
    id_categoria INT AUTO_INCREMENT,
    nombre_categoria VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    PRIMARY KEY (id_categoria),
    UNIQUE (nombre_categoria)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Equipo (
    id_equipo INT AUTO_INCREMENT,
    tipo ENUM('Computador', 'Impresora', 'Servidor', 'Red', 'Otro') NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    serial VARCHAR(50) NOT NULL,
    sistema_operativo VARCHAR(50),
    area_departamento VARCHAR(80) NOT NULL DEFAULT 'General',
    id_cliente INT NOT NULL,
    estado_equipo ENUM('Operativo', 'En_Reparacion', 'Fuera_de_Servicio') NOT NULL DEFAULT 'Operativo',
    PRIMARY KEY (id_equipo),
    UNIQUE (serial),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ticket (
    id_ticket INT AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    modalidad ENUM('Remoto', 'Presencial') NOT NULL DEFAULT 'Presencial',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME NULL,
    fecha_cierre DATETIME NULL,
    prioridad ENUM('Baja', 'Media', 'Alta', 'Critica') NOT NULL DEFAULT 'Media',
    estado ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    id_cliente INT NOT NULL,
    id_tecnico INT NULL,
    id_asignado_por INT NULL,
    id_equipo INT NULL,
    PRIMARY KEY (id_ticket),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_asignado_por) REFERENCES Administrador(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_equipo) REFERENCES Equipo(id_equipo) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ticket_Categoria (
    id_ticket INT NOT NULL,
    id_categoria INT NOT NULL,
    PRIMARY KEY (id_ticket, id_categoria),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. TABLAS DE EVIDENCIAS, AUDITORÍA, COMENTARIOS, REPORTES, NOTIFICACIONES Y CALIFICACIÓN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Adjunto_Ticket (
    id_adjunto INT AUTO_INCREMENT,
    id_ticket INT NOT NULL,
    id_usuario INT NOT NULL,
    nombre_archivo VARCHAR(150) NOT NULL,
    ruta_url VARCHAR(255) NOT NULL,
    tipo_mime ENUM('image/jpeg', 'image/png', 'application/pdf') NOT NULL,
    tamano_bytes INT NOT NULL,
    fecha_subida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_adjunto),
    CONSTRAINT chk_tamano_adjunto CHECK (tamano_bytes > 0 AND tamano_bytes <= 5242880),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Historial_Ticket (
    id_historial INT AUTO_INCREMENT,
    id_ticket INT NOT NULL,
    tipo_accion ENUM('Creacion', 'Asignacion', 'Cambio_Estado', 'Resolucion', 'Cierre', 'Comentario') NOT NULL,
    estado_anterior ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado') NULL,
    estado_nuevo ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado') NULL,
    fecha_accion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    detalles VARCHAR(255),
    PRIMARY KEY (id_historial),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Comentario (
    id_comentario INT AUTO_INCREMENT,
    contenido TEXT NOT NULL,
    es_nota_interna BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_ticket INT NOT NULL,
    PRIMARY KEY (id_comentario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Reporte (
    id_reporte INT AUTO_INCREMENT,
    id_ticket INT NOT NULL,
    id_tecnico INT NOT NULL,
    solucion_aplicada TEXT NOT NULL,
    fecha_reporte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'En_Revision', 'Aprobado') NOT NULL DEFAULT 'Pendiente',
    PRIMARY KEY (id_reporte),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Notificacion (
    id_notificacion INT AUTO_INCREMENT,
    mensaje VARCHAR(255) NOT NULL,
    tipo ENUM('Asignacion', 'Actualizacion', 'Resolucion', 'Comentario') NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario_destino INT NOT NULL,
    id_ticket INT NOT NULL,
    PRIMARY KEY (id_notificacion),
    FOREIGN KEY (id_usuario_destino) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Calificacion (
    id_calificacion INT AUTO_INCREMENT,
    id_ticket INT NOT NULL,
    id_cliente INT NOT NULL,
    id_tecnico INT NOT NULL,
    puntuacion TINYINT NOT NULL,
    comentario VARCHAR(255),
    fecha_calificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_calificacion),
    UNIQUE (id_ticket),
    CONSTRAINT chk_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. ÍNDICES EXPLÍCITOS DE RENDIMIENTO
-- ------------------------------------------------------------
CREATE INDEX idx_equipo_cliente ON Equipo(id_cliente);
CREATE INDEX idx_equipo_area ON Equipo(area_departamento);
CREATE INDEX idx_ticket_cliente ON Ticket(id_cliente);
CREATE INDEX idx_ticket_tecnico ON Ticket(id_tecnico);
CREATE INDEX idx_ticket_estado ON Ticket(estado);
CREATE INDEX idx_adjunto_ticket ON Adjunto_Ticket(id_ticket);
CREATE INDEX idx_historial_ticket ON Historial_Ticket(id_ticket);
CREATE INDEX idx_comentario_ticket ON Comentario(id_ticket);
CREATE INDEX idx_reporte_ticket ON Reporte(id_ticket);
CREATE INDEX idx_notificacion_destino ON Notificacion(id_usuario_destino);
