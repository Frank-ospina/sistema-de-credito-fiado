import axios from 'axios'
import type { EstadoDeuda, RolUsuario } from '../domain/types'

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

export type UsuarioCreateInput = {
  nombre: string
  username: string
  password: string
  rol: RolUsuario
  activo: boolean
}

export type UsuarioUpdateInput = Partial<UsuarioCreateInput>

export class LoginError extends Error {}
export class ApiError extends Error {}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

function toApiError(error: unknown, fallback: string): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    return new ApiError(error.response.data?.detail ?? fallback)
  }
  return new ApiError('No se pudo conectar con el servidor.')
}

export async function listUsuarios(): Promise<UsuarioApi[]> {
  try {
    const { data } = await api.get<UsuarioApi[]>('/api/usuarios', { headers: authHeaders() })
    return data
  } catch (error) {
    throw toApiError(error, 'No se pudo obtener la lista de usuarios.')
  }
}

export async function createUsuario(input: UsuarioCreateInput): Promise<UsuarioApi> {
  try {
    const { data } = await api.post<UsuarioApi>('/api/usuarios', input, { headers: authHeaders() })
    return data
  } catch (error) {
    throw toApiError(error, 'No se pudo crear el usuario.')
  }
}

export async function updateUsuario(id: string, input: UsuarioUpdateInput): Promise<UsuarioApi> {
  try {
    const { data } = await api.put<UsuarioApi>(`/api/usuarios/${id}`, input, { headers: authHeaders() })
    return data
  } catch (error) {
    throw toApiError(error, 'No se pudo actualizar el usuario.')
  }
}

export async function deleteUsuario(id: string): Promise<void> {
  try {
    await api.delete(`/api/usuarios/${id}`, { headers: authHeaders() })
  } catch (error) {
    throw toApiError(error, 'No se pudo eliminar el usuario.')
  }
}

export type ProductoApi = {
  id: string
  nombre: string
  precio_actual: number
}

export type ProductoInput = {
  nombre: string
  precio_actual: number
}

function toProductoApi(data: { id: number; nombre: string; precio_actual: number }): ProductoApi {
  return { id: String(data.id), nombre: data.nombre, precio_actual: data.precio_actual }
}

export async function listProductos(): Promise<ProductoApi[]> {
  try {
    const { data } = await api.get<{ id: number; nombre: string; precio_actual: number }[]>('/api/productos', { headers: authHeaders() })
    return data.map(toProductoApi)
  } catch (error) {
    throw toApiError(error, 'No se pudo obtener el catálogo de productos.')
  }
}

export async function createProducto(input: ProductoInput): Promise<ProductoApi> {
  try {
    const { data } = await api.post<{ id: number; nombre: string; precio_actual: number }>('/api/productos', input, { headers: authHeaders() })
    return toProductoApi(data)
  } catch (error) {
    throw toApiError(error, 'No se pudo crear el producto.')
  }
}

export async function updateProducto(id: string, input: Partial<ProductoInput>): Promise<ProductoApi> {
  try {
    const { data } = await api.put<{ id: number; nombre: string; precio_actual: number }>(`/api/productos/${id}`, input, { headers: authHeaders() })
    return toProductoApi(data)
  } catch (error) {
    throw toApiError(error, 'No se pudo actualizar el producto.')
  }
}

export async function deleteProducto(id: string): Promise<void> {
  try {
    await api.delete(`/api/productos/${id}`, { headers: authHeaders() })
  } catch (error) {
    throw toApiError(error, 'No se pudo eliminar el producto.')
  }
}

export type ClienteApi = {
  id: string
  nombre: string
  telefono: string
  direccion: string | null
  created_at: string
  updated_at: string
}

export type ClienteInput = {
  nombre: string
  telefono: string
  direccion?: string
}

type ClienteRaw = { id: number; nombre: string; telefono: string; direccion: string | null; created_at: string; updated_at: string }

