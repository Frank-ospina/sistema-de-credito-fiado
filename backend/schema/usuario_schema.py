from typing import Literal, Optional

from pydantic import BaseModel, Field

RolUsuario = Literal["admin", "vendedor"]


class UsuarioBase(BaseModel):
    nombre: str
    username: str
    rol: RolUsuario
    activo: bool = True


class UsuarioCreateSchema(UsuarioBase):
    password: str = Field(..., min_length=6)

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Ana Pérez",
                "username": "ana",
                "password": "clave123",
                "rol": "vendedor",
                "activo": True,
            }
        }


class UsuarioUpdateSchema(BaseModel):
    nombre: Optional[str] = None
    username: Optional[str] = None
    rol: Optional[RolUsuario] = None
    activo: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6)


class UsuarioOut(UsuarioBase):
    id: str
    created_at: str

    @classmethod
    def from_row(cls, row: dict) -> "UsuarioOut":
        return cls(
            id=str(row["id"]),
            nombre=row["nombre"],
            username=row["username"],
            rol=row["rol"],
            activo=row["activo"],
            created_at=row["created_at"].isoformat(),
        )
