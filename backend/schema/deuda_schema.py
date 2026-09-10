from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DeudaBase(BaseModel):
    cliente_id: int
    monto_total: float = Field(..., ge=0)


class DeudaCreateSchema(DeudaBase):
    fecha_fiado: Optional[datetime] = None


class DeudaUpdateSchema(BaseModel):
    cliente_id: Optional[int] = None
    monto_total: Optional[float] = Field(None, ge=0)
    fecha_fiado: Optional[datetime] = None


class DeudaOut(DeudaBase):
    id: int
    fecha_fiado: datetime

    @classmethod
    def from_row(cls, row: dict) -> "DeudaOut":
        return cls(
            id=row["id"],
            cliente_id=row["cliente_id"],
            monto_total=float(row["monto_total"]),
            fecha_fiado=row["fecha_fiado"],
        )
