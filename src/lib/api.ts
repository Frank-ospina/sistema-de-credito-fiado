import axios from 'axios'
import type { RolUsuario } from '../domain/types'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://sistema-de-credito-fiado.onrender.com'
const TOKEN_KEY = 'fiado_token'

const api = axios.create({ baseURL: API_URL })

export type UsuarioApi = {
  id: string
  nombre: string
  username: string
  rol: RolUsuario
  activo: boolean
  created_at: string
}

export class LoginError extends Error {}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** Autentica contra /auth/token y devuelve el perfil autenticado. */
export async function login(username: string, password: string): Promise<UsuarioApi> {
  const form = new URLSearchParams({ username, password })

  let accessToken: string
  try {
    const { data } = await api.post<{ access_token: string }>('/auth/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    accessToken = data.access_token
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new LoginError(error.response.data?.detail ?? 'Usuario o contraseña incorrectos.')
    }
    throw new LoginError('No se pudo conectar con el servidor.')
  }

  setToken(accessToken)

  try {
    const { data } = await api.get<UsuarioApi>('/api/usuarios/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return data
  } catch {
    clearToken()
    throw new LoginError('No se pudo obtener el perfil del usuario.')
  }
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
