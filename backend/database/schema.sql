-- Esquema inicial: tabla de usuarios (login + administración de cuentas).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    username VARCHAR(60) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'vendedor')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Catálogo de productos usados al registrar deudas.
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    precio_actual NUMERIC(12, 2) NOT NULL CHECK (precio_actual >= 0)
);

-- Clientes a los que se les puede fiar (registrar deudas y pagos).
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    direccion VARCHAR(255)
);

-- Venta fiada asociada a un cliente.
CREATE TABLE IF NOT EXISTS deudas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    monto_total NUMERIC(12, 2) NOT NULL CHECK (monto_total >= 0),
    fecha_fiado TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Línea de producto incluida dentro de una deuda.
CREATE TABLE IF NOT EXISTS venta_detalles (
    id SERIAL PRIMARY KEY,
    deuda_id INTEGER NOT NULL REFERENCES deudas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_venta NUMERIC(12, 2) NOT NULL CHECK (precio_unitario_venta >= 0)
);

-- Pago recibido de un cliente.
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    monto_pagado NUMERIC(12, 2) NOT NULL CHECK (monto_pagado >= 0),
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT now(),
    metodo_pago VARCHAR(30) NOT NULL
);

-- Parte de un pago aplicada a una deuda concreta.
CREATE TABLE IF NOT EXISTS pago_aplicaciones (
    id SERIAL PRIMARY KEY,
    pago_id INTEGER NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
    deuda_id INTEGER NOT NULL REFERENCES deudas(id) ON DELETE CASCADE,
    monto_aplicado NUMERIC(12, 2) NOT NULL CHECK (monto_aplicado >= 0)
);
