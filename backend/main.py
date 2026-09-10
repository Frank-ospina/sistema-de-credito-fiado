from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_409_CONFLICT

from auth.auth import get_current_active_user, get_current_admin_user, get_password_hash
from auth.auth_routes import router as auth_router
from config import ALLOWED_ORIGINS
from database.database import get_db
from models.cliente_connection import ClienteConnection
from models.deuda_connection import DeudaConnection
from models.pago_aplicacion_connection import PagoAplicacionConnection
from models.pago_connection import PagoConnection
from models.producto_connection import ProductoConnection
from models.usuario_connection import UsuarioConnection
from models.venta_detalle_connection import VentaDetalleConnection
from schema.cliente_schema import ClienteCreateSchema, ClienteOut, ClienteUpdateSchema
from schema.deuda_schema import DeudaCreateSchema, DeudaOut, DeudaUpdateSchema
from schema.pago_aplicacion_schema import PagoAplicacionCreateSchema, PagoAplicacionOut, PagoAplicacionUpdateSchema
from schema.pago_schema import PagoCreateSchema, PagoOut, PagoUpdateSchema
from schema.producto_schema import ProductoCreateSchema, ProductoOut, ProductoUpdateSchema
from schema.usuario_schema import UsuarioCreateSchema, UsuarioOut, UsuarioUpdateSchema
from schema.venta_detalle_schema import VentaDetalleCreateSchema, VentaDetalleOut, VentaDetalleUpdateSchema

app = FastAPI(title="Sistema de Crédito Fiado - API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/", status_code=HTTP_200_OK)
def health_check():
    return {"status": "ok"}


@app.get("/api/usuarios/me", response_model=UsuarioOut, status_code=HTTP_200_OK)
def get_me(current_user: UsuarioOut = Depends(get_current_active_user)):
    return current_user


@app.get(
    "/api/usuarios",
    response_model=List[UsuarioOut],
    dependencies=[Depends(get_current_admin_user)],
    status_code=HTTP_200_OK,
)
def list_usuarios(conn=Depends(get_db)):
    rows = UsuarioConnection(conn).list_all()
    return [UsuarioOut.from_row(row) for row in rows]


@app.get(
    "/api/usuarios/{usuario_id}",
    response_model=UsuarioOut,
    dependencies=[Depends(get_current_admin_user)],
    status_code=HTTP_200_OK,
)
def get_usuario(usuario_id: str, conn=Depends(get_db)):
    row = UsuarioConnection(conn).get_by_id(usuario_id)
    if not row:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UsuarioOut.from_row(row)


@app.post(
    "/api/usuarios",
    response_model=UsuarioOut,
    dependencies=[Depends(get_current_admin_user)],
    status_code=HTTP_201_CREATED,
)
def create_usuario(usuario: UsuarioCreateSchema, conn=Depends(get_db)):
    repo = UsuarioConnection(conn)
    if repo.get_by_username(usuario.username):
        raise HTTPException(status_code=HTTP_409_CONFLICT, detail="El nombre de usuario ya existe")

    row = repo.create(
        nombre=usuario.nombre,
        username=usuario.username,
        password_hash=get_password_hash(usuario.password),
        rol=usuario.rol,
        activo=usuario.activo,
    )
    return UsuarioOut.from_row(row)


