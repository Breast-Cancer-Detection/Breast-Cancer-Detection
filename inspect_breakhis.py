from pathlib import Path
from collections import Counter

import kagglehub


# Download BreaKHis through KaggleHub.
dataset_path = Path(
    kagglehub.dataset_download("ambarish/breakhis")
)

print("Dataset downloaded to:")
print(dataset_path)


# Count all image files according to their parent folder.
image_extensions = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"}

folder_counts = Counter()

for image_path in dataset_path.rglob("*"):
    if image_path.is_file() and image_path.suffix.lower() in image_extensions:
        relative_folder = image_path.parent.relative_to(dataset_path)
        folder_counts[str(relative_folder)] += 1


print("\nImage counts by folder:")

for folder, count in sorted(folder_counts.items()):
    print(f"{folder}: {count}")