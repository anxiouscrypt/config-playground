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
        "id": "default-cafe",
        "brand": {
            "name": "Rawaq Coffee",
            "logoUrl": "",
            "primaryColor": "#134733",
            "secondaryColor": "#F5EFE6",
        },
        "features": {
            "mobileOrdering": True,
            "loyalty": False,
            "orderTracking": True,
            "guestCheckout": True,
        },
        "navigation": ["Home", "Menu", "Orders", "Profile"],
        "menu": {
            "categories": [
                {
                    "id": "coffee",
                    "name": "Coffee & Espresso",
                    "items": ["Latte", "Americano", "Cappuccino"],
                }
            ]
        },
    }
