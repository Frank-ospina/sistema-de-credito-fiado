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

/** Punto de composición: conecta el estado global con cada feature y el layout. */
export default function App() {
  const {
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
  } = useAppState()

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

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard clientes={clientes} deudas={deudas} pagos={pagos} onNavigate={navigate} />
      case 'clientes':
        return (
          <ClientesList
            clientes={clientes}
            deudas={deudas}
            pagos={pagos}
            onNavigate={navigate}
            onAddCliente={cliente => setClientes(previous => [...previous, cliente])}
          />
        )
      case 'cliente-detalle':
        return selectedClienteId ? (
          <ClienteDetalle
            clienteId={selectedClienteId}
            clientes={clientes}
            deudas={deudas}
            pagos={pagos}
            onNavigate={navigate}
            onBack={() => navigate('clientes')}
          />
        ) : null
      case 'nueva-deuda':
        return (
          <NuevaDeuda
            preselectedClienteId={preselectedClienteId}
            clientes={clientes}
            productos={productos}
            onSave={deuda => {
              setDeudas(previous => [...previous, deuda])
              navigate('cliente-detalle', deuda.cliente_id)
            }}
            onCancel={() => preselectedClienteId ? navigate('cliente-detalle', preselectedClienteId) : navigate('clientes')}
          />
        )
      case 'registrar-pago':
        return (
          <RegistrarPago
            preselectedClienteId={preselectedClienteId}
            clientes={clientes}
            deudas={deudas}
            pagos={pagos}
            onSave={pago => {
              setPagos(previous => [...previous, pago])
              navigate('cliente-detalle', pago.cliente_id)
            }}
            onCancel={() => preselectedClienteId ? navigate('cliente-detalle', preselectedClienteId) : navigate('clientes')}
          />
        )
      case 'productos':
        return (
          <ProductosCatalogo
            productos={productos}
            onAdd={producto => setProductos(previous => [...previous, producto])}
            onUpdate={producto => setProductos(previous => previous.map(item => item.id === producto.id ? producto : item))}
            onDelete={id => setProductos(previous => previous.filter(producto => producto.id !== id))}
          />
        )
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
