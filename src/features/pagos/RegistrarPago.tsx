import { useEffect, useMemo, useState } from 'react'
import { ApiError, createPago, createPagoAplicacion, deletePago, listClientes, listDeudas } from '../../lib/api'
import type { ClienteApi, DeudaApi } from '../../lib/api'
import { fmt, fmtDate, todayStr } from '../../lib/formatters'
import { IcoBack } from '../../components/icons'
import { Btn, Card, FieldInput, FieldSelect } from '../../components/ui'

type RegistrarPagoProps = { preselectedClienteId?: string | null; onSaved: (clienteId: string) => void; onCancel: () => void }

/** Registra un pago y lo distribuye entre las deudas pendientes del cliente. */
export function RegistrarPago({ preselectedClienteId, onSaved, onCancel }: RegistrarPagoProps) {
  const [clientes, setClientes] = useState<ClienteApi[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [clienteId, setClienteId] = useState(preselectedClienteId ?? '')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(todayStr())
  const [metodo, setMetodo] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [distrib, setDistrib] = useState<Record<string, string>>({})
  const [deudasActivas, setDeudasActivas] = useState<DeudaApi[]>([])

  useEffect(() => {
    let cancelled = false
    listClientes()
      .then(data => { if (!cancelled) setClientes(data) })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista de clientes.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const montoNum = parseFloat(monto) || 0
  const totalDistrib = Object.values(distrib).reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
  const restante = montoNum - totalDistrib
  const errors: string[] = useMemo(() => {
    const list: string[] = []
    deudasActivas.forEach(deuda => { if ((parseFloat(distrib[deuda.id] || '0') || 0) > deuda.saldo) list.push(`Monto aplicado a deuda del ${fmtDate(deuda.fecha_fiado.slice(0, 10))} supera el saldo.`) })
    if (totalDistrib > montoNum) list.push('La suma distribuida supera el monto del pago.')
    return list
  }, [deudasActivas, distrib, totalDistrib, montoNum])
  const hasDistrib = Object.values(distrib).some(value => parseFloat(value) > 0)
  const canSubmit = !!clienteId && montoNum > 0 && hasDistrib && errors.length === 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError('')
    const aplicaciones = Object.entries(distrib).filter(([, value]) => parseFloat(value) > 0).map(([deudaId, value]) => ({ deudaId, monto: parseFloat(value) }))
    let pagoId: string | null = null
    try {
      const pago = await createPago({ cliente_id: clienteId, monto_pagado: montoNum, metodo_pago: metodo, fecha_pago: fecha })
      pagoId = pago.id
      for (const aplicacion of aplicaciones) {
        await createPagoAplicacion({ pago_id: pago.id, deuda_id: aplicacion.deudaId, monto_aplicado: aplicacion.monto })
      }
      onSaved(clienteId)
    } catch (err) {
      if (pagoId) await deletePago(pagoId).catch(() => {})
      setSubmitError(err instanceof ApiError ? err.message : 'No se pudo registrar el pago.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6 text-sm text-[#7d8590]">Cargando…</div>
  if (loadError) return <div className="p-6 text-sm text-[#f85149]">⚠ {loadError}</div>

  return <div className="p-6 max-w-2xl"><div className="flex items-center gap-3 mb-6"><button onClick={onCancel} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors cursor-pointer"><IcoBack /></button><h1 className="text-xl font-semibold text-[#e6edf3]">Registrar pago</h1></div><div className="space-y-5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FieldSelect label="Cliente" value={clienteId} onChange={event => { setClienteId(event.target.value); setDistrib({}); setDeudasActivas([]) }}><option value="">Seleccionar cliente…</option>{clientes.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}</FieldSelect><FieldInput label="Fecha del pago" type="date" value={fecha} onChange={event => setFecha(event.target.value)} /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FieldInput label="Monto recibido (COP)" type="number" min="0" step="500" value={monto} onChange={event => setMonto(event.target.value)} placeholder="Ej: 15000" /><FieldSelect label="Método" value={metodo} onChange={event => setMetodo(event.target.value as 'efectivo' | 'transferencia')}><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option></FieldSelect></div>
    {clienteId && <div><div className="flex items-center justify-between mb-2"><label className="text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Distribuir a deudas</label>{montoNum > 0 && <span className={`text-xs font-mono font-semibold ${restante < 0 ? 'text-[#f85149]' : restante === 0 ? 'text-[#3fb950]' : 'text-[#d29922]'}`}>Restante: {fmt(restante)}</span>}</div>
      <DeudasPendientesDelCliente key={clienteId} clienteId={clienteId} distrib={distrib} onDistribChange={setDistrib} montoNum={montoNum} onDeudasLoaded={setDeudasActivas} />
      {errors.length > 0 && <div className="mt-2 space-y-1">{errors.map((error, index) => <p key={index} className="text-xs text-[#f85149]">⚠ {error}</p>)}</div>}</div>}
    {submitError && <p className="text-xs text-[#f85149]">⚠ {submitError}</p>}
    <div className="flex gap-2 pt-1"><Btn onClick={handleSubmit} disabled={!canSubmit}>{submitting ? 'Guardando…' : 'Registrar pago'}</Btn><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn></div>
  </div></div>
}

type DeudasPendientesDelClienteProps = {
  clienteId: string
  distrib: Record<string, string>
  onDistribChange: (updater: (previous: Record<string, string>) => Record<string, string>) => void
  montoNum: number
  onDeudasLoaded: (deudas: DeudaApi[]) => void
}

/** Carga las deudas pendientes de un cliente; se remonta (vía `key`) cada vez que cambia el cliente. */
function DeudasPendientesDelCliente({ clienteId, distrib, onDistribChange, montoNum, onDeudasLoaded }: DeudasPendientesDelClienteProps) {
  const [deudas, setDeudas] = useState<DeudaApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listDeudas(clienteId)
      .then(data => {
        if (cancelled) return
        const activas = data.filter(deuda => deuda.saldo > 0).sort((a, b) => a.fecha_fiado.localeCompare(b.fecha_fiado))
        setDeudas(activas)
        onDeudasLoaded(activas)
      })
      .catch(err => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las deudas del cliente.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDeudasLoaded se pasa nueva en cada render del padre; solo debe refetch al cambiar clienteId (por eso el componente además se remonta por key)
  }, [clienteId])

  if (loading) return <Card className="p-4 text-sm text-[#7d8590] text-center">Cargando deudas…</Card>
  if (error) return <Card className="p-4 text-sm text-[#f85149] text-center">⚠ {error}</Card>
  if (deudas.length === 0) return <Card className="p-4 text-sm text-[#484f58] text-center">Este cliente no tiene deudas pendientes.</Card>

  const totalDistrib = Object.values(distrib).reduce((sum, value) => sum + (parseFloat(value) || 0), 0)

  return <Card className="overflow-hidden divide-y divide-[#21262d]">
    {deudas.map(deuda => <div key={deuda.id} className="p-3 flex items-center gap-3"><div className="flex-1 min-w-0"><div className="text-sm text-[#e6edf3]">{fmtDate(deuda.fecha_fiado.slice(0, 10))}</div></div><div className="shrink-0 text-right mr-2"><div className="text-[10px] text-[#7d8590]">Saldo</div><div className="text-sm font-mono font-semibold text-[#f85149]">{fmt(deuda.saldo)}</div></div><div className="w-28 shrink-0"><input type="number" min="0" max={deuda.saldo} step="500" placeholder="0" value={distrib[deuda.id] ?? ''} onChange={event => onDistribChange(previous => ({ ...previous, [deuda.id]: event.target.value }))} className="w-full px-2 py-1.5 bg-[#21262d] border border-[#30363d] rounded text-sm font-mono text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] text-right" /></div></div>)}
    {montoNum > 0 && <div className="px-3 py-2.5 flex justify-between bg-[#0d1117]"><span className="text-xs text-[#7d8590]">Total distribuido</span><span className="text-sm font-mono font-semibold text-[#e6edf3]">{fmt(totalDistrib)} <span className="text-[#7d8590] font-normal">de {fmt(montoNum)}</span></span></div>}
  </Card>
}