function toClienteApi(row: ClienteRaw): ClienteApi {
  return { id: String(row.id), nombre: row.nombre, telefono: row.telefono, direccion: row.direccion, created_at: row.created_at, updated_at: row.updated_at }
}

export async function listClientes(): Promise<ClienteApi[]> {
  try {
    const { data } = await api.get<ClienteRaw[]>('/api/clientes', { headers: authHeaders() })
    return data.map(toClienteApi)
  } catch (error) {
    throw toApiError(error, 'No se pudo obtener la lista de clientes.')
  }
}

export async function createCliente(input: ClienteInput): Promise<ClienteApi> {
  try {
    const { data } = await api.post<ClienteRaw>('/api/clientes', input, { headers: authHeaders() })
    return toClienteApi(data)
  } catch (error) {
    throw toApiError(error, 'No se pudo crear el cliente.')
  }
}

export type DeudaApi = {
  id: string
  cliente_id: string
  monto_total: number
  monto_aplicado: number
  saldo: number
  estado: EstadoDeuda
  fecha_fiado: string
  created_at: string
  updated_at: string
}

export type DeudaInput = {
  cliente_id: string
  fecha_fiado?: string
}

type DeudaRaw = {
  id: number
  cliente_id: number
  monto_total: number
  monto_aplicado: number
  saldo: number
  estado: EstadoDeuda
  fecha_fiado: string
  created_at: string
  updated_at: string
}

