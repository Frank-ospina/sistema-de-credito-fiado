import { useEffect, useState } from 'react'
import type { ViewName } from '../../domain/types'
import { ApiError, getHistorialCliente, listProductos } from '../../lib/api'
import type { HistorialCliente, ProductoApi } from '../../lib/api'
import { fmt, fmtDate } from '../../lib/formatters'
import { IcoBack, IcoDollar, IcoPlus } from '../../components/icons'
import { Btn, Card, EstadoBadge } from '../../components/ui'

type ClienteDetalleProps = {
  clienteId: string
  onNavigate: (view: ViewName, clienteId?: string) => void
  onBack: () => void
}

/** Detalle financiero de un cliente con pestañas de deudas y pagos, cargado desde el historial del backend. */
export function ClienteDetalle({ clienteId, onNavigate, onBack }: ClienteDetalleProps) {
  const [tab, setTab] = useState<'deudas' | 'pagos'>('deudas')
  const [historial, setHistorial] = useState<HistorialCliente | null>(null)
  const [productos, setProductos] = useState<ProductoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getHistorialCliente(clienteId), listProductos()])
      .then(([historialData, productosData]) => {
        if (cancelled) return
        setHistorial(historialData)
        setProductos(productosData)
      })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar el cliente.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [clienteId])

  const nombreProducto = (productoId: string) => productos.find(producto => producto.id === productoId)?.nombre ?? `Producto #${productoId}`

  if (loading) return <div className="p-6 text-sm text-[var(--text-secondary)]">Cargando cliente…</div>
  if (loadError) return <div className="p-6 text-sm text-[var(--accent-red)]">⚠ {loadError}</div>
  if (!historial) return <div className="p-6 text-[var(--text-secondary)]">Cliente no encontrado.</div>

  const { cliente, deudas, pagos, saldo_total: totalDeuda } = historial

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start gap-3 mb-6">
        <button onClick={onBack} className="mt-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"><IcoBack /></button>
        <div className="flex-1 min-w-0"><h1 className="text-xl font-semibold text-[var(--text-primary)]">{cliente.nombre}</h1><div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1"><span className="text-xs font-mono text-[var(--text-secondary)]">{cliente.telefono}</span>{cliente.direccion && <span className="text-xs text-[var(--text-secondary)]">{cliente.direccion}</span>}</div></div>
        <div className="text-right shrink-0"><div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-0.5">Saldo total</div><div className={`text-2xl font-mono font-semibold ${totalDeuda > 0 ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green-light)]'}`}>{totalDeuda > 0 ? fmt(totalDeuda) : 'Al día'}</div></div>
      </div>
      <div className="flex gap-2 mb-6"><Btn onClick={() => onNavigate('nueva-deuda', clienteId)}><IcoPlus />Nueva deuda</Btn><Btn variant="secondary" onClick={() => onNavigate('registrar-pago', clienteId)}><IcoDollar />Registrar pago</Btn></div>
      <div className="flex gap-0 mb-4 border-b border-[var(--border)]">{(['deudas', 'pagos'] as const).map(value => <button key={value} onClick={() => setTab(value)} className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors cursor-pointer ${tab === value ? 'border-[var(--accent-blue)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{value === 'deudas' ? `Deudas (${deudas.length})` : `Pagos (${pagos.length})`}</button>)}</div>
      {tab === 'deudas' && <div className="space-y-3">{deudas.length === 0 && <div className="text-sm text-[var(--text-muted)] text-center py-10">Sin deudas registradas para este cliente.</div>}{deudas.map(deuda => <Card key={deuda.id} className="overflow-hidden"><div className="px-4 py-3 flex items-center justify-between border-b border-[var(--bg-elevated)]"><div className="flex items-center gap-2.5"><EstadoBadge estado={deuda.estado} /><span className="text-xs text-[var(--text-secondary)]">{fmtDate(deuda.fecha_fiado.slice(0, 10))}</span></div><div className="text-right"><div className="text-sm font-mono font-semibold text-[var(--text-primary)]">{fmt(deuda.saldo)}</div>{deuda.estado !== 'pendiente' && <div className="text-xs text-[var(--text-secondary)]">de {fmt(deuda.monto_total)}</div>}</div></div><div className="divide-y divide-[var(--bg-elevated)]">{deuda.detalles.map(detalle => <div key={detalle.id} className="px-4 py-2.5 flex items-center justify-between"><div><span className="text-sm text-[var(--text-primary)]">{nombreProducto(detalle.producto_id)}</span><span className="text-xs text-[var(--text-secondary)] ml-2">× {detalle.cantidad} · {fmt(detalle.precio_unitario_venta)}</span></div><span className="text-sm font-mono text-[var(--text-primary)]">{fmt(detalle.precio_unitario_venta * detalle.cantidad)}</span></div>)}</div></Card>)}</div>}
      {tab === 'pagos' && <div className="space-y-3">{pagos.length === 0 && <div className="text-sm text-[var(--text-muted)] text-center py-10">Sin pagos registrados para este cliente.</div>}{pagos.map(pago => <Card key={pago.id} className="overflow-hidden"><div className="px-4 py-3 flex items-center justify-between border-b border-[var(--bg-elevated)]"><div className="flex items-center gap-2.5"><span className="text-sm font-mono font-semibold text-[var(--accent-green-light)]">{fmt(pago.monto_pagado)}</span><span className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-elevated)] text-[var(--text-secondary)] capitalize">{pago.metodo_pago}</span></div><span className="text-xs text-[var(--text-secondary)]">{fmtDate(pago.fecha_pago.slice(0, 10))}</span></div><div className="divide-y divide-[var(--bg-elevated)]">{pago.aplicaciones.map(aplicacion => { const deuda = deudas.find(item => item.id === aplicacion.deuda_id); return <div key={aplicacion.id} className="px-4 py-2.5 flex items-center justify-between"><span className="text-xs text-[var(--text-secondary)]">Deuda del {deuda ? fmtDate(deuda.fecha_fiado.slice(0, 10)) : aplicacion.deuda_id}</span><span className="text-sm font-mono text-[var(--text-primary)]">{fmt(aplicacion.monto_aplicado)}</span></div> })}</div></Card>)}</div>}
    </div>
  )
}
