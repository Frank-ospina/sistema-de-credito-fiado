from typing import Optional


class PagoAplicacionConnection:
    """Operaciones CRUD sobre la tabla `pago_aplicaciones` usando SQL crudo."""

    def __init__(self, conn):
        self.conn = conn

    def create(self, pago_id: int, deuda_id: int, monto_aplicado: float) -> dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO pago_aplicaciones (pago_id, deuda_id, monto_aplicado)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (pago_id, deuda_id, monto_aplicado),
            )
            self.conn.commit()
            return cur.fetchone()

    def get_by_id(self, pago_aplicacion_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM pago_aplicaciones WHERE id = %s", (pago_aplicacion_id,))
            return cur.fetchone()

    def list_all(self, pago_id: Optional[int] = None, deuda_id: Optional[int] = None) -> list:
        with self.conn.cursor() as cur:
            if pago_id is not None:
                cur.execute("SELECT * FROM pago_aplicaciones WHERE pago_id = %s ORDER BY id", (pago_id,))
            elif deuda_id is not None:
                cur.execute("SELECT * FROM pago_aplicaciones WHERE deuda_id = %s ORDER BY id", (deuda_id,))
            else:
                cur.execute("SELECT * FROM pago_aplicaciones ORDER BY id")
            return cur.fetchall()

    def update(self, pago_aplicacion_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `pago_aplicaciones`."""
        if not fields:
            return self.get_by_id(pago_aplicacion_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [pago_aplicacion_id]
        with self.conn.cursor() as cur:
            cur.execute(
                f"UPDATE pago_aplicaciones SET {assignments} WHERE id = %s RETURNING *",
                values,
            )
            self.conn.commit()
            return cur.fetchone()

    def delete(self, pago_aplicacion_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM pago_aplicaciones WHERE id = %s", (pago_aplicacion_id,))
            self.conn.commit()
            return cur.rowcount > 0
