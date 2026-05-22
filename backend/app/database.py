import os
import sqlite3
from pathlib import Path


def database_path() -> Path:
    database_url = os.getenv("DATABASE_URL", "sqlite:///./config_playground.db")

    if database_url.startswith("sqlite:///"):
        return Path(database_url.replace("sqlite:///", "", 1))

    return Path(database_url)


def get_connection() -> sqlite3.Connection:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS configs (
              id TEXT PRIMARY KEY,
              brand_name TEXT NOT NULL,
              payload TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            )
            """
        )
