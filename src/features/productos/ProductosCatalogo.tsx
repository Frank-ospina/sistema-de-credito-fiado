import { useState } from 'react'
import type { Producto } from '../../domain/types'
import { fmt, todayStr, uid } from '../../lib/formatters'
import { IcoPlus, IcoTrash, IcoX } from '../../components/icons'
import { Btn, Card, FieldInput } from '../../components/ui'

type ProductosCatalogoProps = {
  productos: Producto[]
  onAdd: (producto: Producto) => void
  onUpdate: (producto: Producto) => void
  onDelete: (id: string) => void
}

/** Catálogo editable de productos usados al crear nuevas deudas. */
export function ProductosCatalogo({ productos, onAdd, onUpdate, onDelete }: ProductosCatalogoProps) {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editPrecio, setEditPrecio] = useState('')
  const handleAdd = () => { if (!nombre.trim() || !precio) return; onAdd({ id: uid(), nombre: nombre.trim(), precio_unitario: parseFloat(precio), created_at: todayStr() }); setNombre(''); setPrecio('') }
  const startEdit = (producto: Producto) => { setEditId(producto.id); setEditNombre(producto.nombre); setEditPrecio(String(producto.precio_unitario)) }
  const saveEdit = (producto: Producto) => { if (!editNombre.trim() || !editPrecio) return; onUpdate({ ...producto, nombre: editNombre.trim(), precio_unitario: parseFloat(editPrecio) }); setEditId(null) }

  return <div className="p-6 max-w-2xl">
    <h1 className="text-2xl font-semibold text-[#e6edf3] mb-6">Catálogo de productos</h1>
    <Card className="p-4 mb-4"><h3 className="text-sm font-semibold text-[#e6edf3] mb-3">Agregar producto</h3><div className="flex gap-3 items-end flex-wrap"><div className="flex-1 min-w-40"><FieldInput label="Nombre" value={nombre} onChange={event => setNombre(event.target.value)} placeholder="Ej: Leche entera 1L" /></div><div className="w-36"><FieldInput label="Precio (COP)" type="number" min="0" value={precio} onChange={event => setPrecio(event.target.value)} placeholder="3200" /></div><Btn onClick={handleAdd} disabled={!nombre.trim() || !precio}><IcoPlus />Agregar</Btn></div></Card>
    <Card className="overflow-hidden"><table className="w-full"><thead><tr className="border-b border-[#30363d]"><th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Producto</th><th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Precio</th><th className="w-24 px-4 py-2.5" /></tr></thead><tbody className="divide-y divide-[#21262d]">
      {productos.map(producto => <tr key={producto.id} className="group"><td className="px-4 py-3">{editId === producto.id ? <input className="w-full px-2 py-1 bg-[#21262d] border border-[#58a6ff] rounded text-sm text-[#e6edf3] focus:outline-none" value={editNombre} onChange={event => setEditNombre(event.target.value)} autoFocus /> : <span className="text-sm text-[#e6edf3]">{producto.nombre}</span>}</td><td className="px-4 py-3 text-right">{editId === producto.id ? <input type="number" min="0" className="w-28 px-2 py-1 bg-[#21262d] border border-[#58a6ff] rounded text-sm font-mono text-[#e6edf3] focus:outline-none text-right" value={editPrecio} onChange={event => setEditPrecio(event.target.value)} /> : <span className="text-sm font-mono text-[#e6edf3]">{fmt(producto.precio_unitario)}</span>}</td><td className="px-4 py-3">{editId === producto.id ? <div className="flex gap-1 justify-end"><Btn size="sm" onClick={() => saveEdit(producto)}>OK</Btn><Btn size="sm" variant="ghost" onClick={() => setEditId(null)}><IcoX /></Btn></div> : <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEdit(producto)} className="text-xs text-[#7d8590] hover:text-[#58a6ff] cursor-pointer px-1.5 py-1 rounded hover:bg-[#21262d] transition-colors">editar</button><button onClick={() => onDelete(producto.id)} className="text-[#7d8590] hover:text-[#f85149] cursor-pointer p-1 rounded hover:bg-[#3d1a19] transition-colors"><IcoTrash /></button></div>}</td></tr>)}
      {productos.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-[#484f58]">Sin productos en el catálogo.</td></tr>}
    </tbody></table></Card>
  </div>
}
