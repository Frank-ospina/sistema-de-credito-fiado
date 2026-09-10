from typing import Optional


class DeudaConnection:
    """Operaciones CRUD sobre la tabla `deudas` usando SQL crudo."""

    def __init__(self, conn):
        self.conn = conn

    def create(self, cliente_id: int, monto_total: float, fecha_fiado=None) -> dict:
        with self.conn.cursor() as cur:
            if fecha_fiado is not None:
                cur.execute(
                    "INSERT INTO deudas (cliente_id, monto_total, fecha_fiado) VALUES (%s, %s, %s) RETURNING *",
                    (cliente_id, monto_total, fecha_fiado),
                )
            else:
                cur.execute(
                    "INSERT INTO deudas (cliente_id, monto_total) VALUES (%s, %s) RETURNING *",
                    (cliente_id, monto_total),
                )
            self.conn.commit()
            return cur.fetchone()

    def get_by_id(self, deuda_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM deudas WHERE id = %s", (deuda_id,))
            return cur.fetchone()

    def list_all(self, cliente_id: Optional[int] = None) -> list:
        with self.conn.cursor() as cur:
            if cliente_id is not None:
                cur.execute("SELECT * FROM deudas WHERE cliente_id = %s ORDER BY fecha_fiado DESC", (cliente_id,))
            else:
                cur.execute("SELECT * FROM deudas ORDER BY fecha_fiado DESC")
            return cur.fetchall()

    def update(self, deuda_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `deudas`."""
        if not fields:
            return self.get_by_id(deuda_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [deuda_id]
        with self.conn.cursor() as cur:
            cur.execute(
                f"UPDATE deudas SET {assignments} WHERE id = %s RETURNING *",
                values,
            )
            self.conn.commit()
            return cur.fetchone()

    def delete(self, deuda_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM deudas WHERE id = %s", (deuda_id,))
            self.conn.commit()
            return cur.rowcount > 0
