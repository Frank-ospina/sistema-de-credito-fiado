import os

from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("PGNAMEDATABASE", "sistema_credito_fiado")
DB_USER = os.getenv("PGUSER", "postgres")
DB_HOST = os.getenv("PGHOST", "localhost")
DB_PASSWORD = os.getenv("PGPASSWORD", "")
DB_PORT = os.getenv("PGPORT", "5432")

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
