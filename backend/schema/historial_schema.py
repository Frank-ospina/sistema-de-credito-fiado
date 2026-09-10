from typing import List

from pydantic import BaseModel

from schema.cliente_schema import ClienteOut
from schema.deuda_schema import DeudaOut
from schema.pago_aplicacion_schema import PagoAplicacionOut
from schema.pago_schema import PagoOut
from schema.venta_detalle_schema import VentaDetalleOut


class DeudaConDetalleOut(DeudaOut):
    detalles: List[VentaDetalleOut]


class PagoConAplicacionesOut(PagoOut):
    aplicaciones: List[PagoAplicacionOut]


class ClienteHistorialOut(BaseModel):
    cliente: ClienteOut
    deudas: List[DeudaConDetalleOut]
    pagos: List[PagoConAplicacionesOut]
    saldo_total: float
