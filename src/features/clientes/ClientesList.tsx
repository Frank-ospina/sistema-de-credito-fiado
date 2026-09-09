import { useMemo, useState } from 'react'
import type { Cliente, Deuda, Pago, ViewName } from '../../domain/types'
import { getSaldo } from '../../domain/credit'
import { fmt, todayStr, uid } from '../../lib/formatters'
import { IcoChevRight, IcoPlus } from '../../components/icons'
import { Btn, Card, FieldInput } from '../../components/ui'

type ClientesListProps = {
  clientes: Cliente[]
  deudas: Deuda[]
  pagos: Pago[]
  onNavigate: (view: ViewName, clienteId?: string) => void
  onAddCliente: (cliente: Cliente) => void
}

/** Lista clientes, muestra su saldo y permite registrar nuevos clientes. */
export function ClientesList({ clientes, deudas, pagos, onNavigate, onAddCliente }: ClientesListProps) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')

  const lista = useMemo(
    () => clientes.map(cliente => {
      const clienteDeudas = deudas.filter(deuda => deuda.cliente_id === cliente.id)
      const total = clienteDeudas.reduce((sum, deuda) => sum + getSaldo(deuda, pagos), 0)
      const activas = clienteDeudas.filter(deuda => getSaldo(deuda, pagos) > 0).length
      return { ...cliente, total, activas }
    }).sort((a, b) => b.total - a.total),
    [clientes, deudas, pagos],
  )
  const filtrada = lista.filter(cliente => cliente.nombre.toLowerCase().includes(search.toLowerCase()) || cliente.telefono.includes(search))

  const handleAdd = () => {
    if (!nombre.trim() || !telefono.trim()) return
    onAddCliente({ id: uid(), nombre: nombre.trim(), telefono: telefono.trim(), direccion: direccion.trim() || undefined, created_at: todayStr() })
    setNombre('')
    setTelefono('')
    setDireccion('')
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#e6edf3]">Clientes</h1>
        <Btn onClick={() => setShowForm(value => !value)}><IcoPlus />Nuevo cliente</Btn>
      </div>
      {showForm && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#e6edf3] mb-4">Registrar cliente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <FieldInput label="Nombre completo" value={nombre} onChange={event => setNombre(event.target.value)} placeholder="María García" />
            <FieldInput label="Teléfono" value={telefono} onChange={event => setTelefono(event.target.value)} placeholder="300-000-0000" />
          </div>
          <div className="mb-4"><FieldInput label="Dirección (opcional)" value={direccion} onChange={event => setDireccion(event.target.value)} placeholder="Cra 45 # 23-12" /></div>
          <div className="flex gap-2">
            <Btn onClick={handleAdd} disabled={!nombre.trim() || !telefono.trim()}>Guardar</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
          </div>
        </Card>
      )}
      <div className="mb-4">
        <input className="w-full px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] placeholder:text-[#484f58]" placeholder="Buscar por nombre o teléfono…" value={search} onChange={event => setSearch(event.target.value)} />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#30363d]">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Cliente</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest hidden sm:table-cell">Teléfono</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Deudas</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Saldo</th><th className="w-8 px-2" />
          </tr></thead>
          <tbody className="divide-y divide-[#21262d]">
            {filtrada.map(cliente => (
              <tr key={cliente.id} className="hover:bg-[#21262d]/40 cursor-pointer transition-colors" onClick={() => onNavigate('cliente-detalle', cliente.id)}>
                <td className="px-4 py-3"><div className="text-sm font-medium text-[#e6edf3]">{cliente.nombre}</div>{cliente.direccion && <div className="text-xs text-[#7d8590] mt-0.5">{cliente.direccion}</div>}</td>
                <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm font-mono text-[#7d8590]">{cliente.telefono}</span></td>
                <td className="px-4 py-3 text-center">{cliente.activas > 0 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-[#3d1a19] text-[#f85149]">{cliente.activas}</span> : <span className="text-xs text-[#484f58]">—</span>}</td>
                <td className="px-4 py-3 text-right"><span className={`text-sm font-mono font-semibold ${cliente.total > 0 ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>{cliente.total > 0 ? fmt(cliente.total) : 'Al día ✓'}</span></td>
                <td className="px-2 text-[#484f58]"><IcoChevRight /></td>
              </tr>
            ))}
            {filtrada.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#484f58]">{search ? 'Sin resultados' : 'No hay clientes registrados'}</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
