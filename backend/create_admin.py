"""Crea o actualiza el usuario administrador inicial.

Uso:
    python create_admin.py <username> <password> <nombre>
"""

import sys

import psycopg2
from psycopg2.extras import RealDictCursor

from auth.auth import get_password_hash
from database.database import DATABASE_URL
from models.usuario_connection import UsuarioConnection


def main() -> None:
    if len(sys.argv) != 4:
        print("Uso: python create_admin.py <username> <password> <nombre>")
        raise SystemExit(1)

    username, password, nombre = sys.argv[1:4]
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        repo = UsuarioConnection(conn)
        password_hash = get_password_hash(password)
        existente = repo.get_by_username(username)
        if existente:
            repo.update(
                str(existente["id"]),
                {"password_hash": password_hash, "nombre": nombre, "rol": "admin", "activo": True},
            )
            print(f"Usuario '{username}' actualizado como admin.")
        else:
            repo.create(nombre=nombre, username=username, password_hash=password_hash, rol="admin", activo=True)
            print(f"Usuario admin '{username}' creado.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
