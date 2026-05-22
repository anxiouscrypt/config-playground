def test_validate_accepts_valid_config(client, sample_config):
    response = client.post("/configs/validate", json={"config": sample_config})

    assert response.status_code == 200
    assert response.json() == {"valid": True, "errors": []}


def test_validate_reports_invalid_config(client, sample_config):
    sample_config["appConfig"]["theme"]["primary"] = "green"

    response = client.post("/configs/validate", json={"config": sample_config})

    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is False
    assert any("theme.primary" in error for error in body["errors"])


def test_validate_rejects_location_mismatch(client, sample_config):
    sample_config["menu"]["locationId"] = "different-location"

    response = client.post("/configs/validate", json={"config": sample_config})

    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is False
    assert any("menu.locationId" in error for error in body["errors"])
