import json
from datetime import datetime, timezone

from app.database import get_connection
from app.models import ConfigSummary, StoredConfig, TenantConfig


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def save_config(config: TenantConfig) -> StoredConfig:
    timestamp = _now()
    payload = config.model_dump_json(by_alias=True)

    with get_connection() as connection:
        existing = connection.execute(
            "SELECT created_at FROM configs WHERE id = ?", (config.id,)
        ).fetchone()
        created_at = existing["created_at"] if existing else timestamp
        connection.execute(
            """
            INSERT INTO configs (id, brand_name, payload, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              brand_name = excluded.brand_name,
              payload = excluded.payload,
              updated_at = excluded.updated_at
            """,
            (config.id, config.brand.name, payload, created_at, timestamp),
        )

    return StoredConfig(
        id=config.id,
        config=config,
        createdAt=datetime.fromisoformat(created_at),
        updatedAt=datetime.fromisoformat(timestamp),
    )


def list_configs() -> list[ConfigSummary]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT id, brand_name, updated_at FROM configs ORDER BY updated_at DESC"
        ).fetchall()

    return [
        ConfigSummary(
            id=row["id"],
            brandName=row["brand_name"],
            updatedAt=datetime.fromisoformat(row["updated_at"]),
        )
        for row in rows
    ]


def get_config(config_id: str) -> StoredConfig | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM configs WHERE id = ?", (config_id,)
        ).fetchone()

    if row is None:
        return None

    return StoredConfig(
        id=row["id"],
        config=TenantConfig.model_validate(json.loads(row["payload"])),
        createdAt=datetime.fromisoformat(row["created_at"]),
        updatedAt=datetime.fromisoformat(row["updated_at"]),
    )


def delete_config(config_id: str) -> bool:
    with get_connection() as connection:
        cursor = connection.execute("DELETE FROM configs WHERE id = ?", (config_id,))
        return cursor.rowcount > 0
