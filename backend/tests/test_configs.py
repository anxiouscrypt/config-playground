def test_config_crud_flow(client, sample_config):
    save_response = client.post("/configs", json=sample_config)

    assert save_response.status_code == 200
    saved = save_response.json()
    assert saved["id"] == "default-cafe"
    assert saved["config"]["brand"]["name"] == "Rawaq Coffee"

    list_response = client.get("/configs")

    assert list_response.status_code == 200
    configs = list_response.json()
    assert len(configs) == 1
    assert configs[0]["id"] == "default-cafe"
    assert configs[0]["brandName"] == "Rawaq Coffee"

    load_response = client.get("/configs/default-cafe")

    assert load_response.status_code == 200
    assert load_response.json()["config"]["id"] == "default-cafe"

    delete_response = client.delete("/configs/default-cafe")

    assert delete_response.status_code == 204
    assert client.get("/configs/default-cafe").status_code == 404


def test_save_rejects_invalid_config(client, sample_config):
    sample_config["navigation"] = []

    response = client.post("/configs", json=sample_config)

    assert response.status_code == 422
    assert "navigation" in response.text
