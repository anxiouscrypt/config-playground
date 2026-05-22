def test_config_crud_flow(client, sample_config):
    save_response = client.post("/configs", json=sample_config)

    assert save_response.status_code == 200
    saved = save_response.json()
    assert saved["id"] == "gazelle-demo-coffee"
    assert saved["config"]["appConfig"]["brand"]["brandName"] == "Demo Coffee"

    list_response = client.get("/configs")

    assert list_response.status_code == 200
    configs = list_response.json()
    assert len(configs) == 1
    assert configs[0]["id"] == "gazelle-demo-coffee"
    assert configs[0]["brandName"] == "Demo Coffee"

    load_response = client.get("/configs/gazelle-demo-coffee")

    assert load_response.status_code == 200
    assert load_response.json()["config"]["id"] == "gazelle-demo-coffee"

    delete_response = client.delete("/configs/gazelle-demo-coffee")

    assert delete_response.status_code == 204
    assert client.get("/configs/gazelle-demo-coffee").status_code == 404


def test_save_rejects_invalid_config(client, sample_config):
    sample_config["appConfig"]["enabledTabs"] = []

    response = client.post("/configs", json=sample_config)

    assert response.status_code == 422
    assert "enabledTabs" in response.text
