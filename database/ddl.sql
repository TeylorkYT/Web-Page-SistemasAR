-- ============================================================
-- Base de Datos: Sistemas AR
-- Sistema de Gestión de Tickets de Soporte Técnico
-- Motor: MySQL 8.0 (InnoDB)
-- Proyecto Formativo - ADSO
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREACIÓN DE LA BASE DE DATOS
-- ------------------------------------------------------------
DROP DATABASE IF EXISTS sistemas_ar;
CREATE DATABASE sistemas_ar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistemas_ar;

-- ------------------------------------------------------------
-- 2. LENGUAJE DE DEFINICIÓN DE DATOS (DDL)
-- ------------------------------------------------------------

-- Tabla USUARIO (Entidad base para jerarquía de roles)
CREATE TABLE Usuario (
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

-- Subtipos de Usuario
CREATE TABLE Cliente (
    id_usuario INT NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Administrador (
    id_usuario INT NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Tecnico (
    id_usuario INT NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla CATEGORIA
CREATE TABLE Categoria (
    id_categoria INT AUTO_INCREMENT,
    nombre_categoria VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    PRIMARY KEY (id_categoria),
    UNIQUE (nombre_categoria)
) ENGINE=InnoDB;

-- Tabla EQUIPO
CREATE TABLE Equipo (
    id_equipo INT AUTO_INCREMENT,
    tipo ENUM('Computador', 'Impresora', 'Servidor', 'Red', 'Otro') NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    serial VARCHAR(50) NOT NULL,
    sistema_operativo VARCHAR(50),
    id_cliente INT NOT NULL,
    estado_equipo ENUM('Operativo', 'En_Reparacion', 'Fuera_de_Servicio') NOT NULL DEFAULT 'Operativo',
    PRIMARY KEY (id_equipo),
    UNIQUE (serial),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla TICKET
CREATE TABLE Ticket (
    id_ticket INT AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion DATE NOT NULL,
    fecha_resolucion DATE,
    fecha_cierre DATE,
    prioridad ENUM('Baja', 'Media', 'Alta', 'Critica') NOT NULL DEFAULT 'Media',
    estado ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado') NOT NULL DEFAULT 'Abierto',
    id_cliente INT NOT NULL,
    id_tecnico INT,
    id_asignado_por INT,
    id_equipo INT,
    PRIMARY KEY (id_ticket),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_asignado_por) REFERENCES Administrador(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_equipo) REFERENCES Equipo(id_equipo) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Relación N:M entre TICKET y CATEGORIA
CREATE TABLE Ticket_Categoria (
    id_ticket INT NOT NULL,
    id_categoria INT NOT NULL,
    PRIMARY KEY (id_ticket, id_categoria),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla HISTORIAL_TICKET
CREATE TABLE Historial_Ticket (
    id_historial INT AUTO_INCREMENT,
    id_ticket INT NOT NULL,
    tipo_accion ENUM('Creacion', 'Asignacion', 'Cambio_Estado', 'Resolucion', 'Cierre', 'Comentario') NOT NULL,
    estado_anterior ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado'),
    estado_nuevo ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado'),
    fecha_accion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    detalles VARCHAR(255),
    PRIMARY KEY (id_historial),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla COMENTARIO
CREATE TABLE Comentario (
    id_comentario INT AUTO_INCREMENT,
    contenido TEXT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_ticket INT NOT NULL,
    PRIMARY KEY (id_comentario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla REPORTE
CREATE TABLE Reporte (
    id_reporte INT AUTO_INCREMENT,
    id_ticket INT NOT NULL,
    id_tecnico INT NOT NULL,
    solucion_aplicada TEXT NOT NULL,
    fecha_reporte DATE NOT NULL,
    estado ENUM('Pendiente', 'En_Revision', 'Aprobado') NOT NULL DEFAULT 'Pendiente',
    PRIMARY KEY (id_reporte),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla NOTIFICACION
CREATE TABLE Notificacion (
    id_notificacion INT AUTO_INCREMENT,
    mensaje VARCHAR(255) NOT NULL,
    tipo ENUM('Asignacion', 'Actualizacion', 'Resolucion', 'Comentario') NOT NULL,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario_destino INT NOT NULL,
    id_ticket INT NOT NULL,
    PRIMARY KEY (id_notificacion),
    FOREIGN KEY (id_usuario_destino) REFERENCES Usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla CALIFICACION
CREATE TABLE Calificacion (
    id_calificacion INT AUTO_INCREMENT,
    id_ticket INT NOT NULL,
    id_cliente INT NOT NULL,
    id_tecnico INT NOT NULL,
    puntuacion TINYINT NOT NULL,
    comentario VARCHAR(255),
    fecha_calificacion DATE NOT NULL,
    PRIMARY KEY (id_calificacion),
    UNIQUE (id_ticket),
    CONSTRAINT chk_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. CREACIÓN DE ÍNDICES EXPLÍCITOS
-- ------------------------------------------------------------
CREATE INDEX idx_equipo_cliente ON Equipo(id_cliente);
CREATE INDEX idx_ticket_cliente ON Ticket(id_cliente);
CREATE INDEX idx_ticket_tecnico ON Ticket(id_tecnico);
CREATE INDEX idx_ticket_estado ON Ticket(estado);
CREATE INDEX idx_historial_ticket ON Historial_Ticket(id_ticket);
CREATE INDEX idx_comentario_ticket ON Comentario(id_ticket);
CREATE INDEX idx_reporte_ticket ON Reporte(id_ticket);
CREATE INDEX idx_notificacion_destino ON Notificacion(id_usuario_destino);
