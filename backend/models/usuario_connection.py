from typing import Optional


class UsuarioConnection:
    """Operaciones CRUD sobre la tabla `usuarios` usando SQL crudo."""

    def __init__(self, conn):
        self.conn = conn

    def create(self, nombre: str, username: str, password_hash: str, rol: str, activo: bool) -> dict:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO usuarios (nombre, username, password_hash, rol, activo)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
                """,
                (nombre, username, password_hash, rol, activo),
            )
            self.conn.commit()
            return cur.fetchone()

    def get_by_username(self, username: str) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM usuarios WHERE username = %s", (username,))
            return cur.fetchone()

    def get_by_id(self, usuario_id: str) -> Optional[dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM usuarios WHERE id = %s", (usuario_id,))
            return cur.fetchone()

    def list_all(self) -> list:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM usuarios ORDER BY created_at DESC")
            return cur.fetchall()

    def update(self, usuario_id: str, fields: dict) -> Optional[dict]:
        """`fields` debe contener únicamente claves que sean columnas válidas de `usuarios`."""
        if not fields:
            return self.get_by_id(usuario_id)
        assignments = ", ".join(f"{column} = %s" for column in fields)
        values = list(fields.values()) + [usuario_id]
        with self.conn.cursor() as cur:
            cur.execute(
                f"UPDATE usuarios SET {assignments} WHERE id = %s RETURNING *",
                values,
            )
            self.conn.commit()
            return cur.fetchone()

    def delete(self, usuario_id: str) -> bool:
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM usuarios WHERE id = %s", (usuario_id,))
            self.conn.commit()
            return cur.rowcount > 0
