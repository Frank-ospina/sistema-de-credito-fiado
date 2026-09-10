from typing import Optional


class ProductoConnection:
    """Operaciones CRUD sobre la tabla `productos` usando SQL crudo."""

    def __init__(self, conn):
        self.conn = conn

    def create(self, nombre: str, precio_actual: float) -> dict:
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO productos (nombre, precio_actual) VALUES (%s, %s) RETURNING *",
                (nombre, precio_actual),
            )
            self.conn.commit()
            return cur.fetchone()

    def get_by_id(self, producto_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM productos WHERE id = %s", (producto_id,))
            return cur.fetchone()

    def list_all(self) -> list:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM productos ORDER BY nombre")
            return cur.fetchall()

    def update(self, producto_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `productos`."""
        if not fields:
            return self.get_by_id(producto_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [producto_id]
        with self.conn.cursor() as cur:
            cur.execute(
                f"UPDATE productos SET {assignments} WHERE id = %s RETURNING *",
                values,
            )
            self.conn.commit()
            return cur.fetchone()

    def delete(self, producto_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM productos WHERE id = %s", (producto_id,))
            self.conn.commit()
            return cur.rowcount > 0
