from fastapi import APIRouter, File, UploadFile

from app.schemas.predict import ImageDetails, PredictionResponse
from app.services.predictor import predictor
from app.services.preprocessing import read_uploaded_image


router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": predictor.model_loaded,
        "loaded_models": predictor.loaded_model_names,
        "load_error": predictor.load_error,
    }


@router.post("/predict", response_model=PredictionResponse)
async def predict(image: UploadFile = File(...)):
    pil_image, contents = await read_uploaded_image(image)
    prediction = predictor.predict(pil_image)

    return PredictionResponse(
        received=True,
        model_loaded=prediction["model_loaded"],
        predicted_class=prediction["predicted_class"],
        confidence=prediction["confidence"],
        probabilities=prediction["probabilities"],
        individual_predictions=prediction["individual_predictions"],
        gradcams=prediction["gradcams"],
        image=ImageDetails(
            filename=image.filename or "upload",
            content_type=image.content_type,
            width=pil_image.width,
            height=pil_image.height,
            bytes=len(contents),
        ),
        message="Image received and prediction pipeline completed.",
    )
