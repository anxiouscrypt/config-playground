from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class BrandConfig(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    logoUrl: str = ""
    primaryColor: str
    secondaryColor: str

    @field_validator("primaryColor", "secondaryColor")
    @classmethod
    def validate_hex_color(cls, value: str) -> str:
        if len(value) != 7 or not value.startswith("#"):
            raise ValueError("must be a 7-character hex color like #134733")

        try:
            int(value[1:], 16)
        except ValueError as exc:
            raise ValueError("must be a valid hex color") from exc

        return value


class FeatureFlags(BaseModel):
    mobileOrdering: bool
    loyalty: bool
    orderTracking: bool
    guestCheckout: bool


class MenuCategory(BaseModel):
    id: str = Field(min_length=1, max_length=60)
    name: str = Field(min_length=1, max_length=80)
    items: list[str] = Field(min_length=1)

    @field_validator("items")
    @classmethod
    def validate_items(cls, value: list[str]) -> list[str]:
        if any(not item.strip() for item in value):
            raise ValueError("items cannot contain blank names")
        return value


class MenuConfig(BaseModel):
    categories: list[MenuCategory] = Field(min_length=1)


class TenantConfig(BaseModel):
    id: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z0-9_-]+$")
    brand: BrandConfig
    features: FeatureFlags
    navigation: list[str] = Field(min_length=1, max_length=6)
    menu: MenuConfig

    @field_validator("navigation")
    @classmethod
    def validate_navigation(cls, value: list[str]) -> list[str]:
        if any(not item.strip() for item in value):
            raise ValueError("navigation labels cannot be blank")
        return value


class ValidateConfigRequest(BaseModel):
    config: dict[str, Any]


class ValidationResult(BaseModel):
    valid: bool
    errors: list[str]


class ConfigSummary(BaseModel):
    id: str
    brandName: str
    updatedAt: datetime


class StoredConfig(BaseModel):
    id: str
    config: TenantConfig
    createdAt: datetime
    updatedAt: datetime
