from typing import Optional

from pydantic import BaseModel, Field


class VentaDetalleBase(BaseModel):
    deuda_id: int
    producto_id: int
    cantidad: int = Field(..., gt=0)
    precio_unitario_venta: float = Field(..., ge=0)


class VentaDetalleCreateSchema(VentaDetalleBase):
    pass


class VentaDetalleUpdateSchema(BaseModel):
    cantidad: Optional[int] = Field(None, gt=0)
    precio_unitario_venta: Optional[float] = Field(None, ge=0)


class VentaDetalleOut(VentaDetalleBase):
    id: int

    @classmethod
    def from_row(cls, row: dict) -> "VentaDetalleOut":
        return cls(
            id=row["id"],
            deuda_id=row["deuda_id"],
            producto_id=row["producto_id"],
            cantidad=row["cantidad"],
            precio_unitario_venta=float(row["precio_unitario_venta"]),
        )
