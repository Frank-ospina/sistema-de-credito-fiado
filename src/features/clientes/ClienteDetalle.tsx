import { useMemo, useState } from 'react'
import type { Cliente, Deuda, Pago, ViewName } from '../../domain/types'
import { getEstado, getSaldo } from '../../domain/credit'
import { fmt, fmtDate } from '../../lib/formatters'
import { IcoBack, IcoDollar, IcoPlus } from '../../components/icons'
import { Btn, Card, EstadoBadge } from '../../components/ui'

type ClienteDetalleProps = {
  clienteId: string
  clientes: Cliente[]
  deudas: Deuda[]
  pagos: Pago[]
  onNavigate: (view: ViewName, clienteId?: string) => void
  onBack: () => void
}

/** Detalle financiero de un cliente con pestañas de deudas y pagos. */
export function ClienteDetalle({ clienteId, clientes, deudas, pagos, onNavigate, onBack }: ClienteDetalleProps) {
  const [tab, setTab] = useState<'deudas' | 'pagos'>('deudas')
  const cliente = clientes.find(item => item.id === clienteId)
  const clienteDeudas = useMemo(() => [...deudas.filter(deuda => deuda.cliente_id === clienteId)].sort((a, b) => b.fecha_fiado.localeCompare(a.fecha_fiado)), [deudas, clienteId])
  const clientePagos = useMemo(() => [...pagos.filter(pago => pago.cliente_id === clienteId)].sort((a, b) => b.fecha_pago.localeCompare(a.fecha_pago)), [pagos, clienteId])
  const totalDeuda = useMemo(() => clienteDeudas.reduce((sum, deuda) => sum + getSaldo(deuda, pagos), 0), [clienteDeudas, pagos])

  if (!cliente) return <div className="p-6 text-[#7d8590]">Cliente no encontrado.</div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start gap-3 mb-6">
        <button onClick={onBack} className="mt-1 text-[#7d8590] hover:text-[#e6edf3] transition-colors cursor-pointer shrink-0"><IcoBack /></button>
        <div className="flex-1 min-w-0"><h1 className="text-xl font-semibold text-[#e6edf3]">{cliente.nombre}</h1><div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1"><span className="text-xs font-mono text-[#7d8590]">{cliente.telefono}</span>{cliente.direccion && <span className="text-xs text-[#7d8590]">{cliente.direccion}</span>}</div></div>
        <div className="text-right shrink-0"><div className="text-[10px] text-[#7d8590] uppercase tracking-widest mb-0.5">Saldo total</div><div className={`text-2xl font-mono font-semibold ${totalDeuda > 0 ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>{totalDeuda > 0 ? fmt(totalDeuda) : 'Al día'}</div></div>
      </div>
      <div className="flex gap-2 mb-6"><Btn onClick={() => onNavigate('nueva-deuda', clienteId)}><IcoPlus />Nueva deuda</Btn><Btn variant="secondary" onClick={() => onNavigate('registrar-pago', clienteId)}><IcoDollar />Registrar pago</Btn></div>
      <div className="flex gap-0 mb-4 border-b border-[#30363d]">{(['deudas', 'pagos'] as const).map(value => <button key={value} onClick={() => setTab(value)} className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors cursor-pointer ${tab === value ? 'border-[#58a6ff] text-[#e6edf3]' : 'border-transparent text-[#7d8590] hover:text-[#e6edf3]'}`}>{value === 'deudas' ? `Deudas (${clienteDeudas.length})` : `Pagos (${clientePagos.length})`}</button>)}</div>
      {tab === 'deudas' && <div className="space-y-3">{clienteDeudas.length === 0 && <div className="text-sm text-[#484f58] text-center py-10">Sin deudas registradas para este cliente.</div>}{clienteDeudas.map(deuda => { const saldo = getSaldo(deuda, pagos); const estado = getEstado(saldo, deuda.monto_total); return <Card key={deuda.id} className="overflow-hidden"><div className="px-4 py-3 flex items-center justify-between border-b border-[#21262d]"><div className="flex items-center gap-2.5"><EstadoBadge estado={estado} /><span className="text-xs text-[#7d8590]">{fmtDate(deuda.fecha_fiado)}</span></div><div className="text-right"><div className="text-sm font-mono font-semibold text-[#e6edf3]">{fmt(saldo)}</div>{estado !== 'pendiente' && <div className="text-xs text-[#7d8590]">de {fmt(deuda.monto_total)}</div>}</div></div><div className="divide-y divide-[#21262d]">{deuda.items.map((item, index) => <div key={index} className="px-4 py-2.5 flex items-center justify-between"><div><span className="text-sm text-[#e6edf3]">{item.nombre_producto}</span><span className="text-xs text-[#7d8590] ml-2">× {item.cantidad} · {fmt(item.precio_unitario)}</span></div><span className="text-sm font-mono text-[#e6edf3]">{fmt(item.subtotal)}</span></div>)}</div>{deuda.notas && <div className="px-4 pb-3 pt-1 text-xs text-[#7d8590] italic border-t border-[#21262d]">{deuda.notas}</div>}</Card> })}</div>}
      {tab === 'pagos' && <div className="space-y-3">{clientePagos.length === 0 && <div className="text-sm text-[#484f58] text-center py-10">Sin pagos registrados para este cliente.</div>}{clientePagos.map(pago => <Card key={pago.id} className="overflow-hidden"><div className="px-4 py-3 flex items-center justify-between border-b border-[#21262d]"><div className="flex items-center gap-2.5"><span className="text-sm font-mono font-semibold text-[#3fb950]">{fmt(pago.monto)}</span><span className="px-2 py-0.5 rounded-full text-xs bg-[#21262d] text-[#7d8590] capitalize">{pago.metodo}</span></div><span className="text-xs text-[#7d8590]">{fmtDate(pago.fecha_pago)}</span></div><div className="divide-y divide-[#21262d]">{pago.aplicaciones.map((aplicacion, index) => { const deuda = deudas.find(item => item.id === aplicacion.deuda_id); return <div key={index} className="px-4 py-2.5 flex items-center justify-between"><span className="text-xs text-[#7d8590]">Deuda del {deuda ? fmtDate(deuda.fecha_fiado) : aplicacion.deuda_id}</span><span className="text-sm font-mono text-[#e6edf3]">{fmt(aplicacion.monto_aplicado)}</span></div> })}</div>{pago.notas && <div className="px-4 pb-3 pt-1 text-xs text-[#7d8590] italic border-t border-[#21262d]">{pago.notas}</div>}</Card>)}</div>}
    </div>
  )
}
