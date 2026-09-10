import { useTheme } from '../app/useTheme'
import { IcoMoon, IcoSun } from './icons'

/** Botón circular animado para alternar entre tema oscuro y claro. */
export function ThemeToggle() {
  const { tema, toggleTema } = useTheme()
  const esOscuro = tema === 'dark'

  return (
    <button
      onClick={toggleTema}
      title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-blue)] transition-colors cursor-pointer overflow-hidden"
    >
      <span className={`absolute inline-flex text-[var(--accent-yellow)] transition-all duration-300 ${esOscuro ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}>
        <IcoSun />
      </span>
      <span className={`absolute inline-flex text-[var(--accent-blue)] transition-all duration-300 ${esOscuro ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
        <IcoMoon />
      </span>
    </button>
  )
}
