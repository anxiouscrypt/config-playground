def test_validate_accepts_valid_config(client, sample_config):
    response = client.post("/configs/validate", json={"config": sample_config})

    assert response.status_code == 200
    assert response.json() == {"valid": True, "errors": []}


def test_validate_reports_invalid_config(client, sample_config):
    sample_config["brand"]["primaryColor"] = "green"

    response = client.post("/configs/validate", json={"config": sample_config})

    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is False
    assert any("primaryColor" in error for error in body["errors"])
