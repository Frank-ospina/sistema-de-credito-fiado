/** Estados calculados de una deuda según el saldo pendiente. */
export type EstadoDeuda = 'pendiente' | 'parcial' | 'pagada'

/** Vistas disponibles en la navegación autenticada. */
export type ViewName = 'dashboard' | 'clientes' | 'cliente-detalle' | 'nueva-deuda' | 'registrar-pago' | 'productos' | 'usuarios'

/** Roles que determinan el acceso a la administración de usuarios. */
export type RolUsuario = 'admin' | 'vendedor'

/** Usuario que puede iniciar sesión en la aplicación. */
export interface Usuario {
  id: string
  nombre: string
  username: string
  password: string
  rol: RolUsuario
  activo: boolean
  created_at: string
}

/** Persona a la que se le pueden registrar deudas y pagos. */
export interface Cliente {
  id: string
  nombre: string
  telefono: string
  direccion?: string
  created_at: string
}

/** Producto disponible para registrar una nueva deuda. */
export interface Producto {
  id: string
  nombre: string
  precio_unitario: number
  created_at: string
}

/** Línea de producto incluida dentro de una deuda. */
export interface ItemDeuda {
  producto_id: string
  nombre_producto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

/** Venta fiada asociada a un cliente. */
export interface Deuda {
  id: string
  cliente_id: string
  fecha_fiado: string
  items: ItemDeuda[]
  monto_total: number
  notas?: string
  created_at: string
}

/** Parte de un pago asignada a una deuda concreta. */
export interface AplicacionPago {
  deuda_id: string
  monto_aplicado: number
}

/** Pago recibido y su distribución entre las deudas del cliente. */
export interface Pago {
  id: string
  cliente_id: string
  monto: number
  fecha_pago: string
  metodo: 'efectivo' | 'transferencia'
  notas?: string
  aplicaciones: AplicacionPago[]
  created_at: string
}
