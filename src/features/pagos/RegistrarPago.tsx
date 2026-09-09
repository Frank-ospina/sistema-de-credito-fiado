import { useMemo, useState } from 'react'
import type { AplicacionPago, Cliente, Deuda, Pago } from '../../domain/types'
import { getSaldo } from '../../domain/credit'
import { fmt, fmtDate, todayStr, uid } from '../../lib/formatters'
import { IcoBack } from '../../components/icons'
import { Btn, Card, FieldInput, FieldSelect } from '../../components/ui'

type RegistrarPagoProps = { preselectedClienteId?: string | null; clientes: Cliente[]; deudas: Deuda[]; pagos: Pago[]; onSave: (pago: Pago) => void; onCancel: () => void }

/** Registra un pago y lo distribuye entre las deudas pendientes del cliente. */
export function RegistrarPago({ preselectedClienteId, clientes, deudas, pagos, onSave, onCancel }: RegistrarPagoProps) {
  const [clienteId, setClienteId] = useState(preselectedClienteId ?? '')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(todayStr())
  const [metodo, setMetodo] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [notas, setNotas] = useState('')
  const [distrib, setDistrib] = useState<Record<string, string>>({})
  const montoNum = parseFloat(monto) || 0
  const deudasActivas = useMemo(() => deudas.filter(deuda => deuda.cliente_id === clienteId).map(deuda => ({ ...deuda, saldo: getSaldo(deuda, pagos) })).filter(deuda => deuda.saldo > 0).sort((a, b) => a.fecha_fiado.localeCompare(b.fecha_fiado)), [clienteId, deudas, pagos])
  const totalDistrib = Object.values(distrib).reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
  const restante = montoNum - totalDistrib
  const errors: string[] = []
  deudasActivas.forEach(deuda => { if ((parseFloat(distrib[deuda.id] || '0') || 0) > deuda.saldo) errors.push(`Monto aplicado a deuda del ${fmtDate(deuda.fecha_fiado)} supera el saldo.`) })
  if (totalDistrib > montoNum) errors.push('La suma distribuida supera el monto del pago.')
  const hasDistrib = Object.values(distrib).some(value => parseFloat(value) > 0)
  const canSubmit = !!clienteId && montoNum > 0 && hasDistrib && errors.length === 0
  const handleSubmit = () => { if (!canSubmit) return; const aplicaciones: AplicacionPago[] = Object.entries(distrib).filter(([, value]) => parseFloat(value) > 0).map(([deudaId, value]) => ({ deuda_id: deudaId, monto_aplicado: parseFloat(value) })); onSave({ id: uid(), cliente_id: clienteId, monto: montoNum, fecha_pago: fecha, metodo, notas: notas.trim() || undefined, aplicaciones, created_at: todayStr() }) }

  return <div className="p-6 max-w-2xl"><div className="flex items-center gap-3 mb-6"><button onClick={onCancel} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors cursor-pointer"><IcoBack /></button><h1 className="text-xl font-semibold text-[#e6edf3]">Registrar pago</h1></div><div className="space-y-5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FieldSelect label="Cliente" value={clienteId} onChange={event => { setClienteId(event.target.value); setDistrib({}) }}><option value="">Seleccionar cliente…</option>{clientes.map(cliente => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}</FieldSelect><FieldInput label="Fecha del pago" type="date" value={fecha} onChange={event => setFecha(event.target.value)} /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><FieldInput label="Monto recibido (COP)" type="number" min="0" step="500" value={monto} onChange={event => setMonto(event.target.value)} placeholder="Ej: 15000" /><FieldSelect label="Método" value={metodo} onChange={event => setMetodo(event.target.value as 'efectivo' | 'transferencia')}><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option></FieldSelect></div>
    {clienteId && <div><div className="flex items-center justify-between mb-2"><label className="text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Distribuir a deudas</label>{montoNum > 0 && <span className={`text-xs font-mono font-semibold ${restante < 0 ? 'text-[#f85149]' : restante === 0 ? 'text-[#3fb950]' : 'text-[#d29922]'}`}>Restante: {fmt(restante)}</span>}</div>{deudasActivas.length === 0 ? <Card className="p-4 text-sm text-[#484f58] text-center">Este cliente no tiene deudas pendientes.</Card> : <Card className="overflow-hidden divide-y divide-[#21262d]">{deudasActivas.map(deuda => <div key={deuda.id} className="p-3 flex items-center gap-3"><div className="flex-1 min-w-0"><div className="text-sm text-[#e6edf3]">{fmtDate(deuda.fecha_fiado)}</div><div className="text-xs text-[#7d8590] truncate mt-0.5">{deuda.items.map(item => item.nombre_producto).join(', ')}</div></div><div className="shrink-0 text-right mr-2"><div className="text-[10px] text-[#7d8590]">Saldo</div><div className="text-sm font-mono font-semibold text-[#f85149]">{fmt(deuda.saldo)}</div></div><div className="w-28 shrink-0"><input type="number" min="0" max={deuda.saldo} step="500" placeholder="0" value={distrib[deuda.id] ?? ''} onChange={event => setDistrib(previous => ({ ...previous, [deuda.id]: event.target.value }))} className="w-full px-2 py-1.5 bg-[#21262d] border border-[#30363d] rounded text-sm font-mono text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] text-right" /></div></div>)}{montoNum > 0 && <div className="px-3 py-2.5 flex justify-between bg-[#0d1117]"><span className="text-xs text-[#7d8590]">Total distribuido</span><span className="text-sm font-mono font-semibold text-[#e6edf3]">{fmt(totalDistrib)} <span className="text-[#7d8590] font-normal">de {fmt(montoNum)}</span></span></div>}</Card>}{errors.length > 0 && <div className="mt-2 space-y-1">{errors.map((error, index) => <p key={index} className="text-xs text-[#f85149]">⚠ {error}</p>)}</div>}</div>}
    <FieldInput label="Notas (opcional)" value={notas} onChange={event => setNotas(event.target.value)} placeholder="Observaciones del pago…" /><div className="flex gap-2 pt-1"><Btn onClick={handleSubmit} disabled={!canSubmit}>Registrar pago</Btn><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn></div>
  </div></div>
}
