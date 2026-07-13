-- ====================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS PARA SMARTPARK (LOCAL XAMPP/LAMPP)
-- Guardar como: smartpark_db.sql
-- Ejecutar este archivo en la pestaña SQL de phpMyAdmin
-- ====================================================================

CREATE DATABASE IF NOT EXISTS smartpark_db;
USE smartpark_db;

-- 1. Tabla de Usuarios (Socios y Operadores)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('CLIENT', 'OPERATOR', 'ADMIN') DEFAULT 'CLIENT',
    membresia ENUM('estandar', 'premium') DEFAULT 'estandar',
    saldo DECIMAL(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50),
    placa VARCHAR(10) UNIQUE NOT NULL,
    tipo ENUM('auto', 'moto', 'discapacitados') DEFAULT 'auto',
    marca VARCHAR(50),
    color VARCHAR(30),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Sedes (Sucursales de Parqueaderos)
CREATE TABLE IF NOT EXISTS sedes (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(150),
    capacidad_total INT DEFAULT 30,
    tarifa_hora DECIMAL(10,2) DEFAULT 5000.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Espacios (Bahías de Parqueo)
CREATE TABLE IF NOT EXISTS espacios (
    id VARCHAR(50) PRIMARY KEY,
    sede_id VARCHAR(50),
    codigo_espacio VARCHAR(10) NOT NULL,
    tipo ENUM('auto', 'moto', 'discapacitados') DEFAULT 'auto',
    estado ENUM('disponible', 'ocupado', 'reservado', 'mantenimiento') DEFAULT 'disponible',
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Reservas y Tránsito Activo
CREATE TABLE IF NOT EXISTS reservas (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50),
    usuario_nombre VARCHAR(100),
    sede_id VARCHAR(50),
    codigo_espacio VARCHAR(10),
    placa_vehiculo VARCHAR(10),
    tipo_vehiculo VARCHAR(20),
    hora_inicio VARCHAR(20),
    hora_fin VARCHAR(20),
    monto_estimado DECIMAL(10,2),
    estado ENUM('pendiente', 'activa', 'completada', 'cancelada') DEFAULT 'pendiente',
    entrada_real DATETIME DEFAULT NULL,
    salida_real DATETIME DEFAULT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DE DATOS DE PRUEBA INICIALES (MOCK DATA)
-- ====================================================================

-- Insertar Usuarios de Prueba
INSERT INTO usuarios (id, nombre, correo, rol, membresia, saldo) VALUES
('usr_1', 'Juan Pérez', 'juan.perez@smartpark.com', 'CLIENT', 'premium', 15000.00),
('usr_2', 'María Gómez', 'maria.gomez@smartpark.com', 'OPERATOR', 'estandar', 0.00),
('usr_3', 'Carlos Admin', 'admin@smartpark.com', 'ADMIN', 'premium', 50000.00)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Insertar Vehículos de Prueba
INSERT INTO vehiculos (id, usuario_id, placa, tipo, marca, color) VALUES
('veh_1', 'usr_1', 'XYZ-123', 'auto', 'Chevrolet', 'Gris'),
('veh_2', 'usr_1', 'MOTO-777', 'moto', 'KTM DUKE', 'Naranja'),
('veh_3', 'usr_3', 'KMD-582', 'auto', 'Mazda CX-30', 'Rojo')
ON DUPLICATE KEY UPDATE placa=VALUES(placa);

-- Insertar Sedes
INSERT INTO sedes (id, nombre, direccion, capacidad_total, tarifa_hora) VALUES
('sede_unilago', 'Sede Unilago - Calle 79', 'Cra 15 # 79-22, Bogotá', 30, 4500.00),
('sede_salitre', 'Sede Salitre Plaza', 'Calle 24 # 68B-85, Bogotá', 45, 5500.00)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Insertar Bahías de Parqueo (Sede Unilago)
INSERT INTO espacios (id, sede_id, codigo_espacio, tipo, estado) VALUES
('esp_u1', 'sede_unilago', 'A-01', 'auto', 'disponible'),
('esp_u2', 'sede_unilago', 'A-02', 'auto', 'disponible'),
('esp_u3', 'sede_unilago', 'A-03', 'auto', 'ocupado'),
('esp_u4', 'sede_unilago', 'M-01', 'moto', 'disponible'),
('esp_u5', 'sede_unilago', 'M-02', 'moto', 'disponible')
ON DUPLICATE KEY UPDATE codigo_espacio=VALUES(codigo_espacio);
