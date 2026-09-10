from typing import Optional

_SELECT_CON_APLICADO = """
    SELECT d.*, COALESCE(SUM(pa.monto_aplicado), 0) AS monto_aplicado
    FROM deudas d
    LEFT JOIN pago_aplicaciones pa ON pa.deuda_id = d.id
"""


class DeudaConnection:
    """Operaciones CRUD sobre la tabla `deudas` usando SQL crudo.

    `monto_total` se recalcula automáticamente en la base de datos (trigger
    `recalcular_monto_total_deuda`) a partir de sus `venta_detalles`, por lo
    que nunca se recibe ni se actualiza directamente desde aquí.
    """

    def __init__(self, conn):
        self.conn = conn

    def create(self, cliente_id: int, fecha_fiado=None) -> dict:
        with self.conn.cursor() as cur:
            if fecha_fiado is not None:
                cur.execute(
                    "INSERT INTO deudas (cliente_id, fecha_fiado) VALUES (%s, %s) RETURNING id",
                    (cliente_id, fecha_fiado),
                )
            else:
                cur.execute("INSERT INTO deudas (cliente_id) VALUES (%s) RETURNING id", (cliente_id,))
            new_id = cur.fetchone()["id"]
            self.conn.commit()
        return self.get_by_id(new_id)

    def get_by_id(self, deuda_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute(_SELECT_CON_APLICADO + " WHERE d.id = %s GROUP BY d.id", (deuda_id,))
            return cur.fetchone()

    def list_all(self, cliente_id: Optional[int] = None) -> list:
        with self.conn.cursor() as cur:
            if cliente_id is not None:
                cur.execute(
                    _SELECT_CON_APLICADO + " WHERE d.cliente_id = %s GROUP BY d.id ORDER BY d.fecha_fiado DESC",
                    (cliente_id,),
                )
            else:
                cur.execute(_SELECT_CON_APLICADO + " GROUP BY d.id ORDER BY d.fecha_fiado DESC")
            return cur.fetchall()

    def update(self, deuda_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `deudas`
        (cliente_id, fecha_fiado); `monto_total` no es editable directamente."""
        if not fields:
            return self.get_by_id(deuda_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [deuda_id]
        with self.conn.cursor() as cur:
            cur.execute(f"UPDATE deudas SET {assignments} WHERE id = %s", values)
            self.conn.commit()
        return self.get_by_id(deuda_id)

    def delete(self, deuda_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM deudas WHERE id = %s", (deuda_id,))
            self.conn.commit()
            return cur.rowcount > 0
