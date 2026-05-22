from typing import Any

from pydantic import ValidationError

from app.models import TenantConfig, ValidationResult


def format_validation_errors(error: ValidationError) -> list[str]:
    messages: list[str] = []

    for item in error.errors():
        location = ".".join(str(part) for part in item["loc"])
        messages.append(f"{location}: {item['msg']}")

    return messages


def validate_config_payload(payload: dict[str, Any]) -> tuple[TenantConfig | None, ValidationResult]:
    try:
        config = TenantConfig.model_validate(payload)
    except ValidationError as error:
        return None, ValidationResult(valid=False, errors=format_validation_errors(error))

    return config, ValidationResult(valid=True, errors=[])
