import bcrypt
import jwt
import uuid
from datetime import datetime, timedelta
from fastapi import HTTPException, Header
from typing import Optional

SECRET_KEY = "shopease-jwt-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
VIEW_TOKEN_EXPIRE_HOURS = 1


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "iat": datetime.utcnow()}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        return int(user_id_str)
    except jwt.PyJWTError:
        return None


def create_view_token(product_id: int) -> str:
    expire = datetime.utcnow() + timedelta(hours=VIEW_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(product_id), "exp": expire, "jti": str(uuid.uuid4())}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_view_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        pid = payload.get("sub")
        return int(pid) if pid else None
    except jwt.PyJWTError:
        return None
