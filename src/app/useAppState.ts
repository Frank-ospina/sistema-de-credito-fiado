import { useState } from 'react'
import { initialClientes, initialDeudas, initialPagos, initialProductos } from '../data/initialData'
import type { Cliente, Deuda, Pago, Producto, Usuario, ViewName } from '../domain/types'

/**
 * Estado compartido de la demo y navegación entre vistas.
 * Las mutaciones siguen viviendo aquí para que las features reciban datos
 * y callbacks explícitos, sin depender directamente de otras pantallas.
 */
export function useAppState() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [view, setView] = useState<ViewName>('dashboard')
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)
  const [preselectedClienteId, setPreselectedClienteId] = useState<string | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)
  const [productos, setProductos] = useState<Producto[]>(initialProductos)
  const [deudas, setDeudas] = useState<Deuda[]>(initialDeudas)
  const [pagos, setPagos] = useState<Pago[]>(initialPagos)

  /** Cambia de vista y conserva el cliente relacionado cuando aplica. */
  const navigate = (nextView: ViewName, clienteId?: string) => {
    setView(nextView)
    if (nextView === 'cliente-detalle') setSelectedClienteId(clienteId ?? null)
    else if (clienteId) setPreselectedClienteId(clienteId)
    else setPreselectedClienteId(null)
  }

  return {
    currentUser,
    setCurrentUser,
    view,
    setView,
    selectedClienteId,
    preselectedClienteId,
    clientes,
    setClientes,
    productos,
    setProductos,
    deudas,
    setDeudas,
    pagos,
    setPagos,
    navigate,
  }
}
