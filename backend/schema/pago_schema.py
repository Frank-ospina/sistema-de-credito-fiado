from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PagoCreateSchema(BaseModel):
    cliente_id: int
    monto_pagado: float = Field(..., ge=0)
    metodo_pago: str
    fecha_pago: Optional[datetime] = None


class PagoUpdateSchema(BaseModel):
    cliente_id: Optional[int] = None
    monto_pagado: Optional[float] = Field(None, ge=0)
    metodo_pago: Optional[str] = None
    fecha_pago: Optional[datetime] = None


class PagoOut(BaseModel):
    id: int
    cliente_id: int
    monto_pagado: float
    monto_aplicado: float
    saldo_disponible: float
    metodo_pago: str
    fecha_pago: datetime
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_row(cls, row: dict) -> "PagoOut":
        monto_pagado = float(row["monto_pagado"])
        monto_aplicado = float(row.get("monto_aplicado", 0) or 0)
        return cls(
            id=row["id"],
            cliente_id=row["cliente_id"],
            monto_pagado=monto_pagado,
            monto_aplicado=monto_aplicado,
            saldo_disponible=max(0.0, monto_pagado - monto_aplicado),
            metodo_pago=row["metodo_pago"],
            fecha_pago=row["fecha_pago"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
