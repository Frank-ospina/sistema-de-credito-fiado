from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PagoBase(BaseModel):
    cliente_id: int
    monto_pagado: float = Field(..., ge=0)
    metodo_pago: str


class PagoCreateSchema(PagoBase):
    fecha_pago: Optional[datetime] = None


class PagoUpdateSchema(BaseModel):
    cliente_id: Optional[int] = None
    monto_pagado: Optional[float] = Field(None, ge=0)
    metodo_pago: Optional[str] = None
    fecha_pago: Optional[datetime] = None


class PagoOut(PagoBase):
    id: int
    fecha_pago: datetime

    @classmethod
    def from_row(cls, row: dict) -> "PagoOut":
        return cls(
            id=row["id"],
            cliente_id=row["cliente_id"],
            monto_pagado=float(row["monto_pagado"]),
            metodo_pago=row["metodo_pago"],
            fecha_pago=row["fecha_pago"],
        )
