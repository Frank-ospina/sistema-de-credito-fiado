from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_409_CONFLICT

from auth.auth import get_current_active_user, get_current_admin_user, get_password_hash
from auth.auth_routes import router as auth_router
from config import ALLOWED_ORIGINS
from database.database import get_db
from models.producto_connection import ProductoConnection
from models.usuario_connection import UsuarioConnection
from schema.producto_schema import ProductoCreateSchema, ProductoOut, ProductoUpdateSchema
from schema.usuario_schema import UsuarioCreateSchema, UsuarioOut, UsuarioUpdateSchema

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


if __name__ == "__main__":
    import os

    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
