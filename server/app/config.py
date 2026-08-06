#fileInvolved
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
]
