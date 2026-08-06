#fileInvolved
import os
from pathlib import Path


SERVER_ROOT = Path(__file__).resolve().parents[1]
MODEL_ROOT = SERVER_ROOT / "model"
DEFAULT_CHECKPOINT_DIR = MODEL_ROOT / "resNetModel" / "checkpoints"
DEFAULT_CHECKPOINT_PATH = (
    DEFAULT_CHECKPOINT_DIR / "best_resnet50_histology.pt"
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://breast-cancer-detection-ochre.vercel.app",
]

# Extra origins from env, comma-separated (useful for ngrok/preview URLs).
_extra = os.getenv("ALLOWED_ORIGINS", "")
if _extra.strip():
    ALLOWED_ORIGINS.extend(
        origin.strip() for origin in _extra.split(",") if origin.strip()
    )

# Allow all Vercel deployment URLs.
ALLOWED_ORIGIN_REGEX = r"https://.*\.vercel\.app"
