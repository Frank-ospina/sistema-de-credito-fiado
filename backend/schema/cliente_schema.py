from typing import Optional

from pydantic import BaseModel


class ClienteBase(BaseModel):
    nombre: str
    telefono: str
    direccion: Optional[str] = None


class ClienteCreateSchema(ClienteBase):
    class Config:
        json_schema_extra = {"example": {"nombre": "María Fernanda Ríos", "telefono": "300-456-7890", "direccion": "Cra 45 # 23-12"}}


class ClienteUpdateSchema(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClienteOut(ClienteBase):
    id: int

    @classmethod
    def from_row(cls, row: dict) -> "ClienteOut":
        return cls(
            id=row["id"],
            nombre=row["nombre"],
            telefono=row["telefono"],
            direccion=row.get("direccion"),
        )
