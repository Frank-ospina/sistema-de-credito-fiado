/** Genera un identificador corto para los registros locales de la demo. */
export const uid = () => Math.random().toString(36).slice(2, 9)

/** Devuelve la fecha actual en formato ISO corto: YYYY-MM-DD. */
export const todayStr = () => new Date().toISOString().slice(0, 10)

/** Formatea un importe como moneda colombiana sin decimales. */
export const fmt = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

/** Formatea una fecha ISO para mostrarla en español colombiano. */
export const fmtDate = (date: string) =>
  new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