@app.put(
    "/api/usuarios/{usuario_id}",
    response_model=UsuarioOut,
    dependencies=[Depends(get_current_admin_user)],
    status_code=HTTP_200_OK,
)
def update_usuario(usuario_id: str, usuario: UsuarioUpdateSchema, conn=Depends(get_db)):
    repo = UsuarioConnection(conn)
    if not repo.get_by_id(usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    fields = usuario.model_dump(exclude_unset=True)
    if "password" in fields:
        fields["password_hash"] = get_password_hash(fields.pop("password"))
    if "username" in fields:
        otro = repo.get_by_username(fields["username"])
        if otro and str(otro["id"]) != usuario_id:
            raise HTTPException(status_code=HTTP_409_CONFLICT, detail="El nombre de usuario ya existe")

    row = repo.update(usuario_id, fields)
    return UsuarioOut.from_row(row)


@app.delete(
    "/api/usuarios/{usuario_id}",
    dependencies=[Depends(get_current_admin_user)],
    status_code=HTTP_204_NO_CONTENT,
)
def delete_usuario(usuario_id: str, conn=Depends(get_db)):
    if not UsuarioConnection(conn).delete(usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")


@app.get(
    "/api/productos",
    response_model=List[ProductoOut],
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def list_productos(conn=Depends(get_db)):
    rows = ProductoConnection(conn).list_all()
    return [ProductoOut.from_row(row) for row in rows]


@app.post(
    "/api/productos",
    response_model=ProductoOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_201_CREATED,
)
def create_producto(producto: ProductoCreateSchema, conn=Depends(get_db)):
    row = ProductoConnection(conn).create(nombre=producto.nombre, precio_actual=producto.precio_actual)
    return ProductoOut.from_row(row)


@app.put(
    "/api/productos/{producto_id}",
    response_model=ProductoOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def update_producto(producto_id: int, producto: ProductoUpdateSchema, conn=Depends(get_db)):
    repo = ProductoConnection(conn)
    if not repo.get_by_id(producto_id):
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    fields = producto.model_dump(exclude_unset=True)
    row = repo.update(producto_id, fields)
    return ProductoOut.from_row(row)


@app.delete(
    "/api/productos/{producto_id}",
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_204_NO_CONTENT,
)
def delete_producto(producto_id: int, conn=Depends(get_db)):
    if not ProductoConnection(conn).delete(producto_id):
        raise HTTPException(status_code=404, detail="Producto no encontrado")


@app.get(
    "/api/clientes",
    response_model=List[ClienteOut],
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def list_clientes(conn=Depends(get_db)):
    rows = ClienteConnection(conn).list_all()
    return [ClienteOut.from_row(row) for row in rows]


@app.get(
    "/api/clientes/{cliente_id}",
    response_model=ClienteOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def get_cliente(cliente_id: int, conn=Depends(get_db)):
    row = ClienteConnection(conn).get_by_id(cliente_id)
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return ClienteOut.from_row(row)


@app.post(
    "/api/clientes",
    response_model=ClienteOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_201_CREATED,
)
def create_cliente(cliente: ClienteCreateSchema, conn=Depends(get_db)):
    row = ClienteConnection(conn).create(nombre=cliente.nombre, telefono=cliente.telefono, direccion=cliente.direccion)
    return ClienteOut.from_row(row)


@app.put(
    "/api/clientes/{cliente_id}",
    response_model=ClienteOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def update_cliente(cliente_id: int, cliente: ClienteUpdateSchema, conn=Depends(get_db)):
    repo = ClienteConnection(conn)
    if not repo.get_by_id(cliente_id):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    fields = cliente.model_dump(exclude_unset=True)
    row = repo.update(cliente_id, fields)
    return ClienteOut.from_row(row)


@app.delete(
    "/api/clientes/{cliente_id}",
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_204_NO_CONTENT,
)
def delete_cliente(cliente_id: int, conn=Depends(get_db)):
    if not ClienteConnection(conn).delete(cliente_id):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")


@app.get(
    "/api/deudas",
    response_model=List[DeudaOut],
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def list_deudas(cliente_id: Optional[int] = Query(None), conn=Depends(get_db)):
    rows = DeudaConnection(conn).list_all(cliente_id=cliente_id)
    return [DeudaOut.from_row(row) for row in rows]


@app.get(
    "/api/deudas/{deuda_id}",
    response_model=DeudaOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def get_deuda(deuda_id: int, conn=Depends(get_db)):
    row = DeudaConnection(conn).get_by_id(deuda_id)
    if not row:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    return DeudaOut.from_row(row)


@app.post(
    "/api/deudas",
    response_model=DeudaOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_201_CREATED,
)
def create_deuda(deuda: DeudaCreateSchema, conn=Depends(get_db)):
    repo_cliente = ClienteConnection(conn)
    if not repo_cliente.get_by_id(deuda.cliente_id):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    row = DeudaConnection(conn).create(cliente_id=deuda.cliente_id, monto_total=deuda.monto_total, fecha_fiado=deuda.fecha_fiado)
    return DeudaOut.from_row(row)


@app.put(
    "/api/deudas/{deuda_id}",
    response_model=DeudaOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def update_deuda(deuda_id: int, deuda: DeudaUpdateSchema, conn=Depends(get_db)):
    repo = DeudaConnection(conn)
    if not repo.get_by_id(deuda_id):
        raise HTTPException(status_code=404, detail="Deuda no encontrada")

    fields = deuda.model_dump(exclude_unset=True)
    if "cliente_id" in fields and not ClienteConnection(conn).get_by_id(fields["cliente_id"]):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    row = repo.update(deuda_id, fields)
    return DeudaOut.from_row(row)


@app.delete(
    "/api/deudas/{deuda_id}",
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_204_NO_CONTENT,
)
def delete_deuda(deuda_id: int, conn=Depends(get_db)):
    if not DeudaConnection(conn).delete(deuda_id):
        raise HTTPException(status_code=404, detail="Deuda no encontrada")


@app.get(
    "/api/venta-detalles",
    response_model=List[VentaDetalleOut],
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def list_venta_detalles(deuda_id: Optional[int] = Query(None), conn=Depends(get_db)):
    rows = VentaDetalleConnection(conn).list_all(deuda_id=deuda_id)
    return [VentaDetalleOut.from_row(row) for row in rows]


@app.get(
    "/api/venta-detalles/{venta_detalle_id}",
    response_model=VentaDetalleOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def get_venta_detalle(venta_detalle_id: int, conn=Depends(get_db)):
    row = VentaDetalleConnection(conn).get_by_id(venta_detalle_id)
    if not row:
        raise HTTPException(status_code=404, detail="Detalle de venta no encontrado")
    return VentaDetalleOut.from_row(row)


@app.post(
    "/api/venta-detalles",
    response_model=VentaDetalleOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_201_CREATED,
)
def create_venta_detalle(detalle: VentaDetalleCreateSchema, conn=Depends(get_db)):
    if not DeudaConnection(conn).get_by_id(detalle.deuda_id):
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    if not ProductoConnection(conn).get_by_id(detalle.producto_id):
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    row = VentaDetalleConnection(conn).create(
        deuda_id=detalle.deuda_id,
        producto_id=detalle.producto_id,
        cantidad=detalle.cantidad,
        precio_unitario_venta=detalle.precio_unitario_venta,
    )
    return VentaDetalleOut.from_row(row)


@app.put(
    "/api/venta-detalles/{venta_detalle_id}",
    response_model=VentaDetalleOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def update_venta_detalle(venta_detalle_id: int, detalle: VentaDetalleUpdateSchema, conn=Depends(get_db)):
    repo = VentaDetalleConnection(conn)
    if not repo.get_by_id(venta_detalle_id):
        raise HTTPException(status_code=404, detail="Detalle de venta no encontrado")

    fields = detalle.model_dump(exclude_unset=True)
    row = repo.update(venta_detalle_id, fields)
    return VentaDetalleOut.from_row(row)


@app.delete(
    "/api/venta-detalles/{venta_detalle_id}",
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_204_NO_CONTENT,
)
def delete_venta_detalle(venta_detalle_id: int, conn=Depends(get_db)):
    if not VentaDetalleConnection(conn).delete(venta_detalle_id):
        raise HTTPException(status_code=404, detail="Detalle de venta no encontrado")


@app.get(
    "/api/pagos",
    response_model=List[PagoOut],
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def list_pagos(cliente_id: Optional[int] = Query(None), conn=Depends(get_db)):
    rows = PagoConnection(conn).list_all(cliente_id=cliente_id)
    return [PagoOut.from_row(row) for row in rows]


@app.get(
    "/api/pagos/{pago_id}",
    response_model=PagoOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def get_pago(pago_id: int, conn=Depends(get_db)):
    row = PagoConnection(conn).get_by_id(pago_id)
    if not row:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return PagoOut.from_row(row)


@app.post(
    "/api/pagos",
    response_model=PagoOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_201_CREATED,
)
def create_pago(pago: PagoCreateSchema, conn=Depends(get_db)):
    if not ClienteConnection(conn).get_by_id(pago.cliente_id):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    row = PagoConnection(conn).create(
        cliente_id=pago.cliente_id,
        monto_pagado=pago.monto_pagado,
        metodo_pago=pago.metodo_pago,
        fecha_pago=pago.fecha_pago,
    )
    return PagoOut.from_row(row)


@app.put(
    "/api/pagos/{pago_id}",
    response_model=PagoOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def update_pago(pago_id: int, pago: PagoUpdateSchema, conn=Depends(get_db)):
    repo = PagoConnection(conn)
    if not repo.get_by_id(pago_id):
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    fields = pago.model_dump(exclude_unset=True)
    if "cliente_id" in fields and not ClienteConnection(conn).get_by_id(fields["cliente_id"]):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    row = repo.update(pago_id, fields)
    return PagoOut.from_row(row)


@app.delete(
    "/api/pagos/{pago_id}",
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_204_NO_CONTENT,
)
def delete_pago(pago_id: int, conn=Depends(get_db)):
    if not PagoConnection(conn).delete(pago_id):
        raise HTTPException(status_code=404, detail="Pago no encontrado")


@app.get(
    "/api/pago-aplicaciones",
    response_model=List[PagoAplicacionOut],
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def list_pago_aplicaciones(
    pago_id: Optional[int] = Query(None),
    deuda_id: Optional[int] = Query(None),
    conn=Depends(get_db),
):
    rows = PagoAplicacionConnection(conn).list_all(pago_id=pago_id, deuda_id=deuda_id)
    return [PagoAplicacionOut.from_row(row) for row in rows]


@app.get(
    "/api/pago-aplicaciones/{pago_aplicacion_id}",
    response_model=PagoAplicacionOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def get_pago_aplicacion(pago_aplicacion_id: int, conn=Depends(get_db)):
    row = PagoAplicacionConnection(conn).get_by_id(pago_aplicacion_id)
    if not row:
        raise HTTPException(status_code=404, detail="Aplicación de pago no encontrada")
    return PagoAplicacionOut.from_row(row)


@app.post(
    "/api/pago-aplicaciones",
    response_model=PagoAplicacionOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_201_CREATED,
)
def create_pago_aplicacion(aplicacion: PagoAplicacionCreateSchema, conn=Depends(get_db)):
    if not PagoConnection(conn).get_by_id(aplicacion.pago_id):
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    if not DeudaConnection(conn).get_by_id(aplicacion.deuda_id):
        raise HTTPException(status_code=404, detail="Deuda no encontrada")

    row = PagoAplicacionConnection(conn).create(
        pago_id=aplicacion.pago_id,
        deuda_id=aplicacion.deuda_id,
        monto_aplicado=aplicacion.monto_aplicado,
    )
    return PagoAplicacionOut.from_row(row)


@app.put(
    "/api/pago-aplicaciones/{pago_aplicacion_id}",
    response_model=PagoAplicacionOut,
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_200_OK,
)
def update_pago_aplicacion(pago_aplicacion_id: int, aplicacion: PagoAplicacionUpdateSchema, conn=Depends(get_db)):
    repo = PagoAplicacionConnection(conn)
    if not repo.get_by_id(pago_aplicacion_id):
        raise HTTPException(status_code=404, detail="Aplicación de pago no encontrada")

    fields = aplicacion.model_dump(exclude_unset=True)
    row = repo.update(pago_aplicacion_id, fields)
    return PagoAplicacionOut.from_row(row)


@app.delete(
    "/api/pago-aplicaciones/{pago_aplicacion_id}",
    dependencies=[Depends(get_current_active_user)],
    status_code=HTTP_204_NO_CONTENT,
)
def delete_pago_aplicacion(pago_aplicacion_id: int, conn=Depends(get_db)):
    if not PagoAplicacionConnection(conn).delete(pago_aplicacion_id):
        raise HTTPException(status_code=404, detail="Aplicación de pago no encontrada")


if __name__ == "__main__":
    import os

    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
