from typing import Optional


class ClienteConnection:
    """Operaciones CRUD sobre la tabla `clientes` usando SQL crudo."""

    def __init__(self, conn):
        self.conn = conn

    def create(self, nombre: str, telefono: str, direccion: Optional[str]) -> dict:
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO clientes (nombre, telefono, direccion) VALUES (%s, %s, %s) RETURNING *",
                (nombre, telefono, direccion),
            )
            self.conn.commit()
            return cur.fetchone()

    def get_by_id(self, cliente_id: int) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM clientes WHERE id = %s", (cliente_id,))
            return cur.fetchone()

    def list_all(self) -> list:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM clientes ORDER BY nombre")
            return cur.fetchall()

    def update(self, cliente_id: int, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `clientes`."""
        if not fields:
            return self.get_by_id(cliente_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [cliente_id]
        with self.conn.cursor() as cur:
            cur.execute(
                f"UPDATE clientes SET {assignments} WHERE id = %s RETURNING *",
                values,
            )
            self.conn.commit()
            return cur.fetchone()

    def delete(self, cliente_id: int) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM clientes WHERE id = %s", (cliente_id,))
            self.conn.commit()
            return cur.rowcount > 0
