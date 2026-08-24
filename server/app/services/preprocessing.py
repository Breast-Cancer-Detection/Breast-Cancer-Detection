from io import BytesIO

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from model.resNetModel.dataAugmentation import build_eval_transforms


SUPPORTED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/x-ms-bmp",
    "image/webp",
}


async def read_uploaded_image(upload: UploadFile) -> tuple[Image.Image, bytes]:
    content_type = upload.content_type or ""
    if content_type and content_type not in SUPPORTED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a JPG, JPEG, PNG, BMP, or WEBP image.",
        )

    contents = await upload.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.") from exc

    if image.width < 32 or image.height < 32:
        raise HTTPException(
            status_code=400,
            detail="Image dimensions are below the 32 x 32 pixel minimum.",
        )

    return image, contents


def preprocess_image(image: Image.Image, image_size: int):
    transform = build_eval_transforms(image_size)
    return transform(image).unsqueeze(0)

