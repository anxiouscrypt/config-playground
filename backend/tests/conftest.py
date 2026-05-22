import pytest
from fastapi.testclient import TestClient

from app.database import init_db
from app.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/test.db")
    init_db()

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def sample_config():
    return {
        "id": "gazelle-demo-coffee",
        "client": {
            "clientId": "demo-coffee",
            "clientName": "Demo Coffee",
            "ownerEmail": "owner@democoffee.test",
            "ownerName": "Avery Demo",
        },
        "appConfig": {
            "brand": {
                "brandId": "demo-brand",
                "brandName": "Demo Coffee",
                "locationId": "demo-location",
                "locationName": "Demo Coffee Flagship",
                "marketLabel": "Pilot Market",
            },
            "theme": {
                "background": "#F7F4ED",
                "backgroundAlt": "#F0ECE4",
                "surface": "#FFFDF8",
                "surfaceMuted": "#F3EFE7",
                "foreground": "#171513",
                "foregroundMuted": "#605B55",
                "muted": "#9B9389",
                "border": "rgba(23, 21, 19, 0.08)",
                "primary": "#1E1B18",
                "accent": "#2D6A4F",
                "fontFamily": "System",
                "displayFontFamily": "Fraunces",
            },
            "header": {"background": "#F7F4ED", "foreground": "#171513"},
            "enabledTabs": ["home", "menu", "orders", "account"],
            "featureFlags": {
                "loyalty": True,
                "pushNotifications": True,
                "refunds": True,
                "orderTracking": True,
                "staffDashboard": True,
                "menuEditing": True,
            },
            "loyaltyEnabled": True,
            "paymentCapabilities": {
                "applePay": True,
                "card": True,
                "cash": False,
                "refunds": True,
                "stripe": {
                    "enabled": False,
                    "onboarded": False,
                    "dashboardEnabled": False,
                },
            },
            "fulfillment": {
                "mode": "staff",
                "timeBasedScheduleMinutes": {"inPrep": 5, "ready": 10, "completed": 15},
            },
            "storeCapabilities": {
                "menu": {"source": "platform_managed"},
                "operations": {
                    "fulfillmentMode": "staff",
                    "liveOrderTrackingEnabled": True,
                    "dashboardEnabled": True,
                },
                "loyalty": {"visible": True},
            },
        },
        "storeConfig": {
            "locationId": "demo-location",
            "hoursText": "Daily · 7:00 AM - 6:00 PM",
            "isOpen": True,
            "nextOpenAt": None,
            "prepEtaMinutes": 12,
            "taxRateBasisPoints": 600,
            "pickupInstructions": "Pick up mobile orders at the counter.",
        },
        "menu": {
            "locationId": "demo-location",
            "currency": "USD",
            "categories": [
                {
                    "id": "coffee",
                    "title": "Coffee & Espresso",
                    "items": [
                        {
                            "id": "latte",
                            "name": "Latte",
                            "description": "Espresso with steamed milk.",
                            "priceCents": 525,
                            "badgeCodes": ["popular"],
                            "visible": True,
                        }
                    ],
                }
            ],
        },
        "homeCards": {
            "locationId": "demo-location",
            "cards": [
                {
                    "cardId": "seasonal-card",
                    "label": "Seasonal",
                    "title": "Spring espresso tonic",
                    "body": "A bright rotating drink for the pilot menu.",
                    "note": "Available this week",
                    "sortOrder": 0,
                    "visible": True,
                }
            ],
        },
        "build": {
            "appName": "Demo Coffee",
            "bundleId": "com.gazelle.demo.coffee",
            "releaseChannel": "preview",
            "iconUrl": "",
            "splashImageUrl": "",
        },
        "publish": {"status": "draft", "lastValidatedAt": None},
    }
