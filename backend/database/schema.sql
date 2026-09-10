-- Esquema inicial: tabla de usuarios (login + administración de cuentas).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    username VARCHAR(60) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'vendedor')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Catálogo de productos usados al registrar deudas.
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    precio_actual NUMERIC(12, 2) NOT NULL CHECK (precio_actual >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clientes a los que se les puede fiar (registrar deudas y pagos).
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    direccion VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Venta fiada asociada a un cliente. `monto_total` se recalcula automáticamente
-- (ver trigger recalcular_monto_total_deuda) a partir de sus venta_detalles.
CREATE TABLE IF NOT EXISTS deudas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    monto_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monto_total >= 0),
    fecha_fiado TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Línea de producto incluida dentro de una deuda.
CREATE TABLE IF NOT EXISTS venta_detalles (
    id SERIAL PRIMARY KEY,
    deuda_id INTEGER NOT NULL REFERENCES deudas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_venta NUMERIC(12, 2) NOT NULL CHECK (precio_unitario_venta >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pago recibido de un cliente.
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    monto_pagado NUMERIC(12, 2) NOT NULL CHECK (monto_pagado >= 0),
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT now(),
    metodo_pago VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parte de un pago aplicada a una deuda concreta.
CREATE TABLE IF NOT EXISTS pago_aplicaciones (
    id SERIAL PRIMARY KEY,
    pago_id INTEGER NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
    deuda_id INTEGER NOT NULL REFERENCES deudas(id) ON DELETE CASCADE,
    monto_aplicado NUMERIC(12, 2) NOT NULL CHECK (monto_aplicado >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migración: agrega las columnas de auditoría a bases creadas antes de esta versión.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE deudas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE deudas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE deudas ALTER COLUMN monto_total SET DEFAULT 0;
ALTER TABLE venta_detalles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE venta_detalles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pago_aplicaciones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pago_aplicaciones ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- RF10: audita automáticamente la fecha de modificación de cualquier registro.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_productos_updated_at ON productos;
CREATE TRIGGER trg_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_clientes_updated_at ON clientes;
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_deudas_updated_at ON deudas;
CREATE TRIGGER trg_deudas_updated_at BEFORE UPDATE ON deudas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_venta_detalles_updated_at ON venta_detalles;
CREATE TRIGGER trg_venta_detalles_updated_at BEFORE UPDATE ON venta_detalles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_pagos_updated_at ON pagos;
CREATE TRIGGER trg_pagos_updated_at BEFORE UPDATE ON pagos FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_pago_aplicaciones_updated_at ON pago_aplicaciones;
CREATE TRIGGER trg_pago_aplicaciones_updated_at BEFORE UPDATE ON pago_aplicaciones FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RF4: recalcula automáticamente deudas.monto_total a partir de sus venta_detalles
-- cada vez que se inserta, actualiza o elimina una línea (sin importar qué endpoint lo haga).
CREATE OR REPLACE FUNCTION recalcular_monto_total_deuda() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE deudas SET monto_total = (
            SELECT COALESCE(SUM(cantidad * precio_unitario_venta), 0) FROM venta_detalles WHERE deuda_id = OLD.deuda_id
        ) WHERE id = OLD.deuda_id;
        RETURN OLD;
    END IF;

    UPDATE deudas SET monto_total = (
        SELECT COALESCE(SUM(cantidad * precio_unitario_venta), 0) FROM venta_detalles WHERE deuda_id = NEW.deuda_id
    ) WHERE id = NEW.deuda_id;

    IF TG_OP = 'UPDATE' AND OLD.deuda_id IS DISTINCT FROM NEW.deuda_id THEN
        UPDATE deudas SET monto_total = (
            SELECT COALESCE(SUM(cantidad * precio_unitario_venta), 0) FROM venta_detalles WHERE deuda_id = OLD.deuda_id
        ) WHERE id = OLD.deuda_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_venta_detalles_recalcular ON venta_detalles;
CREATE TRIGGER trg_venta_detalles_recalcular
    AFTER INSERT OR UPDATE OR DELETE ON venta_detalles
    FOR EACH ROW EXECUTE FUNCTION recalcular_monto_total_deuda();
