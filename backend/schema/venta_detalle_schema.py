from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class VentaDetalleCreateSchema(BaseModel):
    deuda_id: int
    producto_id: int
    cantidad: int = Field(..., gt=0)
    precio_unitario_venta: float = Field(..., ge=0)


class VentaDetalleUpdateSchema(BaseModel):
    cantidad: Optional[int] = Field(None, gt=0)
    precio_unitario_venta: Optional[float] = Field(None, ge=0)


class VentaDetalleOut(BaseModel):
    id: int
    deuda_id: int
    producto_id: int
    cantidad: int
    precio_unitario_venta: float
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_row(cls, row: dict) -> "VentaDetalleOut":
        return cls(
            id=row["id"],
            deuda_id=row["deuda_id"],
            producto_id=row["producto_id"],
            cantidad=row["cantidad"],
            precio_unitario_venta=float(row["precio_unitario_venta"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
