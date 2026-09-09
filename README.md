# FiadoApp

Aplicación React + TypeScript para gestionar clientes, fiados, pagos, productos y usuarios de una tienda de barrio.

## Desarrollo

```bash
npm install
npm run dev
```

Comandos de calidad:

```bash
npm run lint
npm run build
```

## Estructura

- `src/domain/types.ts`: contrato de datos del sistema y nombres de vistas/roles.
- `src/domain/credit.ts`: cálculo de saldos y estados de deuda. Es la única fuente para estas reglas.
- `src/data/initialData.ts`: registros iniciales usados por la demo.
- `src/lib/formatters.ts`: IDs, fechas y moneda para presentación.
- `src/components/ui`: controles visuales reutilizables (`Btn`, `Card`, campos y estados).
- `src/components/icons`: iconos SVG usados por la interfaz.
- `src/app/useAppState.ts`: estado compartido, colecciones en memoria y navegación.
- `src/layout/AppShell.tsx`: sidebar, navegación móvil, usuario actual y logout.
- `src/features`: una carpeta por flujo funcional.
- `src/App.tsx`: composición de vistas y conexión de callbacks; no debe contener JSX de pantallas.

## Mapa de funcionalidades

| Necesidad | Archivo principal |
| --- | --- |
| Inicio y métricas | `src/features/dashboard/Dashboard.tsx` |
| Listar y crear clientes | `src/features/clientes/ClientesList.tsx` |
| Ver deudas y pagos de un cliente | `src/features/clientes/ClienteDetalle.tsx` |
| Crear una deuda | `src/features/deudas/NuevaDeuda.tsx` |
| Registrar y distribuir un pago | `src/features/pagos/RegistrarPago.tsx` |
| Crear, editar y eliminar productos | `src/features/productos/ProductosCatalogo.tsx` |
| Iniciar sesión | `src/features/auth/LoginView.tsx` |
| Gestionar usuarios | `src/features/usuarios/UsuariosAdmin.tsx` |

## Cómo seguir un flujo

1. La pantalla solicita datos y ejecuta un callback recibido por props.
2. `App.tsx` conecta ese callback con los setters de `useAppState`.
3. `useAppState` actualiza la colección y navega a la siguiente vista.
4. Las pantallas financieras calculan saldos mediante `src/domain/credit.ts`.

Para añadir una funcionalidad, crea o modifica la feature correspondiente, agrega tipos en `domain/types.ts` si son necesarios y conecta la mutación en `App.tsx`. Evita poner reglas financieras o JSX de pantallas dentro de `App.tsx`.

Actualmente los datos viven en memoria y se reinician al recargar la aplicación. La persistencia y el backend quedan para la siguiente etapa.
