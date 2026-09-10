from typing import Optional


class VentaDetalleConnection:
    """Operaciones CRUD sobre la tabla `venta_detalles` usando SQL crudo."""

    def __init__(self, conn):
        self.conn = conn

    def create(self, deuda_id: int, producto_id: int, cantidad: int, precio_unitario_venta: float) -> dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO venta_detalles (deuda_id, producto_id, cantidad, precio_unitario_venta)
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (deuda_id, producto_id, cantidad, precio_unitario_venta),
            )
            self.conn.commit()
            return cur.fetchone()

    def get_by_id(self, venta_detalle_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM venta_detalles WHERE id = %s", (venta_detalle_id,))
            return cur.fetchone()

    def list_all(self, deuda_id: Optional[int] = None) -> list:
        with self.conn.cursor() as cur:
            if deuda_id is not None:
                cur.execute("SELECT * FROM venta_detalles WHERE deuda_id = %s ORDER BY id", (deuda_id,))
            else:
                cur.execute("SELECT * FROM venta_detalles ORDER BY id")
            return cur.fetchall()

    def update(self, venta_detalle_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `venta_detalles`."""
        if not fields:
            return self.get_by_id(venta_detalle_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [venta_detalle_id]
        with self.conn.cursor() as cur:
            cur.execute(
                f"UPDATE venta_detalles SET {assignments} WHERE id = %s RETURNING *",
                values,
            )
            self.conn.commit()
            return cur.fetchone()

    def delete(self, venta_detalle_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM venta_detalles WHERE id = %s", (venta_detalle_id,))
            self.conn.commit()
            return cur.rowcount > 0
