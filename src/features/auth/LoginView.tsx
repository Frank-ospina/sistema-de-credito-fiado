import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Usuario } from '../../domain/types'
import { IcoEye, IcoEyeOff } from '../../components/icons'
import { FieldInput } from '../../components/ui'

type LoginViewProps = {
  usuarios: Usuario[]
  onLogin: (usuario: Usuario) => void
}

/** Autentica usuarios activos contra los registros disponibles en memoria. */
export function LoginView({ usuarios, onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const usuario = usuarios.find(item => item.username === username.trim() && item.password === password)
      if (!usuario) {
        setError('Usuario o contraseña incorrectos.')
        setLoading(false)
        return
      }
      if (!usuario.activo) {
        setError('Esta cuenta está desactivada. Contacta al administrador.')
        setLoading(false)
        return
      }
      onLogin(usuario)
    }, 400)
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-[#0d1117]">
      <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 rounded-xl bg-[#238636] flex items-center justify-center text-white text-lg font-bold select-none shadow-lg">F</div><div><div className="font-semibold text-[#e6edf3] text-lg leading-tight">FiadoApp</div><div className="text-xs text-[#484f58]">Tienda de barrio</div></div></div>
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl">
        <h1 className="text-xl font-semibold text-[#e6edf3] mb-1">Iniciar sesión</h1>
        <p className="text-sm text-[#7d8590] mb-7">Accede con tus credenciales de usuario</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldInput label="Usuario" value={username} onChange={event => { setUsername(event.target.value); setError('') }} placeholder="nombre de usuario" autoComplete="username" autoFocus />
          <div className="flex flex-col gap-1"><label className="text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">Contraseña</label><div className="relative"><input type={showPwd ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError('') }} placeholder="••••••••" autoComplete="current-password" className="w-full px-3 py-2 pr-10 bg-[#21262d] border border-[#30363d] rounded-md text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/20 transition-colors placeholder:text-[#484f58]" /><button type="button" onClick={() => setShowPwd(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#7d8590] cursor-pointer transition-colors">{showPwd ? <IcoEyeOff /> : <IcoEye />}</button></div></div>
          {error && <div className="px-3 py-2.5 bg-[#3d1a19] border border-[#f85149]/30 rounded-md text-xs text-[#f85149]">{error}</div>}
          <button type="submit" disabled={!username.trim() || !password || loading} className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors cursor-pointer mt-2">{loading ? 'Verificando…' : 'Ingresar'}</button>
        </form>
        <div className="mt-6 pt-5 border-t border-[#21262d]"><p className="text-[11px] text-[#484f58] text-center">Credenciales de prueba: <span className="font-mono text-[#7d8590]">admin / admin123</span></p></div>
      </div>
    </div>
  )
}
