import type { Usuario } from './domain/types'
import { useAppState } from './app/useAppState'
import { Dashboard } from './features/dashboard/Dashboard'
import { ClientesList } from './features/clientes/ClientesList'
import { ClienteDetalle } from './features/clientes/ClienteDetalle'
import { LoginView } from './features/auth/LoginView'
import { ProductosCatalogo } from './features/productos/ProductosCatalogo'
import { NuevaDeuda } from './features/deudas/NuevaDeuda'
import { RegistrarPago } from './features/pagos/RegistrarPago'
import { UsuariosAdmin } from './features/usuarios/UsuariosAdmin'
import { AppShell } from './layout/AppShell'
import { clearToken } from './lib/api'

/** Punto de composición: conecta la navegación con cada feature (autosuficiente) y el layout. */
export default function App() {
  const { currentUser, setCurrentUser, view, setView, selectedClienteId, preselectedClienteId, navigate } = useAppState()

  const handleLogin = (user: Usuario) => {
    setCurrentUser(user)
    setView('dashboard')
  }

  const handleLogout = () => {
    clearToken()
    setCurrentUser(null)
    setView('dashboard')
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />
  }

  const isAdmin = currentUser.rol === 'admin'
  const volverAlOrigen = () => preselectedClienteId ? navigate('cliente-detalle', preselectedClienteId) : navigate('clientes')

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />
      case 'clientes':
        return <ClientesList onNavigate={navigate} />
      case 'cliente-detalle':
        return selectedClienteId ? (
          <ClienteDetalle key={selectedClienteId} clienteId={selectedClienteId} onNavigate={navigate} onBack={() => navigate('clientes')} />
        ) : null
      case 'nueva-deuda':
        return (
          <NuevaDeuda
            preselectedClienteId={preselectedClienteId}
            onSaved={clienteId => navigate('cliente-detalle', clienteId)}
            onCancel={volverAlOrigen}
          />
        )
      case 'registrar-pago':
        return (
          <RegistrarPago
            preselectedClienteId={preselectedClienteId}
            onSaved={clienteId => navigate('cliente-detalle', clienteId)}
            onCancel={volverAlOrigen}
          />
        )
      case 'productos':
        return <ProductosCatalogo />
      case 'usuarios':
        return isAdmin ? <UsuariosAdmin currentUser={currentUser} /> : null
    }
  }

  return (
    <AppShell
      currentUser={currentUser}
      view={view}
      isAdmin={isAdmin}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      {renderView()}
    </AppShell>
  )
}
