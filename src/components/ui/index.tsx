import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import type { EstadoDeuda } from '../../domain/types'

const estadoConfig: Record<EstadoDeuda, { label: string; text: string; bg: string }> = {
  pendiente: { label: 'Pendiente', text: 'text-[var(--accent-red)]', bg: 'bg-[var(--bg-red-subtle)]' },
  parcial: { label: 'Parcial', text: 'text-[var(--accent-yellow)]', bg: 'bg-[var(--bg-yellow-subtle)]' },
  pagada: { label: 'Pagada', text: 'text-[var(--accent-green-light)]', bg: 'bg-[var(--bg-green-subtle)]' },
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
      {label && <label className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">{label}</label>}
      <input className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[rgb(var(--accent-blue-rgb)/20%)] transition-colors placeholder:text-[var(--text-muted)]" {...rest} />
    </div>
  )
}

/** Selector con etiqueta y estilos compartidos. */
export function FieldSelect({ label, children, ...rest }: { label?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">{label}</label>}
      <select className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[rgb(var(--accent-blue-rgb)/20%)] transition-colors" {...rest}>{children}</select>
    </div>
  )
}

/** Botón estándar con variantes visuales de la aplicación. */
export function Btn({ variant = 'primary', size = 'md', children, ...rest }: { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-[var(--accent-green)] hover:bg-[var(--accent-green-hover)] text-white border border-[var(--accent-green-hover)] disabled:bg-[rgb(var(--accent-green-rgb)/50%)] disabled:border-transparent',
    secondary: 'bg-[var(--bg-elevated)] hover:bg-[var(--border)] text-[var(--text-primary)] border border-[var(--border)]',
    ghost: 'bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent',
    danger: 'bg-transparent hover:bg-[var(--bg-red-subtle)] text-[var(--accent-red)] border border-[var(--border)] hover:border-[rgb(var(--accent-red-rgb)/30%)]',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2' }
  return <button className={`inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]}`} {...rest}>{children}</button>
}

/** Contenedor visual estándar para paneles y secciones. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg ${className}`}>{children}</div>
}
