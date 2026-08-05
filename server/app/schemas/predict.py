#fileInvolved
from pydantic import BaseModel


class ImageDetails(BaseModel):
    filename: str
    content_type: str | None
    width: int
    height: int
    bytes: int


class PredictionResponse(BaseModel):
    received: bool
    model_loaded: bool
    predicted_class: str
    confidence: float
    probabilities: dict[str, float]
    individual_predictions: dict[str, dict]
    gradcams: dict[str, dict]
    image: ImageDetails
    message: str

