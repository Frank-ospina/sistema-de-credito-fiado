import { useEffect, useState } from 'react'
import { fmt } from '../../lib/formatters'
import { ApiError, createProducto, deleteProducto, listProductos, updateProducto } from '../../lib/api'
import type { ProductoApi } from '../../lib/api'
import { IcoPlus, IcoTrash, IcoX } from '../../components/icons'
import { Btn, Card, FieldInput } from '../../components/ui'

/** Catálogo de productos usados al crear nuevas deudas, conectado al backend. */
export function ProductosCatalogo() {
  const [productos, setProductos] = useState<ProductoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [formError, setFormError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editPrecio, setEditPrecio] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listProductos()
      .then(data => { if (!cancelled) setProductos(data) })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar el catálogo.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleAdd = async () => {
    if (!nombre.trim() || !precio) return
    try {
      const creado = await createProducto({ nombre: nombre.trim(), precio_actual: parseFloat(precio) })
      setProductos(previous => [...previous, creado])
      setNombre(''); setPrecio(''); setFormError('')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo crear el producto.')
    }
  }

  const startEdit = (producto: ProductoApi) => { setEditId(producto.id); setEditNombre(producto.nombre); setEditPrecio(String(producto.precio_actual)) }

  const saveEdit = async (producto: ProductoApi) => {
    if (!editNombre.trim() || !editPrecio) return
    setBusyId(producto.id)
    try {
      const actualizado = await updateProducto(producto.id, { nombre: editNombre.trim(), precio_actual: parseFloat(editPrecio) })
      setProductos(previous => previous.map(item => item.id === actualizado.id ? actualizado : item))
      setEditId(null)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'No se pudo actualizar el producto.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setBusyId(id)
    try {
      await deleteProducto(id)
      setProductos(previous => previous.filter(producto => producto.id !== id))
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'No se pudo eliminar el producto.')
    } finally {
      setBusyId(null)
    }
  }

  return <div className="p-6 max-w-2xl">
    <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">Catálogo de productos</h1>
    {loadError && <div className="mb-4 px-3 py-2.5 bg-[var(--bg-red-subtle)] border border-[rgb(var(--accent-red-rgb)/30%)] rounded-md text-xs text-[var(--accent-red)]">{loadError}</div>}
    <Card className="p-4 mb-4"><h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Agregar producto</h3><div className="flex gap-3 items-end flex-wrap"><div className="flex-1 min-w-40"><FieldInput label="Nombre" value={nombre} onChange={event => setNombre(event.target.value)} placeholder="Ej: Leche entera 1L" /></div><div className="w-36"><FieldInput label="Precio (COP)" type="number" min="0" value={precio} onChange={event => setPrecio(event.target.value)} placeholder="3200" /></div><Btn onClick={handleAdd} disabled={!nombre.trim() || !precio}><IcoPlus />Agregar</Btn></div>{formError && <p className="text-xs text-[var(--accent-red)] mt-2">⚠ {formError}</p>}</Card>
    {loading ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Cargando productos…</Card> : <Card className="overflow-hidden"><table className="w-full"><thead><tr className="border-b border-[var(--border)]"><th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Producto</th><th className="px-4 py-2.5 text-right text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Precio</th><th className="w-24 px-4 py-2.5" /></tr></thead><tbody className="divide-y divide-[var(--bg-elevated)]">
      {productos.map(producto => { const isBusy = busyId === producto.id; return <tr key={producto.id} className="group"><td className="px-4 py-3">{editId === producto.id ? <input className="w-full px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--accent-blue)] rounded text-sm text-[var(--text-primary)] focus:outline-none" value={editNombre} onChange={event => setEditNombre(event.target.value)} autoFocus /> : <span className="text-sm text-[var(--text-primary)]">{producto.nombre}</span>}</td><td className="px-4 py-3 text-right">{editId === producto.id ? <input type="number" min="0" className="w-28 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--accent-blue)] rounded text-sm font-mono text-[var(--text-primary)] focus:outline-none text-right" value={editPrecio} onChange={event => setEditPrecio(event.target.value)} /> : <span className="text-sm font-mono text-[var(--text-primary)]">{fmt(producto.precio_actual)}</span>}</td><td className="px-4 py-3">{editId === producto.id ? <div className="flex gap-1 justify-end"><Btn size="sm" onClick={() => saveEdit(producto)} disabled={isBusy}>OK</Btn><Btn size="sm" variant="ghost" onClick={() => setEditId(null)}><IcoX /></Btn></div> : <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEdit(producto)} className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-blue)] cursor-pointer px-1.5 py-1 rounded hover:bg-[var(--bg-elevated)] transition-colors">editar</button><button onClick={() => handleDelete(producto.id)} disabled={isBusy} className="text-[var(--text-secondary)] hover:text-[var(--accent-red)] cursor-pointer p-1 rounded hover:bg-[var(--bg-red-subtle)] transition-colors disabled:opacity-40"><IcoTrash /></button></div>}</td></tr> })}
      {productos.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">Sin productos en el catálogo.</td></tr>}
    </tbody></table></Card>}
  </div>
}
