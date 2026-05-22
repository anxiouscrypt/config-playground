from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


def _validate_color(value: str) -> str:
    if value.startswith("#") and len(value) == 7:
        try:
            int(value[1:], 16)
        except ValueError as exc:
            raise ValueError("must be a valid hex color") from exc
        return value

    if value.startswith("rgba(") and value.endswith(")"):
        return value

    raise ValueError("must be a hex color like #1E1B18 or an rgba() value")


class BuilderClient(BaseModel):
    clientId: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z0-9_-]+$")
    clientName: str = Field(min_length=1, max_length=120)
    ownerEmail: str = Field(min_length=3, max_length=160)
    ownerName: str = Field(min_length=1, max_length=120)

    @field_validator("ownerEmail")
    @classmethod
    def validate_owner_email(cls, value: str) -> str:
        if "@" not in value or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("must be a valid owner email")
        return value


class AppConfigBrand(BaseModel):
    brandId: str = Field(min_length=1, max_length=80)
    brandName: str = Field(min_length=1, max_length=120)
    locationId: str = Field(min_length=1, max_length=80)
    locationName: str = Field(min_length=1, max_length=120)
    marketLabel: str = Field(min_length=1, max_length=120)


class AppConfigTheme(BaseModel):
    background: str
    backgroundAlt: str
    surface: str
    surfaceMuted: str
    foreground: str
    foregroundMuted: str
    muted: str
    border: str
    primary: str
    accent: str
    fontFamily: str | None = None
    displayFontFamily: str | None = None

    @field_validator(
        "background",
        "backgroundAlt",
        "surface",
        "surfaceMuted",
        "foreground",
        "foregroundMuted",
        "muted",
        "border",
        "primary",
        "accent",
    )
    @classmethod
    def validate_colors(cls, value: str) -> str:
        return _validate_color(value)


class AppConfigHeader(BaseModel):
    background: str
    foreground: str | None = None

    @field_validator("background", "foreground")
    @classmethod
    def validate_colors(cls, value: str | None) -> str | None:
        return _validate_color(value) if value is not None else value


class AppConfigFeatureFlags(BaseModel):
    loyalty: bool
    pushNotifications: bool
    refunds: bool
    orderTracking: bool
    staffDashboard: bool
    menuEditing: bool


class StripeCapabilities(BaseModel):
    enabled: bool = False
    onboarded: bool = False
    dashboardEnabled: bool = False


class AppConfigPaymentCapabilities(BaseModel):
    applePay: bool
    card: bool
    cash: bool
    refunds: bool
    stripe: StripeCapabilities = Field(default_factory=StripeCapabilities)


class FulfillmentSchedule(BaseModel):
    inPrep: int = Field(ge=0)
    ready: int = Field(ge=0)
    completed: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_order(self) -> "FulfillmentSchedule":
        if self.ready <= self.inPrep:
            raise ValueError("ready must be greater than inPrep")
        if self.completed <= self.ready:
            raise ValueError("completed must be greater than ready")
        return self


FulfillmentMode = Literal["staff", "time_based"]


class AppConfigFulfillment(BaseModel):
    mode: FulfillmentMode
    timeBasedScheduleMinutes: FulfillmentSchedule


class MenuCapability(BaseModel):
    source: Literal["platform_managed", "external_sync"]


class OperationsCapability(BaseModel):
    fulfillmentMode: FulfillmentMode
    liveOrderTrackingEnabled: bool
    dashboardEnabled: bool


class LoyaltyCapability(BaseModel):
    visible: bool


class AppConfigStoreCapabilities(BaseModel):
    menu: MenuCapability
    operations: OperationsCapability
    loyalty: LoyaltyCapability


