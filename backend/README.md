# Backend - Sistema de Crédito Fiado

API en Python (FastAPI + PostgreSQL) que expone autenticación y el CRUD de usuarios, productos, clientes, deudas, ventas y pagos. Basado en la estructura del proyecto de referencia `User-management-backend`: FastAPI, `psycopg2` con SQL crudo (sin ORM) y JWT.

Desplegado en Render: https://sistema-de-credito-fiado.onrender.com/docs#/

## Estructura

- `config/`: variables de entorno (conexión a la base de datos y JWT).
- `database/database.py`: conexión a PostgreSQL (`get_db` como dependencia de FastAPI).
- `database/schema.sql`: script para crear todas las tablas (`usuarios`, `productos`, `clientes`, `deudas`, `venta_detalles`, `pagos`, `pago_aplicaciones`).
- `models/*_connection.py`: acceso a datos (CRUD con SQL crudo), uno por entidad.
- `schema/*_schema.py`: esquemas Pydantic de entrada/salida, uno por entidad.
- `schema/auth_schema.py`: esquemas del token JWT.
- `auth/auth.py`: hashing de contraseñas, creación/validación de JWT y dependencias de autorización (`get_current_active_user`, `get_current_admin_user`).
- `auth/auth_routes.py`: endpoint de login (`POST /auth/token`).
- `main.py`: endpoints del CRUD de todas las entidades.
- `create_admin.py`: script para crear o resetear el usuario administrador inicial.

El modelo de `Usuario` replica el contrato definido en `../src/domain/types.ts` (`nombre`, `username`, `rol`: `admin` | `vendedor`, `activo`), agregando `password_hash` en vez de guardar la contraseña en texto plano.

### Diccionario de datos

| Entidad | Campos | Relaciones |
| --- | --- | --- |
| `Cliente` | `id` (PK), `nombre`, `telefono`, `direccion` | 1 → N `Deuda`, 1 → N `Pago` |
| `Producto` | `id` (PK), `nombre`, `precio_actual` | 1 → N `VentaDetalle` |
| `Deuda` | `id` (PK), `cliente_id` (FK → Cliente), `monto_total`, `fecha_fiado` | 1 → N `VentaDetalle`, 1 → N `PagoAplicacion` |
| `VentaDetalle` | `id` (PK), `deuda_id` (FK → Deuda), `producto_id` (FK → Producto), `cantidad`, `precio_unitario_venta` | — |
| `Pago` | `id` (PK), `cliente_id` (FK → Cliente), `monto_pagado`, `fecha_pago`, `metodo_pago` | 1 → N `PagoAplicacion` |
| `PagoAplicacion` | `id` (PK), `pago_id` (FK → Pago), `deuda_id` (FK → Deuda), `monto_aplicado` | — |

Eliminar un `Cliente` elimina en cascada sus `Deuda` y `Pago` (y estos, a su vez, sus `VentaDetalle`/`PagoAplicacion`). No se puede eliminar un `Producto` referenciado por algún `VentaDetalle`.

## Instalación

1. Crea y activa un entorno virtual:

   ```sh
   python -m venv venv
   source venv/bin/activate      # macOS / Linux
   ```

2. Instala las dependencias:

   ```sh
   pip install -r requirements.txt
   ```

3. Copia `.env.example` a `.env` y ajusta los valores (base de datos PostgreSQL local y `SECRET_KEY`):

   ```sh
   cp .env.example .env
   ```

4. Crea la base de datos y aplica el esquema:

   ```sh
   createdb sistema_credito_fiado
   psql -d sistema_credito_fiado -f database/schema.sql
   ```

5. Crea el usuario administrador inicial:

   ```sh
   python create_admin.py admin admin123 "Administrador"
   ```

## Uso

```sh
python main.py
# o
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Documentación interactiva en `http://127.0.0.1:8000/docs`.

## Endpoints

| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| POST | `/auth/token` | Login (`username`/`password` como form-data), retorna JWT | Público |
| GET | `/api/usuarios/me` | Perfil del usuario autenticado | Cualquier usuario activo |
| GET | `/api/usuarios` | Lista todos los usuarios | Admin |
| GET | `/api/usuarios/{id}` | Obtiene un usuario | Admin |
| POST | `/api/usuarios` | Crea un usuario | Admin |
| PUT | `/api/usuarios/{id}` | Actualiza un usuario (parcial) | Admin |
| DELETE | `/api/usuarios/{id}` | Elimina un usuario | Admin |
| GET | `/api/productos` | Lista todos los productos | Cualquier usuario activo |
| POST | `/api/productos` | Crea un producto | Cualquier usuario activo |
| PUT | `/api/productos/{id}` | Actualiza un producto (parcial) | Cualquier usuario activo |
| DELETE | `/api/productos/{id}` | Elimina un producto | Cualquier usuario activo |
| GET | `/api/clientes` | Lista todos los clientes | Cualquier usuario activo |
| GET/POST/PUT/DELETE | `/api/clientes[/{id}]` | CRUD de clientes | Cualquier usuario activo |
| GET | `/api/deudas?cliente_id=` | Lista deudas, opcionalmente filtradas por cliente | Cualquier usuario activo |
| GET/POST/PUT/DELETE | `/api/deudas[/{id}]` | CRUD de deudas | Cualquier usuario activo |
| GET | `/api/venta-detalles?deuda_id=` | Lista líneas de venta, opcionalmente filtradas por deuda | Cualquier usuario activo |
| GET/POST/PUT/DELETE | `/api/venta-detalles[/{id}]` | CRUD de líneas de venta | Cualquier usuario activo |
| GET | `/api/pagos?cliente_id=` | Lista pagos, opcionalmente filtrados por cliente | Cualquier usuario activo |
| GET/POST/PUT/DELETE | `/api/pagos[/{id}]` | CRUD de pagos | Cualquier usuario activo |
| GET | `/api/pago-aplicaciones?pago_id=&deuda_id=` | Lista aplicaciones de pago, opcionalmente filtradas | Cualquier usuario activo |
| GET/POST/PUT/DELETE | `/api/pago-aplicaciones[/{id}]` | CRUD de aplicaciones de pago | Cualquier usuario activo |

Las rutas protegidas requieren el header `Authorization: Bearer <token>` obtenido en `/auth/token`.
