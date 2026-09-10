from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PagoAplicacionCreateSchema(BaseModel):
    pago_id: int
    deuda_id: int
    monto_aplicado: float = Field(..., ge=0)


class PagoAplicacionUpdateSchema(BaseModel):
    monto_aplicado: Optional[float] = Field(None, ge=0)


class PagoAplicacionOut(BaseModel):
    id: int
    pago_id: int
    deuda_id: int
    monto_aplicado: float
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_row(cls, row: dict) -> "PagoAplicacionOut":
        return cls(
            id=row["id"],
            pago_id=row["pago_id"],
            deuda_id=row["deuda_id"],
            monto_aplicado=float(row["monto_aplicado"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