class AppConfig(BaseModel):
    brand: AppConfigBrand
    theme: AppConfigTheme
    header: AppConfigHeader
    enabledTabs: list[Literal["home", "menu", "orders", "account"]] = Field(min_length=1)
    featureFlags: AppConfigFeatureFlags
    loyaltyEnabled: bool
    paymentCapabilities: AppConfigPaymentCapabilities
    fulfillment: AppConfigFulfillment
    storeCapabilities: AppConfigStoreCapabilities

    @model_validator(mode="after")
    def validate_capability_mirror(self) -> "AppConfig":
        capabilities = self.storeCapabilities
        if self.loyaltyEnabled != capabilities.loyalty.visible:
            raise ValueError("loyaltyEnabled must match storeCapabilities.loyalty.visible")
        if self.featureFlags.loyalty != capabilities.loyalty.visible:
            raise ValueError("featureFlags.loyalty must match storeCapabilities.loyalty.visible")
        if self.featureFlags.orderTracking != capabilities.operations.liveOrderTrackingEnabled:
            raise ValueError(
                "featureFlags.orderTracking must match storeCapabilities.operations.liveOrderTrackingEnabled"
            )
        if self.featureFlags.staffDashboard != capabilities.operations.dashboardEnabled:
            raise ValueError(
                "featureFlags.staffDashboard must match storeCapabilities.operations.dashboardEnabled"
            )
        if self.fulfillment.mode != capabilities.operations.fulfillmentMode:
            raise ValueError("fulfillment.mode must match storeCapabilities.operations.fulfillmentMode")
        return self


class StoreConfig(BaseModel):
    locationId: str = Field(min_length=1)
    hoursText: str = Field(min_length=1)
    isOpen: bool
    nextOpenAt: str | None = None
    prepEtaMinutes: int = Field(gt=0)
    taxRateBasisPoints: int = Field(ge=0, le=10000)
    pickupInstructions: str = Field(min_length=1)


class MenuItem(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    description: str
    imageUrl: str | None = None
    priceCents: int = Field(ge=0)
    badgeCodes: list[str] = Field(default_factory=list)
    visible: bool


class MenuCategory(BaseModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    items: list[MenuItem] = Field(min_length=1)


class MenuResponse(BaseModel):
    locationId: str = Field(min_length=1)
    currency: Literal["USD"]
    categories: list[MenuCategory] = Field(min_length=1)


class HomeNewsCard(BaseModel):
    cardId: str = Field(min_length=1)
    label: str = Field(min_length=1)
    title: str = Field(min_length=1)
    body: str = Field(min_length=1)
    note: str | None = None
    sortOrder: int = Field(ge=0)
    visible: bool


class HomeNewsCardsResponse(BaseModel):
    locationId: str = Field(min_length=1)
    cards: list[HomeNewsCard]


class BuildConfig(BaseModel):
    appName: str = Field(min_length=1, max_length=80)
    bundleId: str = Field(min_length=3, max_length=160, pattern=r"^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z0-9-]+)+$")
    releaseChannel: Literal["preview", "app_store"]
    iconUrl: str = ""
    splashImageUrl: str = ""


class PublishState(BaseModel):
    status: Literal["draft", "validated", "published"]
    lastValidatedAt: str | None = None


class MobileBuilderProject(BaseModel):
    id: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z0-9_-]+$")
    client: BuilderClient
    appConfig: AppConfig
    storeConfig: StoreConfig
    menu: MenuResponse
    homeCards: HomeNewsCardsResponse
    build: BuildConfig
    publish: PublishState

    @model_validator(mode="after")
    def validate_location_consistency(self) -> "MobileBuilderProject":
        location_id = self.appConfig.brand.locationId
        mismatches = [
            ("storeConfig.locationId", self.storeConfig.locationId),
            ("menu.locationId", self.menu.locationId),
            ("homeCards.locationId", self.homeCards.locationId),
        ]
        for path, value in mismatches:
            if value != location_id:
                raise ValueError(f"{path} must match appConfig.brand.locationId")
        if self.client.clientName != self.appConfig.brand.brandName:
            raise ValueError("client.clientName must match appConfig.brand.brandName")
        return self


TenantConfig = MobileBuilderProject


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
    config: MobileBuilderProject
    createdAt: datetime
    updatedAt: datetime
