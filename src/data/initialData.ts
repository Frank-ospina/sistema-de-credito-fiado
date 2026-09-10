import type { Cliente, Deuda, Pago, Producto } from '../domain/types'

export const initialClientes: Cliente[] = [
  { id: 'c1', nombre: 'María Fernanda Ríos', telefono: '300-456-7890', direccion: 'Cra 45 # 23-12, Apt 201', created_at: '2026-07-01' },
  { id: 'c2', nombre: 'Carlos Arturo Gómez', telefono: '315-234-5678', created_at: '2026-07-05' },
  { id: 'c3', nombre: 'Luz Elena Martínez', telefono: '310-987-6543', direccion: 'Calle 12 # 8-45', created_at: '2026-07-10' },
  { id: 'c4', nombre: 'Jorge Iván Herrera', telefono: '320-111-2233', created_at: '2026-08-01' },
  { id: 'c5', nombre: 'Ana Lucía Torres', telefono: '314-555-4444', direccion: 'Cra 10 # 5-67', created_at: '2026-08-15' },
]

export const initialProductos: Producto[] = [
  { id: 'p1', nombre: 'Leche entera 1L', precio_unitario: 3200, created_at: '2026-07-01' },
  { id: 'p2', nombre: 'Arroz x500g', precio_unitario: 2800, created_at: '2026-07-01' },
  { id: 'p3', nombre: 'Pan tajado', precio_unitario: 4500, created_at: '2026-07-01' },
  { id: 'p4', nombre: 'Azúcar 1kg', precio_unitario: 3500, created_at: '2026-07-01' },
  { id: 'p5', nombre: 'Aceite 250ml', precio_unitario: 5200, created_at: '2026-07-01' },
  { id: 'p6', nombre: 'Café Sello Rojo 100g', precio_unitario: 8900, created_at: '2026-07-01' },
  { id: 'p7', nombre: 'Huevos x6', precio_unitario: 7200, created_at: '2026-07-01' },
  { id: 'p8', nombre: 'Jabón en barra', precio_unitario: 3800, created_at: '2026-07-01' },
]

export const initialDeudas: Deuda[] = [
  {
    id: 'd1', cliente_id: 'c1', fecha_fiado: '2026-08-05',
    items: [
      { producto_id: 'p1', nombre_producto: 'Leche entera 1L', cantidad: 2, precio_unitario: 3200, subtotal: 6400 },
      { producto_id: 'p3', nombre_producto: 'Pan tajado', cantidad: 1, precio_unitario: 4500, subtotal: 4500 },
    ],
    monto_total: 10900, created_at: '2026-08-05',
  },
  {
    id: 'd2', cliente_id: 'c1', fecha_fiado: '2026-08-12',
    items: [
      { producto_id: 'p2', nombre_producto: 'Arroz x500g', cantidad: 2, precio_unitario: 2800, subtotal: 5600 },
      { producto_id: 'p4', nombre_producto: 'Azúcar 1kg', cantidad: 1, precio_unitario: 3500, subtotal: 3500 },
      { producto_id: 'p6', nombre_producto: 'Café Sello Rojo 100g', cantidad: 1, precio_unitario: 8900, subtotal: 8900 },
    ],
    monto_total: 18000, created_at: '2026-08-12',
  },
  {
    id: 'd3', cliente_id: 'c1', fecha_fiado: '2026-08-20',
    items: [{ producto_id: 'p7', nombre_producto: 'Huevos x6', cantidad: 1, precio_unitario: 7200, subtotal: 7200 }],
    monto_total: 7200, created_at: '2026-08-20',
  },
  {
    id: 'd4', cliente_id: 'c2', fecha_fiado: '2026-08-10',
    items: [
      { producto_id: 'p5', nombre_producto: 'Aceite 250ml', cantidad: 2, precio_unitario: 5200, subtotal: 10400 },
      { producto_id: 'p8', nombre_producto: 'Jabón en barra', cantidad: 3, precio_unitario: 3800, subtotal: 11400 },
    ],
    monto_total: 21800, created_at: '2026-08-10',
  },
  {
    id: 'd5', cliente_id: 'c2', fecha_fiado: '2026-08-18',
    items: [{ producto_id: 'p1', nombre_producto: 'Leche entera 1L', cantidad: 3, precio_unitario: 3200, subtotal: 9600 }],
    monto_total: 9600, created_at: '2026-08-18',
  },
  {
    id: 'd6', cliente_id: 'c3', fecha_fiado: '2026-07-25',
    items: [
      { producto_id: 'p2', nombre_producto: 'Arroz x500g', cantidad: 4, precio_unitario: 2800, subtotal: 11200 },
      { producto_id: 'p4', nombre_producto: 'Azúcar 1kg', cantidad: 2, precio_unitario: 3500, subtotal: 7000 },
    ],
    monto_total: 18200, created_at: '2026-07-25',
  },
  {
    id: 'd7', cliente_id: 'c4', fecha_fiado: '2026-09-01',
    items: [
      { producto_id: 'p6', nombre_producto: 'Café Sello Rojo 100g', cantidad: 2, precio_unitario: 8900, subtotal: 17800 },
      { producto_id: 'p3', nombre_producto: 'Pan tajado', cantidad: 1, precio_unitario: 4500, subtotal: 4500 },
    ],
    monto_total: 22300, created_at: '2026-09-01',
  },
]

export const initialPagos: Pago[] = [
  {
    id: 'pa1', cliente_id: 'c1', monto: 15000, fecha_pago: '2026-08-15', metodo: 'efectivo',
    aplicaciones: [
      { deuda_id: 'd1', monto_aplicado: 10900 },
      { deuda_id: 'd2', monto_aplicado: 4100 },
    ],
    created_at: '2026-08-15',
  },
  {
    id: 'pa2', cliente_id: 'c2', monto: 10000, fecha_pago: '2026-08-20', metodo: 'transferencia',
    aplicaciones: [{ deuda_id: 'd4', monto_aplicado: 10000 }],
    created_at: '2026-08-20',
  },
  {
    id: 'pa3', cliente_id: 'c3', monto: 18200, fecha_pago: '2026-08-05', metodo: 'efectivo',
    aplicaciones: [{ deuda_id: 'd6', monto_aplicado: 18200 }],
    created_at: '2026-08-05',
  },
]
