from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class TrainingConfig:
    data_dir: Path = PROJECT_ROOT / "data" / "BUSI"
    output_dir: Path = Path(__file__).resolve().parent / "checkpoints"
    image_size: int = 224
    batch_size: int = 16
    epochs: int = 8
    learning_rate: float = 1e-4
    weight_decay: float = 1e-4
    num_workers: int = 0
    validation_split: float = 0.2
    test_split: float = 0.1
    seed: int = 42
    freeze_backbone: bool = True
    dropout: float = 0.3
