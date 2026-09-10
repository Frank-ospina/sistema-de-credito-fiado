import { useEffect, useState } from 'react'

export type Tema = 'dark' | 'light'

const STORAGE_KEY = 'fiado_theme'

function leerTemaGuardado(): Tema {
  const guardado = localStorage.getItem(STORAGE_KEY)
  return guardado === 'light' ? 'light' : 'dark'
}

/** Alterna entre tema oscuro (por defecto) y claro, persistido en localStorage. */
export function useTheme() {
  const [tema, setTema] = useState<Tema>(() => leerTemaGuardado())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem(STORAGE_KEY, tema)
  }, [tema])

  const toggleTema = () => setTema(previo => (previo === 'dark' ? 'light' : 'dark'))

  return { tema, toggleTema }
}
