import { useEffect, useMemo, useState } from 'react'
import type { ViewName } from '../../domain/types'
import { ApiError, listClientes, listDeudas, listPagos } from '../../lib/api'
import type { ClienteApi, DeudaApi, PagoApi } from '../../lib/api'
import { fmt, fmtDate, todayStr } from '../../lib/formatters'
import { IcoChevRight } from '../../components/icons'
import { Btn, Card, EstadoBadge } from '../../components/ui'

type DashboardProps = { onNavigate: (view: ViewName, clienteId?: string) => void }

/** Resumen de cobros, clientes con deuda y fiados recientes, cargado desde el backend. */
export function Dashboard({ onNavigate }: DashboardProps) {
  const [clientes, setClientes] = useState<ClienteApi[]>([])
  const [deudas, setDeudas] = useState<DeudaApi[]>([])
  const [pagos, setPagos] = useState<PagoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([listClientes(), listDeudas(), listPagos()])
      .then(([clientesData, deudasData, pagosData]) => {
        if (cancelled) return
        setClientes(clientesData)
        setDeudas(deudasData)
        setPagos(pagosData)
      })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar el resumen.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const totalPorCobrar = useMemo(() => deudas.reduce((sum, deuda) => sum + deuda.saldo, 0), [deudas])
  const clientesConDeuda = useMemo(
    () => clientes.filter(cliente => deudas.some(deuda => deuda.cliente_id === cliente.id && deuda.saldo > 0)).length,
    [clientes, deudas],
  )
  const deudasActivas = useMemo(() => deudas.filter(deuda => deuda.saldo > 0).length, [deudas])
  const mes = new Date().toISOString().slice(0, 7)
  const pagosMes = useMemo(
    () => pagos.filter(pago => pago.fecha_pago.startsWith(mes)).reduce((sum, pago) => sum + pago.monto_pagado, 0),
    [pagos, mes],
  )
  const recientes = useMemo(() => [...deudas].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6), [deudas])

  const stats = [
    { label: 'Total por cobrar', value: fmt(totalPorCobrar), color: 'var(--accent-red)' },
    { label: 'Clientes con deuda', value: String(clientesConDeuda), color: 'var(--accent-yellow)' },
    { label: 'Deudas activas', value: String(deudasActivas), color: 'var(--accent-blue)' },
    { label: 'Cobrado este mes', value: fmt(pagosMes), color: 'var(--accent-green-light)' },
  ]

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Inicio</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{fmtDate(todayStr())}</p>
      </div>

      {loadError && <div className="mb-4 px-3 py-2.5 bg-[var(--bg-red-subtle)] border border-[rgb(var(--accent-red-rgb)/30%)] rounded-md text-xs text-[var(--accent-red)]">{loadError}</div>}

      {loading ? <div className="text-sm text-[var(--text-secondary)]">Cargando…</div> : <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {stats.map(stat => (
            <div key={stat.label} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4">
              <div className="text-[11px] text-[var(--text-secondary)] mb-2 leading-tight">{stat.label}</div>
              <div className="text-xl font-semibold font-mono" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <Card>
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Fiados recientes</span>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('clientes')}>Ver clientes</Btn>
          </div>
          <div className="divide-y divide-[var(--bg-elevated)]">
            {recientes.length === 0 && <div className="px-4 py-6 text-sm text-[var(--text-muted)] text-center">Sin registros aún</div>}
            {recientes.map(deuda => {
              const cliente = clientes.find(item => item.id === deuda.cliente_id)
              return (
                <div key={deuda.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[rgb(var(--bg-elevated-rgb)/40%)] cursor-pointer transition-colors" onClick={() => onNavigate('cliente-detalle', deuda.cliente_id)}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">{cliente?.nombre ?? '—'}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{fmtDate(deuda.fecha_fiado.slice(0, 10))}</div>
                  </div>
                  <EstadoBadge estado={deuda.estado} />
                  <div className="text-sm font-mono font-semibold text-[var(--text-primary)] shrink-0">{fmt(deuda.saldo)}</div>
                  <div className="text-[var(--text-muted)] shrink-0"><IcoChevRight /></div>
                </div>
              )
            })}
          </div>
        </Card>
      </>}
    </div>
  )
}
