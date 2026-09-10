import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Usuario } from '../../domain/types'
import { IcoEye, IcoEyeOff } from '../../components/icons'
import { FieldInput } from '../../components/ui'
import { ThemeToggle } from '../../components/ThemeToggle'
import { login, LoginError } from '../../lib/api'

type LoginViewProps = {
  onLogin: (usuario: Usuario) => void
}

/** Autentica contra la API del backend y obtiene el perfil del usuario. */
export function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const usuario = await login(username.trim(), password)
      onLogin({ ...usuario, password: '' })
    } catch (err) {
      setError(err instanceof LoginError ? err.message : 'Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center p-6 bg-[var(--bg-app)]">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 rounded-xl bg-[var(--accent-green)] flex items-center justify-center text-white text-lg font-bold select-none shadow-lg">F</div><div><div className="font-semibold text-[var(--text-primary)] text-lg leading-tight">FiadoApp</div><div className="text-xs text-[var(--text-muted)]">Tienda de barrio</div></div></div>
      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-8 shadow-2xl">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Iniciar sesión</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-7">Accede con tus credenciales de usuario</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldInput label="Usuario" value={username} onChange={event => { setUsername(event.target.value); setError('') }} placeholder="nombre de usuario" autoComplete="username" autoFocus />
          <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Contraseña</label><div className="relative"><input type={showPwd ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError('') }} placeholder="••••••••" autoComplete="current-password" className="w-full px-3 py-2 pr-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[rgb(var(--accent-blue-rgb)/20%)] transition-colors placeholder:text-[var(--text-muted)]" /><button type="button" onClick={() => setShowPwd(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors">{showPwd ? <IcoEyeOff /> : <IcoEye />}</button></div></div>
          {error && <div className="px-3 py-2.5 bg-[var(--bg-red-subtle)] border border-[rgb(var(--accent-red-rgb)/30%)] rounded-md text-xs text-[var(--accent-red)]">{error}</div>}
          <button type="submit" disabled={!username.trim() || !password || loading} className="w-full py-2.5 bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors cursor-pointer mt-2">{loading ? 'Verificando…' : 'Ingresar'}</button>
        </form>
        <div className="mt-6 pt-5 border-t border-[var(--bg-elevated)]"><p className="text-[11px] text-[var(--text-muted)] text-center">Credenciales de prueba: <span className="font-mono text-[var(--text-secondary)]">admin / admin123</span></p></div>
      </div>
    </div>
  )
}
