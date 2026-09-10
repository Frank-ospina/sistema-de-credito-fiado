from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from database.database import get_db
from models.usuario_connection import UsuarioConnection
from schema.auth_schema import TokenData
from schema.usuario_schema import UsuarioOut

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def authenticate_user(conn, username: str, password: str) -> Optional[dict]:
    usuario = UsuarioConnection(conn).get_by_username(username)
    if not usuario:
        return None
    if not verify_password(password, usuario["password_hash"]):
        return None
    return usuario


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), conn=Depends(get_db)) -> UsuarioOut:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la credencial",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    usuario = UsuarioConnection(conn).get_by_username(token_data.username)
    if usuario is None:
        raise credentials_exception
    return UsuarioOut.from_row(usuario)


async def get_current_active_user(current_user: UsuarioOut = Depends(get_current_user)) -> UsuarioOut:
    if not current_user.activo:
        raise HTTPException(status_code=400, detail="Esta cuenta está desactivada")
    return current_user


async def get_current_admin_user(current_user: UsuarioOut = Depends(get_current_active_user)) -> UsuarioOut:
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return current_user
