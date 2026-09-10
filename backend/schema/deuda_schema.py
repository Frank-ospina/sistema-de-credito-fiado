from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

EstadoDeuda = Literal["pendiente", "parcial", "pagada"]


class DeudaCreateSchema(BaseModel):
    cliente_id: int
    fecha_fiado: Optional[datetime] = None


class DeudaUpdateSchema(BaseModel):
    cliente_id: Optional[int] = None
    fecha_fiado: Optional[datetime] = None


class DeudaOut(BaseModel):
    id: int
    cliente_id: int
    monto_total: float
    monto_aplicado: float
    saldo: float
    estado: EstadoDeuda
    fecha_fiado: datetime
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_row(cls, row: dict) -> "DeudaOut":
        monto_total = float(row["monto_total"])
        monto_aplicado = float(row.get("monto_aplicado", 0) or 0)
        saldo = max(0.0, monto_total - monto_aplicado)
        estado: EstadoDeuda = "pagada" if saldo <= 0 else ("parcial" if saldo < monto_total else "pendiente")
        return cls(
            id=row["id"],
            cliente_id=row["cliente_id"],
            monto_total=monto_total,
            monto_aplicado=monto_aplicado,
            saldo=saldo,
            estado=estado,
            fecha_fiado=row["fecha_fiado"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
