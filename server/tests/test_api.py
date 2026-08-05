from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


client = TestClient(app)


def make_test_image() -> BytesIO:
    buffer = BytesIO()
    Image.new("RGB", (64, 64), color=(120, 80, 160)).save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_accepts_image_upload():
    response = client.post(
        "/api/predict",
        files={"image": ("sample.png", make_test_image(), "image/png")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["received"] is True
    assert body["image"]["filename"] == "sample.png"
    assert body["image"]["width"] == 64
    assert body["image"]["height"] == 64
    assert "predicted_class" in body
    assert "probabilities" in body


def test_predict_rejects_missing_file():
    response = client.post("/api/predict")

    assert response.status_code == 422
