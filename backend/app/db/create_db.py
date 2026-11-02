"""Creates the target PostgreSQL database if it does not already exist.

Run with:  python -m app.db.create_db
"""

import asyncio
from urllib.parse import urlparse

import asyncpg

from app.core.config import settings


async def create_database_if_missing() -> None:
    parsed = urlparse(settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"))
    target_db = parsed.path.lstrip("/")

    conn = await asyncpg.connect(
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
        database="postgres",
    )
    try:
        exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", target_db)
        if exists:
            print(f"Database '{target_db}' already exists.")
        else:
            await conn.execute(f'CREATE DATABASE "{target_db}"')
            print(f"Database '{target_db}' created.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(create_database_if_missing())
