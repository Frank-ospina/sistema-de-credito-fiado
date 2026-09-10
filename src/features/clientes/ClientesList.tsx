import { useEffect, useMemo, useState } from 'react'
import type { ViewName } from '../../domain/types'
import { ApiError, createCliente, listClientes, listDeudas } from '../../lib/api'
import type { ClienteApi } from '../../lib/api'
import { fmt } from '../../lib/formatters'
import { IcoChevRight, IcoPlus } from '../../components/icons'
import { Btn, Card, FieldInput } from '../../components/ui'

type ClientesListProps = {
  onNavigate: (view: ViewName, clienteId?: string) => void
}

/** Lista clientes desde el backend, muestra su saldo y permite registrar nuevos clientes. */
export function ClientesList({ onNavigate }: ClientesListProps) {
  const [clientes, setClientes] = useState<ClienteApi[]>([])
  const [saldosPorCliente, setSaldosPorCliente] = useState<Record<string, { total: number; activas: number }>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([listClientes(), listDeudas()])
      .then(([clientesData, deudasData]) => {
        if (cancelled) return
        setClientes(clientesData)
        const resumen: Record<string, { total: number; activas: number }> = {}
        for (const deuda of deudasData) {
          const previo = resumen[deuda.cliente_id] ?? { total: 0, activas: 0 }
          previo.total += deuda.saldo
          if (deuda.saldo > 0) previo.activas += 1
          resumen[deuda.cliente_id] = previo
        }
        setSaldosPorCliente(resumen)
      })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista de clientes.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const lista = useMemo(
    () => clientes.map(cliente => ({ ...cliente, ...(saldosPorCliente[cliente.id] ?? { total: 0, activas: 0 }) })).sort((a, b) => b.total - a.total),
    [clientes, saldosPorCliente],
  )
  const filtrada = lista.filter(cliente => cliente.nombre.toLowerCase().includes(search.toLowerCase()) || cliente.telefono.includes(search))

  const handleAdd = async () => {
    if (!nombre.trim() || !telefono.trim()) return
    try {
      const creado = await createCliente({ nombre: nombre.trim(), telefono: telefono.trim(), direccion: direccion.trim() || undefined })
      setClientes(previous => [...previous, creado])
      setNombre(''); setTelefono(''); setDireccion(''); setShowForm(false); setFormError('')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo crear el cliente.')
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Clientes</h1>
        <Btn onClick={() => setShowForm(value => !value)}><IcoPlus />Nuevo cliente</Btn>
      </div>
      {loadError && <div className="mb-4 px-3 py-2.5 bg-[var(--bg-red-subtle)] border border-[rgb(var(--accent-red-rgb)/30%)] rounded-md text-xs text-[var(--accent-red)]">{loadError}</div>}
      {showForm && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Registrar cliente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <FieldInput label="Nombre completo" value={nombre} onChange={event => setNombre(event.target.value)} placeholder="María García" />
            <FieldInput label="Teléfono" value={telefono} onChange={event => setTelefono(event.target.value)} placeholder="300-000-0000" />
          </div>
          <div className="mb-4"><FieldInput label="Dirección (opcional)" value={direccion} onChange={event => setDireccion(event.target.value)} placeholder="Cra 45 # 23-12" /></div>
          {formError && <p className="text-xs text-[var(--accent-red)] mb-3">⚠ {formError}</p>}
          <div className="flex gap-2">
            <Btn onClick={handleAdd} disabled={!nombre.trim() || !telefono.trim()}>Guardar</Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setFormError('') }}>Cancelar</Btn>
          </div>
        </Card>
      )}
      <div className="mb-4">
        <input className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-blue)] placeholder:text-[var(--text-muted)]" placeholder="Buscar por nombre o teléfono…" value={search} onChange={event => setSearch(event.target.value)} />
      </div>
      {loading ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Cargando clientes…</Card> : <Card className="overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[var(--border)]">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Cliente</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest hidden sm:table-cell">Teléfono</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Deudas</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Saldo</th><th className="w-8 px-2" />
          </tr></thead>
          <tbody className="divide-y divide-[var(--bg-elevated)]">
            {filtrada.map(cliente => (
              <tr key={cliente.id} className="hover:bg-[rgb(var(--bg-elevated-rgb)/40%)] cursor-pointer transition-colors" onClick={() => onNavigate('cliente-detalle', cliente.id)}>
                <td className="px-4 py-3"><div className="text-sm font-medium text-[var(--text-primary)]">{cliente.nombre}</div>{cliente.direccion && <div className="text-xs text-[var(--text-secondary)] mt-0.5">{cliente.direccion}</div>}</td>
                <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm font-mono text-[var(--text-secondary)]">{cliente.telefono}</span></td>
                <td className="px-4 py-3 text-center">{cliente.activas > 0 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-[var(--bg-red-subtle)] text-[var(--accent-red)]">{cliente.activas}</span> : <span className="text-xs text-[var(--text-muted)]">—</span>}</td>
                <td className="px-4 py-3 text-right"><span className={`text-sm font-mono font-semibold ${cliente.total > 0 ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green-light)]'}`}>{cliente.total > 0 ? fmt(cliente.total) : 'Al día ✓'}</span></td>
                <td className="px-2 text-[var(--text-muted)]"><IcoChevRight /></td>
              </tr>
            ))}
            {filtrada.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">{search ? 'Sin resultados' : 'No hay clientes registrados'}</td></tr>}
          </tbody>
        </table>
      </Card>}
    </div>
  )
}