function toDeudaApi(row: DeudaRaw): DeudaApi {
  return {
    id: String(row.id),
    cliente_id: String(row.cliente_id),
    monto_total: row.monto_total,
    monto_aplicado: row.monto_aplicado,
    saldo: row.saldo,
    estado: row.estado,
    fecha_fiado: row.fecha_fiado,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function listDeudas(clienteId?: string): Promise<DeudaApi[]> {
  try {
    const { data } = await api.get<DeudaRaw[]>('/api/deudas', {
      headers: authHeaders(),
      params: clienteId ? { cliente_id: clienteId } : undefined,
    })
    return data.map(toDeudaApi)
  } catch (error) {
    throw toApiError(error, 'No se pudo obtener la lista de deudas.')
  }
}

export async function createDeuda(input: DeudaInput): Promise<DeudaApi> {
  try {
    const { data } = await api.post<DeudaRaw>('/api/deudas', input, { headers: authHeaders() })
    return toDeudaApi(data)
  } catch (error) {
    throw toApiError(error, 'No se pudo crear la deuda.')
  }
}

export async function deleteDeuda(id: string): Promise<void> {
  try {
    await api.delete(`/api/deudas/${id}`, { headers: authHeaders() })
  } catch (error) {
    throw toApiError(error, 'No se pudo eliminar la deuda.')
  }
}

export type VentaDetalleApi = {
  id: string
  deuda_id: string
  producto_id: string
  cantidad: number
  precio_unitario_venta: number
}

export type VentaDetalleInput = {
  deuda_id: string
  producto_id: string
  cantidad: number
  precio_unitario_venta: number
}

type VentaDetalleRaw = { id: number; deuda_id: number; producto_id: number; cantidad: number; precio_unitario_venta: number }

function toVentaDetalleApi(row: VentaDetalleRaw): VentaDetalleApi {
  return {
    id: String(row.id),
    deuda_id: String(row.deuda_id),
    producto_id: String(row.producto_id),
    cantidad: row.cantidad,
    precio_unitario_venta: row.precio_unitario_venta,
  }
}

export async function createVentaDetalle(input: VentaDetalleInput): Promise<VentaDetalleApi> {
  try {
    const { data } = await api.post<VentaDetalleRaw>('/api/venta-detalles', input, { headers: authHeaders() })
    return toVentaDetalleApi(data)
  } catch (error) {
    throw toApiError(error, 'No se pudo agregar la línea de venta.')
  }
}

export type PagoApi = {
  id: string
  cliente_id: string
  monto_pagado: number
  monto_aplicado: number
  saldo_disponible: number
  metodo_pago: string
  fecha_pago: string
  created_at: string
  updated_at: string
}

export type PagoInput = {
  cliente_id: string
  monto_pagado: number
  metodo_pago: string
  fecha_pago?: string
}

type PagoRaw = {
  id: number
  cliente_id: number
  monto_pagado: number
  monto_aplicado: number
  saldo_disponible: number
  metodo_pago: string
  fecha_pago: string
  created_at: string
  updated_at: string
}

function toPagoApi(row: PagoRaw): PagoApi {
  return {
    id: String(row.id),
    cliente_id: String(row.cliente_id),
    monto_pagado: row.monto_pagado,
    monto_aplicado: row.monto_aplicado,
    saldo_disponible: row.saldo_disponible,
    metodo_pago: row.metodo_pago,
    fecha_pago: row.fecha_pago,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function listPagos(clienteId?: string): Promise<PagoApi[]> {
  try {
    const { data } = await api.get<PagoRaw[]>('/api/pagos', {
      headers: authHeaders(),
      params: clienteId ? { cliente_id: clienteId } : undefined,
    })
    return data.map(toPagoApi)
  } catch (error) {
    throw toApiError(error, 'No se pudo obtener la lista de pagos.')
  }
}

export async function createPago(input: PagoInput): Promise<PagoApi> {
  try {
    const { data } = await api.post<PagoRaw>('/api/pagos', input, { headers: authHeaders() })
    return toPagoApi(data)
  } catch (error) {
    throw toApiError(error, 'No se pudo registrar el pago.')
  }
}

export async function deletePago(id: string): Promise<void> {
  try {
    await api.delete(`/api/pagos/${id}`, { headers: authHeaders() })
  } catch (error) {
    throw toApiError(error, 'No se pudo eliminar el pago.')
  }
}

export type PagoAplicacionApi = {
  id: string
  pago_id: string
  deuda_id: string
  monto_aplicado: number
}

export type PagoAplicacionInput = {
  pago_id: string
  deuda_id: string
  monto_aplicado: number
}

type PagoAplicacionRaw = { id: number; pago_id: number; deuda_id: number; monto_aplicado: number }

function toPagoAplicacionApi(row: PagoAplicacionRaw): PagoAplicacionApi {
  return { id: String(row.id), pago_id: String(row.pago_id), deuda_id: String(row.deuda_id), monto_aplicado: row.monto_aplicado }
}

export async function createPagoAplicacion(input: PagoAplicacionInput): Promise<PagoAplicacionApi> {
  try {
    const { data } = await api.post<PagoAplicacionRaw>('/api/pago-aplicaciones', input, { headers: authHeaders() })
    return toPagoAplicacionApi(data)
  } catch (error) {
    throw toApiError(error, 'No se pudo aplicar el pago a la deuda.')
  }
}

export type HistorialCliente = {
  cliente: ClienteApi
  deudas: (DeudaApi & { detalles: VentaDetalleApi[] })[]
  pagos: (PagoApi & { aplicaciones: PagoAplicacionApi[] })[]
  saldo_total: number
}

type HistorialRaw = {
  cliente: ClienteRaw
  deudas: (DeudaRaw & { detalles: VentaDetalleRaw[] })[]
  pagos: (PagoRaw & { aplicaciones: PagoAplicacionRaw[] })[]
  saldo_total: number
}

export async function getHistorialCliente(clienteId: string): Promise<HistorialCliente> {
  try {
    const { data } = await api.get<HistorialRaw>(`/api/clientes/${clienteId}/historial`, { headers: authHeaders() })
    return {
      cliente: toClienteApi(data.cliente),
      deudas: data.deudas.map(deuda => ({ ...toDeudaApi(deuda), detalles: deuda.detalles.map(toVentaDetalleApi) })),
      pagos: data.pagos.map(pago => ({ ...toPagoApi(pago), aplicaciones: pago.aplicaciones.map(toPagoAplicacionApi) })),
      saldo_total: data.saldo_total,
    }
  } catch (error) {
    throw toApiError(error, 'No se pudo obtener el historial del cliente.')
  }
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
