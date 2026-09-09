import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import type { EstadoDeuda } from '../../domain/types'

const estadoConfig: Record<EstadoDeuda, { label: string; text: string; bg: string }> = {
  pendiente: { label: 'Pendiente', text: 'text-[#f85149]', bg: 'bg-[#3d1a19]' },
  parcial: { label: 'Parcial', text: 'text-[#d29922]', bg: 'bg-[#3d2d0a]' },
  pagada: { label: 'Pagada', text: 'text-[#3fb950]', bg: 'bg-[#1a3d24]' },
}

/** Etiqueta visual para pendiente, parcial o pagada. */
export function EstadoBadge({ estado }: { estado: EstadoDeuda }) {
  const { label, text, bg } = estadoConfig[estado]
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${text} ${bg}`}>{label}</span>
}

/** Campo de texto con etiqueta y estilos compartidos. */
export function FieldInput({ label, ...rest }: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">{label}</label>}
      <input className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/20 transition-colors placeholder:text-[#484f58]" {...rest} />
    </div>
  )
}

/** Selector con etiqueta y estilos compartidos. */
export function FieldSelect({ label, children, ...rest }: { label?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] font-semibold text-[#7d8590] uppercase tracking-widest">{label}</label>}
      <select className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/20 transition-colors" {...rest}>{children}</select>
    </div>
  )
}

/** Botón estándar con variantes visuales de la aplicación. */
export function Btn({ variant = 'primary', size = 'md', children, ...rest }: { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-[#238636] hover:bg-[#2ea043] text-white border border-[#2ea043] disabled:bg-[#238636]/50 disabled:border-transparent',
    secondary: 'bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d]',
    ghost: 'bg-transparent hover:bg-[#21262d] text-[#7d8590] hover:text-[#e6edf3] border border-transparent',
    danger: 'bg-transparent hover:bg-[#3d1a19] text-[#f85149] border border-[#30363d] hover:border-[#f85149]/30',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2' }
  return <button className={`inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]}`} {...rest}>{children}</button>
}

/** Contenedor visual estándar para paneles y secciones. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-[#161b22] border border-[#30363d] rounded-lg ${className}`}>{children}</div>
}
