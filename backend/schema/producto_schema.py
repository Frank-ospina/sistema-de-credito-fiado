from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductoBase(BaseModel):
    nombre: str
    precio_actual: float = Field(..., ge=0)


class ProductoCreateSchema(ProductoBase):
    class Config:
        json_schema_extra = {"example": {"nombre": "Leche entera 1L", "precio_actual": 3200}}


class ProductoUpdateSchema(BaseModel):
    nombre: Optional[str] = None
    precio_actual: Optional[float] = Field(None, ge=0)


class ProductoOut(ProductoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_row(cls, row: dict) -> "ProductoOut":
        return cls(
            id=row["id"],
            nombre=row["nombre"],
            precio_actual=float(row["precio_actual"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
