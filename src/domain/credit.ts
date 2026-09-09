import type { Deuda, EstadoDeuda, Pago } from './types'

/**
 * Calcula el saldo sin modificar la deuda ni los pagos originales.
 * Todas las pantallas financieras deben usar esta función para mantener
 * consistente el saldo mostrado.
 */
export const getSaldo = (deuda: Deuda, pagos: Pago[]): number =>
  Math.max(
    0,
    deuda.monto_total -
      pagos
        .flatMap(pago => pago.aplicaciones)
        .filter(aplicacion => aplicacion.deuda_id === deuda.id)
        .reduce((saldo, aplicacion) => saldo + aplicacion.monto_aplicado, 0),
  )

/** Obtiene el estado visual de una deuda a partir de su saldo y total. */
export const getEstado = (saldo: number, total: number): EstadoDeuda =>
  saldo <= 0 ? 'pagada' : saldo < total ? 'parcial' : 'pendiente'
