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
