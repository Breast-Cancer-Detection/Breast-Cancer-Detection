from pathlib import Path
from typing import Iterable

from PIL import Image
from torch.utils.data import DataLoader, Dataset, Subset, random_split

from dataAugmentation import build_eval_transforms, build_train_transforms


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}


class BUSIDataset(Dataset):
    def __init__(self, data_dir: Path, transform=None):
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.classes = self._find_classes(self.data_dir)
        self.class_to_idx = {class_name: idx for idx, class_name in enumerate(self.classes)}
        self.samples = self._find_samples(self.data_dir, self.classes)

        if not self.samples:
            raise ValueError(
                f"No BUSI images found in {self.data_dir}. Expected class folders like "
                "benign/, malignant/, and normal/ containing image files."
            )

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        image_path, label = self.samples[index]
        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label

    @staticmethod
    def _find_classes(data_dir: Path) -> list[str]:
        classes = sorted(path.name for path in data_dir.iterdir() if path.is_dir())
        if not classes:
            raise ValueError(f"No class folders found in {data_dir}.")
        return classes

    def _find_samples(self, data_dir: Path, classes: Iterable[str]) -> list[tuple[Path, int]]:
        samples = []
        for class_name in classes:
            class_dir = data_dir / class_name
            label = self.class_to_idx[class_name]
            for image_path in sorted(class_dir.rglob("*")):
                if not image_path.is_file():
                    continue
                if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
                    continue
                if "mask" in image_path.stem.lower():
                    continue
                samples.append((image_path, label))
        return samples


def create_data_loaders(
    data_dir: Path,
    image_size: int,
    batch_size: int,
    validation_split: float,
    test_split: float,
    seed: int,
    num_workers: int,
):
    base_dataset = BUSIDataset(data_dir=data_dir)
    total_size = len(base_dataset)
    test_size = int(total_size * test_split)
    val_size = int(total_size * validation_split)
    train_size = total_size - val_size - test_size

    if train_size <= 0 or val_size <= 0:
        raise ValueError(
            "Dataset is too small for the configured split. Lower validation_split/test_split."
        )

    generator = __import__("torch").Generator().manual_seed(seed)
    train_subset, val_subset, test_subset = random_split(
        base_dataset,
        [train_size, val_size, test_size],
        generator=generator,
    )

    train_dataset = _subset_with_transform(
        train_subset,
        build_train_transforms(image_size),
    )
    val_dataset = _subset_with_transform(
        val_subset,
        build_eval_transforms(image_size),
    )
    test_dataset = _subset_with_transform(
        test_subset,
        build_eval_transforms(image_size),
    )

    return {
        "train": DataLoader(
            train_dataset,
            batch_size=batch_size,
            shuffle=True,
            num_workers=num_workers,
        ),
        "val": DataLoader(
            val_dataset,
            batch_size=batch_size,
            shuffle=False,
            num_workers=num_workers,
        ),
        "test": DataLoader(
            test_dataset,
            batch_size=batch_size,
            shuffle=False,
            num_workers=num_workers,
        ),
        "classes": base_dataset.classes,
    }


def _subset_with_transform(subset: Subset, transform):
    dataset = BUSIDataset(subset.dataset.data_dir, transform=transform)
    return Subset(dataset, subset.indices)