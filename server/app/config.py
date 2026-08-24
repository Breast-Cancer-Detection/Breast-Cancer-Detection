import os
from pathlib import Path


SERVER_ROOT = Path(__file__).resolve().parents[1]
MODEL_ROOT = SERVER_ROOT / "model"
BUNDLED_CHECKPOINT_DIR = MODEL_ROOT / "resNetModel" / "checkpoints"

# Hosts that cannot read Git LFS need the weights downloaded at runtime, so the
# directory is overridable to point at a persistent volume.
DEFAULT_CHECKPOINT_DIR = Path(
    os.getenv("CHECKPOINT_DIR", str(BUNDLED_CHECKPOINT_DIR))
)
DEFAULT_CHECKPOINT_PATH = (
    DEFAULT_CHECKPOINT_DIR / "best_resnet50_histology.pt"
)

# Public base URL holding the four .pt files, e.g. a Supabase Storage bucket.
CHECKPOINT_BASE_URL = os.getenv("CHECKPOINT_BASE_URL", "").rstrip("/")

LOCAL_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def _configured_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    origins = [origin.strip().rstrip("/") for origin in raw.split(",")]
    return [origin for origin in origins if origin]


ALLOWED_ORIGINS = LOCAL_ORIGINS + _configured_origins()
