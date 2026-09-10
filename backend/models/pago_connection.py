from typing import Optional

_SELECT_CON_APLICADO = """
    SELECT p.*, COALESCE(SUM(pa.monto_aplicado), 0) AS monto_aplicado
    FROM pagos p
    LEFT JOIN pago_aplicaciones pa ON pa.pago_id = p.id
"""


class PagoConnection:
    """Operaciones CRUD sobre la tabla `pagos` usando SQL crudo."""

    def __init__(self, conn):
        self.conn = conn

    def create(self, cliente_id: int, monto_pagado: float, metodo_pago: str, fecha_pago=None) -> dict:
        with self.conn.cursor() as cur:
            if fecha_pago is not None:
                cur.execute(
                    """
                    INSERT INTO pagos (cliente_id, monto_pagado, metodo_pago, fecha_pago)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                    """,
                    (cliente_id, monto_pagado, metodo_pago, fecha_pago),
                )
            else:
                cur.execute(
                    """
                    INSERT INTO pagos (cliente_id, monto_pagado, metodo_pago)
                    VALUES (%s, %s, %s)
                    RETURNING id
                    """,
                    (cliente_id, monto_pagado, metodo_pago),
                )
            new_id = cur.fetchone()["id"]
            self.conn.commit()
        return self.get_by_id(new_id)

    def get_by_id(self, pago_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute(_SELECT_CON_APLICADO + " WHERE p.id = %s GROUP BY p.id", (pago_id,))
            return cur.fetchone()

    def list_all(self, cliente_id: Optional[int] = None) -> list:
        with self.conn.cursor() as cur:
            if cliente_id is not None:
                cur.execute(
                    _SELECT_CON_APLICADO + " WHERE p.cliente_id = %s GROUP BY p.id ORDER BY p.fecha_pago DESC",
                    (cliente_id,),
                )
            else:
                cur.execute(_SELECT_CON_APLICADO + " GROUP BY p.id ORDER BY p.fecha_pago DESC")
            return cur.fetchall()

    def update(self, pago_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `pagos`."""
        if not fields:
            return self.get_by_id(pago_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [pago_id]
        with self.conn.cursor() as cur:
            cur.execute(f"UPDATE pagos SET {assignments} WHERE id = %s", values)
            self.conn.commit()
        return self.get_by_id(pago_id)

    def delete(self, pago_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM pagos WHERE id = %s", (pago_id,))
            self.conn.commit()
            return cur.rowcount > 0
