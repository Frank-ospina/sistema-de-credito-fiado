import { useState } from 'react'
import type { Usuario, ViewName } from '../domain/types'

/** Estado de navegación y sesión; los datos de negocio los cargan las features directamente del backend. */
export function useAppState() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [view, setView] = useState<ViewName>('dashboard')
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)
  const [preselectedClienteId, setPreselectedClienteId] = useState<string | null>(null)

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
    navigate,
  }
}
