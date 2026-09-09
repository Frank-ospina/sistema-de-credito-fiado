import { useMemo } from 'react'
import { getEstado, getSaldo } from '../../domain/credit'
import type { Cliente, Deuda, Pago, ViewName } from '../../domain/types'
import { fmt, fmtDate, todayStr } from '../../lib/formatters'
import { IcoChevRight } from '../../components/icons'
import { Btn, Card, EstadoBadge } from '../../components/ui'

type DashboardProps = {
  clientes: Cliente[]
  deudas: Deuda[]
  pagos: Pago[]
  onNavigate: (view: ViewName, clienteId?: string) => void
}

/** Resumen de cobros, clientes con deuda y fiados recientes. */
export function Dashboard({ clientes, deudas, pagos, onNavigate }: DashboardProps) {
  const totalPorCobrar = useMemo(() => deudas.reduce((sum, deuda) => sum + getSaldo(deuda, pagos), 0), [deudas, pagos])
  const clientesConDeuda = useMemo(
    () => clientes.filter(cliente => deudas.filter(deuda => deuda.cliente_id === cliente.id).some(deuda => getSaldo(deuda, pagos) > 0)).length,
    [clientes, deudas, pagos],
  )
  const deudasActivas = useMemo(() => deudas.filter(deuda => getSaldo(deuda, pagos) > 0).length, [deudas, pagos])
  const mes = new Date().toISOString().slice(0, 7)
  const pagosMes = useMemo(
    () => pagos.filter(pago => pago.fecha_pago.startsWith(mes)).reduce((sum, pago) => sum + pago.monto, 0),
    [pagos, mes],
  )
  const recientes = useMemo(
    () => [...deudas].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6),
    [deudas],
  )

  const stats = [
    { label: 'Total por cobrar', value: fmt(totalPorCobrar), color: '#f85149' },
    { label: 'Clientes con deuda', value: String(clientesConDeuda), color: '#d29922' },
    { label: 'Deudas activas', value: String(deudasActivas), color: '#58a6ff' },
    { label: 'Cobrado este mes', value: fmt(pagosMes), color: '#3fb950' },
  ]

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-[#e6edf3]">Inicio</h1>
        <p className="text-sm text-[#7d8590] mt-0.5">{fmtDate(todayStr())}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="text-[11px] text-[#7d8590] mb-2 leading-tight">{stat.label}</div>
            <div className="text-xl font-semibold font-mono" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#e6edf3]">Fiados recientes</span>
          <Btn variant="ghost" size="sm" onClick={() => onNavigate('clientes')}>Ver clientes</Btn>
        </div>
        <div className="divide-y divide-[#21262d]">
          {recientes.length === 0 && <div className="px-4 py-6 text-sm text-[#484f58] text-center">Sin registros aún</div>}
          {recientes.map(deuda => {
            const cliente = clientes.find(item => item.id === deuda.cliente_id)
            const saldo = getSaldo(deuda, pagos)
            const estado = getEstado(saldo, deuda.monto_total)
            return (
              <div key={deuda.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[#21262d]/40 cursor-pointer transition-colors" onClick={() => onNavigate('cliente-detalle', deuda.cliente_id)}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#e6edf3] truncate">{cliente?.nombre ?? '—'}</div>
                  <div className="text-xs text-[#7d8590] mt-0.5">{fmtDate(deuda.fecha_fiado)} · {deuda.items.length} {deuda.items.length === 1 ? 'producto' : 'productos'}</div>
                </div>
                <EstadoBadge estado={estado} />
                <div className="text-sm font-mono font-semibold text-[#e6edf3] shrink-0">{fmt(saldo)}</div>
                <div className="text-[#484f58] shrink-0"><IcoChevRight /></div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
