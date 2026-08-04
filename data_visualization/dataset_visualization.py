from pathlib import Path
import random

import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image, UnidentifiedImageError


# Folder containing the four class folders.
DATA_DIR = Path("../data/BUSI")

# Folder where charts will be saved.
OUTPUT_DIR = Path("dataset_visualizations")
OUTPUT_DIR.mkdir(exist_ok=True)


# Supported image file types.
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff"}


def build_image_dataframe(data_dir: Path) -> pd.DataFrame:
    """
    Scan every image inside the dataset and create a table containing:

    - file path
    - class label
    - image width
    - image height
    - file size
    """

    records = []

    for class_folder in sorted(data_dir.iterdir()):
        if not class_folder.is_dir():
            continue

        class_name = class_folder.name

        for image_path in class_folder.rglob("*"):
            if (
                not image_path.is_file()
                or image_path.suffix.lower() not in IMAGE_EXTENSIONS
            ):
                continue

            try:
                with Image.open(image_path) as image:
                    width, height = image.size

                records.append(
                    {
                        "image_path": str(image_path),
                        "class": class_name,
                        "width": width,
                        "height": height,
                        "file_size_kb": image_path.stat().st_size / 1024,
                    }
                )

            except (UnidentifiedImageError, OSError):
                print(f"Skipped unreadable image: {image_path}")

    return pd.DataFrame(records)


def plot_class_distribution(df: pd.DataFrame) -> None:
    """
    Bar chart showing how many images belong to each class.
    """

    class_counts = (
        df["class"]
        .value_counts()
        .sort_index()
    )

    plt.figure(figsize=(9, 5))
    plt.bar(class_counts.index, class_counts.values)

    plt.title("Breast Histology Dataset: Class Distribution")
    plt.xlabel("Tissue class")
    plt.ylabel("Number of images")

    for index, value in enumerate(class_counts.values):
        plt.text(
            index,
            value,
            str(value),
            ha="center",
            va="bottom",
        )

    plt.xticks(rotation=20)
    plt.tight_layout()
    plt.savefig(
        OUTPUT_DIR / "class_distribution.png",
        dpi=200,
    )
    plt.show()


def plot_sample_images(df: pd.DataFrame) -> None:
    """
    Display one randomly selected image from each tissue class.
    """

    classes = sorted(df["class"].unique())

    plt.figure(figsize=(12, 8))

    for index, class_name in enumerate(classes):
        class_images = df[df["class"] == class_name]

        sample_row = class_images.sample(
            1,
            random_state=42,
        ).iloc[0]

        image = Image.open(
            sample_row["image_path"]
        ).convert("RGB")

        plt.subplot(2, 2, index + 1)
        plt.imshow(image)
        plt.title(class_name)
        plt.axis("off")

    plt.suptitle(
        "Sample Breast Histology Images",
        fontsize=15,
    )

    plt.tight_layout()
    plt.savefig(
        OUTPUT_DIR / "sample_images.png",
        dpi=200,
    )
    plt.show()


def plot_image_dimensions(df: pd.DataFrame) -> None:
    """
    Scatter plot showing the relationship between image width and height.
    Each point represents one image.
    """

    sample_size = min(1000, len(df))

    sampled_df = df.sample(
        sample_size,
        random_state=42,
    )

    plt.figure(figsize=(8, 6))

    for class_name in sorted(sampled_df["class"].unique()):
        class_data = sampled_df[
            sampled_df["class"] == class_name
        ]

        plt.scatter(
            class_data["width"],
            class_data["height"],
            label=class_name,
            alpha=0.5,
        )

    plt.title("Original Image Dimensions")
    plt.xlabel("Image width in pixels")
    plt.ylabel("Image height in pixels")
    plt.legend()
    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "image_dimensions.png",
        dpi=200,
    )
    plt.show()


def plot_average_file_size(df: pd.DataFrame) -> None:
    """
    Bar chart comparing average image file size across classes.
    """

    average_sizes = (
        df.groupby("class")["file_size_kb"]
        .mean()
        .sort_index()
    )

    plt.figure(figsize=(9, 5))
    plt.bar(
        average_sizes.index,
        average_sizes.values,
    )

    plt.title("Average Image File Size by Class")
    plt.xlabel("Tissue class")
    plt.ylabel("Average file size in KB")
    plt.xticks(rotation=20)
    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "average_file_size.png",
        dpi=200,
    )
    plt.show()


def plot_dataset_split(total_images: int) -> None:
    """
    Visualize the split used by your training pipeline:

    70% training
    20% validation
    10% testing
    """

    split_labels = [
        "Training",
        "Validation",
        "Testing",
    ]

    split_counts = [
        round(total_images * 0.70),
        round(total_images * 0.20),
        round(total_images * 0.10),
    ]

    plt.figure(figsize=(7, 7))

    plt.pie(
        split_counts,
        labels=split_labels,
        autopct="%1.1f%%",
        startangle=90,
    )

    plt.title("Dataset Split")
    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "dataset_split.png",
        dpi=200,
    )
    plt.show()


def print_dataset_summary(df: pd.DataFrame) -> None:
    """
    Print useful statistics in the terminal.
    """

    print("\nDATASET SUMMARY")
    print("-" * 40)

    print(f"Total images: {len(df)}")
    print(f"Number of classes: {df['class'].nunique()}")

    print("\nImages per class:")
    print(df["class"].value_counts().sort_index())

    print("\nImage width statistics:")
    print(df["width"].describe())

    print("\nImage height statistics:")
    print(df["height"].describe())

    print("\nAverage file size by class:")
    print(
        df.groupby("class")["file_size_kb"]
        .mean()
        .round(2)
    )


def main():
    if not DATA_DIR.exists():
        raise FileNotFoundError(
            f"Dataset folder was not found: {DATA_DIR.resolve()}"
        )

    df = build_image_dataframe(DATA_DIR)

    if df.empty:
        raise ValueError(
            "No valid images were found in the dataset folder."
        )

    # Save the image metadata table.
    df.to_csv(
        OUTPUT_DIR / "dataset_metadata.csv",
        index=False,
    )

    print_dataset_summary(df)

    plot_class_distribution(df)
    plot_sample_images(df)
    plot_image_dimensions(df)
    plot_average_file_size(df)
    plot_dataset_split(len(df))

    print("\nSaved visualizations to:")
    print(OUTPUT_DIR.resolve())


if __name__ == "__main__":
    main()