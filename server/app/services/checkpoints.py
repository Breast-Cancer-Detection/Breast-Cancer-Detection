import shutil
import urllib.error
import urllib.request
from pathlib import Path

from app.config import BUNDLED_CHECKPOINT_DIR, CHECKPOINT_BASE_URL


# A Git LFS pointer or an error page is only a few hundred bytes, while the
# smallest real checkpoint is ~16 MB.
MIN_CHECKPOINT_BYTES = 1_000_000

LFS_POINTER_PREFIX = b"version https://git-lfs"


def _looks_like_weights(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < MIN_CHECKPOINT_BYTES:
        return False

    with path.open("rb") as handle:
        return not handle.read(len(LFS_POINTER_PREFIX)).startswith(LFS_POINTER_PREFIX)


def _download(url: str, destination: Path) -> None:
    partial = destination.with_suffix(destination.suffix + ".part")

    with urllib.request.urlopen(url, timeout=120) as response:
        with partial.open("wb") as handle:
            shutil.copyfileobj(response, handle, length=1024 * 1024)

    if not _looks_like_weights(partial):
        partial.unlink(missing_ok=True)
        raise ValueError(f"Downloaded file from {url} is not a valid checkpoint.")

    partial.replace(destination)


def ensure_checkpoints(checkpoint_dir: Path, filenames: list[str]) -> None:
    """Make every checkpoint available locally, downloading or copying as needed."""
    checkpoint_dir.mkdir(parents=True, exist_ok=True)

    for filename in filenames:
        destination = checkpoint_dir / filename

        if _looks_like_weights(destination):
            continue

        bundled = BUNDLED_CHECKPOINT_DIR / filename
        if bundled != destination and _looks_like_weights(bundled):
            shutil.copy2(bundled, destination)
            continue

        if not CHECKPOINT_BASE_URL:
            continue

        url = f"{CHECKPOINT_BASE_URL}/{filename}"
        try:
            _download(url, destination)
        except (urllib.error.URLError, ValueError, OSError) as exc:
            raise RuntimeError(f"Could not fetch {filename}: {exc}") from exc
