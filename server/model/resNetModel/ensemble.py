from pathlib import Path
import argparse

import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    f1_score,
    precision_score,
    recall_score,
)

from server.model.resNetModel.busiDataset import create_data_loaders
from server.model.resNetModel.modelFactory import build_model


MODEL_NAMES = [
    "resnet50",
    "densenet121",
    "efficientnet_b0",
    "vgg16",
]

CLASS_NAMES = [
    "Benign",
    "Carcinoma_InSitu",
    "Carcinoma_Invasive",
    "Normal",
]


def parse_args():
    parser = argparse.ArgumentParser(
        description="Evaluate a soft-voting ensemble of four CNN models."
    )

    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path("data/BUSI"),
        help="Path to the dataset folder.",
    )

    parser.add_argument(
        "--checkpoint-dir",
        type=Path,
        default=Path("resNetModel/checkpoints"),
        help="Folder containing trained model checkpoints.",
    )

    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("ensemble_results"),
        help="Folder where ensemble statistics will be saved.",
    )

    parser.add_argument(
        "--batch-size",
        type=int,
        default=16,
    )

    parser.add_argument(
        "--image-size",
        type=int,
        default=224,
    )

    parser.add_argument(
        "--num-workers",
        type=int,
        default=0,
    )

    parser.add_argument(
        "--validation-split",
        type=float,
        default=0.20,
    )

    parser.add_argument(
        "--test-split",
        type=float,
        default=0.10,
    )

    parser.add_argument(
        "--seed",
        type=int,
        default=42,
    )

    return parser.parse_args()


def extract_state_dict(checkpoint):
    """
    Supports checkpoints saved either as:

    torch.save(model.state_dict(), path)

    or:

    torch.save({
        "model_state_dict": model.state_dict(),
        ...
    }, path)
    """

    if not isinstance(checkpoint, dict):
        raise TypeError("The checkpoint is not a valid dictionary.")

    if "model_state_dict" in checkpoint:
        return checkpoint["model_state_dict"]

    if "state_dict" in checkpoint:
        return checkpoint["state_dict"]

    if "model" in checkpoint and isinstance(checkpoint["model"], dict):
        return checkpoint["model"]

    # A raw PyTorch state_dict contains tensor values.
    if checkpoint and all(
        isinstance(value, torch.Tensor)
        for value in checkpoint.values()
    ):
        return checkpoint

    raise KeyError(
        "Could not find model weights inside the checkpoint."
    )


def load_trained_model(
    model_name,
    checkpoint_path,
    num_classes,
    device,
):
    print(f"Loading {model_name}...")

    model = build_model(
        model_name=model_name,
        num_classes=num_classes,
        freeze_backbone=False,
        dropout=0.3,
    )

    checkpoint = torch.load(
        checkpoint_path,
        map_location=device,
    )

    state_dict = extract_state_dict(checkpoint)
    model.load_state_dict(state_dict)

    model.to(device)
    model.eval()

    return model


