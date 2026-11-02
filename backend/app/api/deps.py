from collections.abc import AsyncGenerator

import jwt
from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cookies import ACCESS_TOKEN_COOKIE, CSRF_COOKIE
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import get_user_by_email

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
)


async def get_current_user(
    access_token: str | None = Cookie(default=None, alias=ACCESS_TOKEN_COOKIE),
    db: AsyncSession = Depends(get_db),
) -> User:
    if access_token is None:
        raise CREDENTIALS_EXCEPTION
    try:
        payload = decode_token(access_token)
        if payload.get("type") != "access":
            raise CREDENTIALS_EXCEPTION
        email: str | None = payload.get("sub")
        if email is None:
            raise CREDENTIALS_EXCEPTION
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired") from None
    except jwt.PyJWTError:
        raise CREDENTIALS_EXCEPTION from None

    user = await get_user_by_email(db, email)
    if user is None:
        raise CREDENTIALS_EXCEPTION
    return user


async def verify_csrf(
    x_csrf_token: str | None = Header(default=None),
    csrf_token: str | None = Cookie(default=None, alias=CSRF_COOKIE),
) -> None:
    if not csrf_token or not x_csrf_token or csrf_token != x_csrf_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token missing or invalid")
