import { useEffect, useState } from 'react'
import { ApiError, createDeuda, createVentaDetalle, deleteDeuda, listClientes, listProductos } from '../../lib/api'
import type { ClienteApi, ProductoApi } from '../../lib/api'
import { fmt, todayStr } from '../../lib/formatters'
import { IcoBack, IcoPlus, IcoTrash } from '../../components/icons'
import { Btn, Card, FieldInput, FieldSelect } from '../../components/ui'

type NuevaDeudaProps = { preselectedClienteId?: string | null; onSaved: (clienteId: string) => void; onCancel: () => void }

/** Construye una deuda a partir de un cliente y sus líneas de productos. */
export function NuevaDeuda({ preselectedClienteId, onSaved, onCancel }: NuevaDeudaProps) {
  const [clientes, setClientes] = useState<ClienteApi[]>([])
  const [productos, setProductos] = useState<ProductoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [clienteId, setClienteId] = useState(preselectedClienteId ?? '')
  const [fecha, setFecha] = useState(todayStr())
  const [items, setItems] = useState<{ productoId: string; cantidad: number }[]>([{ productoId: '', cantidad: 1 }])

  useEffect(() => {
    let cancelled = false
    Promise.all([listClientes(), listProductos()])
      .then(([clientesData, productosData]) => { if (!cancelled) { setClientes(clientesData); setProductos(productosData) } })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar clientes/productos.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const itemsRich = items.map(item => {
    const producto = productos.find(value => value.id === item.productoId)
    return { ...item, producto, subtotal: producto ? producto.precio_actual * item.cantidad : 0 }
  })
  const total = itemsRich.reduce((sum, item) => sum + item.subtotal, 0)
  const canSubmit = !!clienteId && !!fecha && items.every(item => !!item.productoId && item.cantidad > 0) && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError('')
    let deudaId: string | null = null
    try {
      const deuda = await createDeuda({ cliente_id: clienteId, fecha_fiado: fecha })
      deudaId = deuda.id
      for (const item of itemsRich) {
        await createVentaDetalle({
          deuda_id: deuda.id,
          producto_id: item.productoId,
          cantidad: item.cantidad,
          precio_unitario_venta: item.producto!.precio_actual,
        })
      }
      onSaved(clienteId)
    } catch (err) {
      if (deudaId) await deleteDeuda(deudaId).catch(() => {})
      setSubmitError(err instanceof ApiError ? err.message : 'No se pudo registrar la deuda.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6 text-sm text-[#7d8590]">Cargando…</div>
  if (loadError) return <div className="p-6 text-sm text-[#f85149]">⚠ {loadError}</div>

  return <div className="p-6 max-w-2xl"><div className="flex items-center gap-3 mb-6"><button onClick={onCancel} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors cursor-pointer"><IcoBack /></button><h1 className="text-xl font-semibold text-[#e6edf3]">Nueva deuda (fiado)</h1></div><div className="space-y-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FieldSelect label="Cliente" value={clienteId} onChange={event => setClienteId(event.target.value)}><option value="">Seleccionar cliente…</option>{clientes.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}</FieldSelect><FieldInput label="Fecha del fiado" type="date" value={fecha} onChange={event => setFecha(event.target.value)} /></div>
    <div><div className="flex items-center justify-between mb-2"><label className="text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Productos</label><Btn variant="ghost" size="sm" onClick={() => setItems(previous => [...previous, { productoId: '', cantidad: 1 }])}><IcoPlus />Agregar línea</Btn></div><Card className="overflow-hidden"><div className="grid grid-cols-[1fr_72px_100px_32px] border-b border-[#30363d] bg-[#161b22]">{['Producto', 'Cant.', 'Subtotal', ''].map(header => <div key={header} className="px-3 py-2 text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">{header}</div>)}</div>{itemsRich.map((item, index) => <div key={index} className="grid grid-cols-[1fr_72px_100px_32px] border-t border-[#21262d]"><select className="px-3 py-2.5 bg-transparent text-sm text-[#e6edf3] focus:outline-none border-r border-[#21262d]" value={item.productoId} onChange={event => setItems(previous => previous.map((value, itemIndex) => itemIndex === index ? { ...value, productoId: event.target.value } : value))}><option value="">Seleccionar…</option>{productos.map(producto => <option key={producto.id} value={producto.id}>{producto.nombre} — {fmt(producto.precio_actual)}</option>)}</select><input type="number" min="1" className="px-3 py-2.5 bg-transparent text-sm text-[#e6edf3] font-mono focus:outline-none text-center border-r border-[#21262d]" value={item.cantidad} onChange={event => setItems(previous => previous.map((value, itemIndex) => itemIndex === index ? { ...value, cantidad: Math.max(1, parseInt(event.target.value) || 1) } : value))} /><div className="px-3 flex items-center border-r border-[#21262d]"><span className="text-sm font-mono text-[#e6edf3]">{fmt(item.subtotal)}</span></div><div className="flex items-center justify-center">{items.length > 1 && <button onClick={() => setItems(previous => previous.filter((_, itemIndex) => itemIndex !== index))} className="text-[#484f58] hover:text-[#f85149] cursor-pointer transition-colors p-1"><IcoTrash /></button>}</div></div>)}<div className="flex items-center justify-end gap-3 px-3 py-2.5 border-t border-[#30363d] bg-[#0d1117]"><span className="text-xs text-[#7d8590]">Total a fiar</span><span className="text-base font-mono font-semibold text-[#e6edf3]">{fmt(total)}</span></div></Card></div>
    {submitError && <p className="text-xs text-[#f85149]">⚠ {submitError}</p>}
    <div className="flex gap-2 pt-1"><Btn onClick={handleSubmit} disabled={!canSubmit}>{submitting ? 'Guardando…' : 'Registrar deuda'}</Btn><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn></div>
  </div></div>
}
