from typing import Optional

from pydantic import BaseModel, Field


class PagoAplicacionBase(BaseModel):
    pago_id: int
    deuda_id: int
    monto_aplicado: float = Field(..., ge=0)


class PagoAplicacionCreateSchema(PagoAplicacionBase):
    pass


class PagoAplicacionUpdateSchema(BaseModel):
    monto_aplicado: Optional[float] = Field(None, ge=0)


class PagoAplicacionOut(PagoAplicacionBase):
    id: int

    @classmethod
    def from_row(cls, row: dict) -> "PagoAplicacionOut":
        return cls(
            id=row["id"],
            pago_id=row["pago_id"],
            deuda_id=row["deuda_id"],
            monto_aplicado=float(row["monto_aplicado"]),
        )
