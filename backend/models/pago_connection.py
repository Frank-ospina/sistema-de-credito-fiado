from typing import Optional


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
                    RETURNING *
                    """,
                    (cliente_id, monto_pagado, metodo_pago, fecha_pago),
                )
            else:
                cur.execute(
                    """
                    INSERT INTO pagos (cliente_id, monto_pagado, metodo_pago)
                    VALUES (%s, %s, %s)
                    RETURNING *
                    """,
                    (cliente_id, monto_pagado, metodo_pago),
                )
            self.conn.commit()
            return cur.fetchone()

    def get_by_id(self, pago_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM pagos WHERE id = %s", (pago_id,))
            return cur.fetchone()

    def list_all(self, cliente_id: Optional[int] = None) -> list:
        with self.conn.cursor() as cur:
            if cliente_id is not None:
                cur.execute("SELECT * FROM pagos WHERE cliente_id = %s ORDER BY fecha_pago DESC", (cliente_id,))
            else:
                cur.execute("SELECT * FROM pagos ORDER BY fecha_pago DESC")
            return cur.fetchall()

    def update(self, pago_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `pagos`."""
        if not fields:
            return self.get_by_id(pago_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [pago_id]
        with self.conn.cursor() as cur:
            cur.execute(
                f"UPDATE pagos SET {assignments} WHERE id = %s RETURNING *",
                values,
            )
            self.conn.commit()
            return cur.fetchone()

    def delete(self, pago_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM pagos WHERE id = %s", (pago_id,))
            self.conn.commit()
            return cur.rowcount > 0