def main():
    args = parse_args()

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print(f"Device: {device}")

    args.output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # This must use the same split settings and seed as training.
    loaders = create_data_loaders(
        data_dir=args.data_dir,
        image_size=args.image_size,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
        validation_split=args.validation_split,
        test_split=args.test_split,
        seed=args.seed,
    )

    test_loader = loaders["test"]
    classes = loaders.get("classes", CLASS_NAMES)
    num_classes = len(classes)

    print(f"Classes: {classes}")
    print(f"Test images: {len(test_loader.dataset)}")

    checkpoint_paths = {
        "resnet50": (
            args.checkpoint_dir
            / "best_resnet50_histology.pt"
        ),
        "densenet121": (
            args.checkpoint_dir
            / "best_densenet121_histology.pt"
        ),
        "efficientnet_b0": (
            args.checkpoint_dir
            / "best_efficientnet_b0_histology.pt"
        ),
        "vgg16": (
            args.checkpoint_dir
            / "best_vgg16_histology.pt"
        ),
    }

    for model_name, path in checkpoint_paths.items():
        if not path.exists():
            raise FileNotFoundError(
                f"Checkpoint for {model_name} was not found:\n{path}"
            )

    models = {
        model_name: load_trained_model(
            model_name=model_name,
            checkpoint_path=checkpoint_paths[model_name],
            num_classes=num_classes,
            device=device,
        )
        for model_name in MODEL_NAMES
    }

    all_labels = []
    all_ensemble_predictions = []

    individual_predictions = {
        model_name: []
        for model_name in MODEL_NAMES
    }

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            labels = labels.to(device)

            probabilities = {}

            for model_name, model in models.items():
                logits = model(images)

                probabilities[model_name] = torch.softmax(
                    logits,
                    dim=1,
                )

                model_predictions = logits.argmax(dim=1)

                individual_predictions[model_name].extend(
                    model_predictions.cpu().numpy()
                )

            # Equal-weight soft-voting ensemble.
            ensemble_probabilities = (
                probabilities["resnet50"]
                + probabilities["densenet121"]
                + probabilities["efficientnet_b0"]
                + probabilities["vgg16"]
            ) / 4

            ensemble_predictions = ensemble_probabilities.argmax(
                dim=1
            )

            all_ensemble_predictions.extend(
                ensemble_predictions.cpu().numpy()
            )

            all_labels.extend(
                labels.cpu().numpy()
            )

    all_labels = np.array(all_labels)
    all_ensemble_predictions = np.array(
        all_ensemble_predictions
    )

    print("\nIndividual model accuracy:")

    individual_accuracies = {}

    for model_name in MODEL_NAMES:
        predictions = np.array(
            individual_predictions[model_name]
        )

        model_accuracy = accuracy_score(
            all_labels,
            predictions,
        )

        individual_accuracies[model_name] = model_accuracy

        print(
            f"{model_name:17s}: "
            f"{model_accuracy:.4f} "
            f"({model_accuracy * 100:.2f}%)"
        )

    ensemble_accuracy = accuracy_score(
        all_labels,
        all_ensemble_predictions,
    )

    ensemble_precision_macro = precision_score(
        all_labels,
        all_ensemble_predictions,
        average="macro",
        zero_division=0,
    )

    ensemble_recall_macro = recall_score(
        all_labels,
        all_ensemble_predictions,
        average="macro",
        zero_division=0,
    )

    ensemble_f1_macro = f1_score(
        all_labels,
        all_ensemble_predictions,
        average="macro",
        zero_division=0,
    )

    ensemble_precision_weighted = precision_score(
        all_labels,
        all_ensemble_predictions,
        average="weighted",
        zero_division=0,
    )

    ensemble_recall_weighted = recall_score(
        all_labels,
        all_ensemble_predictions,
        average="weighted",
        zero_division=0,
    )

    ensemble_f1_weighted = f1_score(
        all_labels,
        all_ensemble_predictions,
        average="weighted",
        zero_division=0,
    )

    report = classification_report(
        all_labels,
        all_ensemble_predictions,
        target_names=classes,
        digits=4,
        zero_division=0,
    )

    matrix = confusion_matrix(
        all_labels,
        all_ensemble_predictions,
    )

    print("\nFour-model ensemble results")
    print("-" * 40)
    print(
        f"Accuracy:           "
        f"{ensemble_accuracy:.4f} "
        f"({ensemble_accuracy * 100:.2f}%)"
    )
    print(
        f"Macro precision:    "
        f"{ensemble_precision_macro:.4f}"
    )
    print(
        f"Macro recall:       "
        f"{ensemble_recall_macro:.4f}"
    )
    print(
        f"Macro F1:           "
        f"{ensemble_f1_macro:.4f}"
    )
    print(
        f"Weighted precision: "
        f"{ensemble_precision_weighted:.4f}"
    )
    print(
        f"Weighted recall:    "
        f"{ensemble_recall_weighted:.4f}"
    )
    print(
        f"Weighted F1:        "
        f"{ensemble_f1_weighted:.4f}"
    )

    print("\nClassification report:")
    print(report)

    print("Confusion matrix:")
    print(matrix)

    results_file = (
        args.output_dir
        / "ensemble_statistics.txt"
    )

    with open(
        results_file,
        "w",
        encoding="utf-8",
    ) as file:
        file.write("INDIVIDUAL MODEL ACCURACY\n")
        file.write("=" * 50 + "\n")

        for model_name, model_accuracy in individual_accuracies.items():
            file.write(
                f"{model_name}: "
                f"{model_accuracy:.4f} "
                f"({model_accuracy * 100:.2f}%)\n"
            )

        file.write("\nFOUR-MODEL ENSEMBLE\n")
        file.write("=" * 50 + "\n")
        file.write(
            f"Accuracy: {ensemble_accuracy:.4f}\n"
        )
        file.write(
            f"Macro precision: "
            f"{ensemble_precision_macro:.4f}\n"
        )
        file.write(
            f"Macro recall: "
            f"{ensemble_recall_macro:.4f}\n"
        )
        file.write(
            f"Macro F1: "
            f"{ensemble_f1_macro:.4f}\n"
        )
        file.write(
            f"Weighted precision: "
            f"{ensemble_precision_weighted:.4f}\n"
        )
        file.write(
            f"Weighted recall: "
            f"{ensemble_recall_weighted:.4f}\n"
        )
        file.write(
            f"Weighted F1: "
            f"{ensemble_f1_weighted:.4f}\n"
        )

        file.write("\nCLASSIFICATION REPORT\n")
        file.write("=" * 50 + "\n")
        file.write(report)

        file.write("\nCONFUSION MATRIX\n")
        file.write("=" * 50 + "\n")
        file.write(str(matrix))

    display = ConfusionMatrixDisplay(
        confusion_matrix=matrix,
        display_labels=classes,
    )

    figure, axis = plt.subplots(
        figsize=(9, 7)
    )

    display.plot(
        ax=axis,
        values_format="d",
        xticks_rotation=30,
    )

    axis.set_title(
        "Four-Model Ensemble Confusion Matrix"
    )

    figure.tight_layout()

    confusion_matrix_path = (
        args.output_dir
        / "ensemble_confusion_matrix.png"
    )

    figure.savefig(
        confusion_matrix_path,
        dpi=300,
        bbox_inches="tight",
    )

    plt.close(figure)

    print(f"\nStatistics saved to: {results_file}")
    print(
        "Confusion matrix saved to: "
        f"{confusion_matrix_path}"
    )


if __name__ == "__main__":
    main()
