from typing import Any

from fastapi import APIRouter, Body, HTTPException

from app.models import ConfigSummary, StoredConfig, ValidateConfigRequest, ValidationResult
from app.services.config_store import delete_config, get_config, list_configs, save_config
from app.services.validation import validate_config_payload

router = APIRouter(prefix="/configs", tags=["configs"])


@router.post("/validate", response_model=ValidationResult)
def validate_config(request: ValidateConfigRequest) -> ValidationResult:
    _, result = validate_config_payload(request.config)
    return result


@router.post("", response_model=StoredConfig)
def create_or_update_config(payload: dict[str, Any] = Body(...)) -> StoredConfig:
    config, result = validate_config_payload(payload)

    if config is None:
        raise HTTPException(status_code=422, detail=result.errors)

    return save_config(config)


@router.get("", response_model=list[ConfigSummary])
def read_configs() -> list[ConfigSummary]:
    return list_configs()


@router.get("/{config_id}", response_model=StoredConfig)
def read_config(config_id: str) -> StoredConfig:
    config = get_config(config_id)

    if config is None:
        raise HTTPException(status_code=404, detail="Config not found")

    return config


@router.delete("/{config_id}", status_code=204)
def remove_config(config_id: str) -> None:
    deleted = delete_config(config_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Config not found")
