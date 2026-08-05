from pathlib import Path
import argparse

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

from modelFactory import build_model


CLASS_NAMES = [
    "Benign",
    "Carcinoma_InSitu",
    "Carcinoma_Invasive",
    "Normal",
]

MODEL_NAMES = [
    "resnet50",
    "densenet121",
    "efficientnet_b0",
    "vgg16",
]

DISPLAY_NAMES = {
    "resnet50": "ResNet50",
    "densenet121": "DenseNet121",
    "efficientnet_b0": "EfficientNet-B0",
    "vgg16": "VGG16",
}

CHECKPOINT_FILENAMES = {
    "resnet50": "best_resnet50_histology.pt",
    "densenet121": "best_densenet121_histology.pt",
    "efficientnet_b0": "best_efficientnet_b0_histology.pt",
    "vgg16": "best_vgg16_histology.pt",
}


# Folder containing this Python file.
SCRIPT_DIR = Path(__file__).resolve().parent

# Main project folder.
PROJECT_ROOT = SCRIPT_DIR.parent

# Default checkpoint folder.
DEFAULT_CHECKPOINT_DIR = SCRIPT_DIR / "checkpoints"

# Default output path.
DEFAULT_OUTPUT_PATH = (
    PROJECT_ROOT
    / "gradcam_results"
    / "all_models_gradcam.png"
)


def parse_args():
    parser = argparse.ArgumentParser(
        description=(
            "Generate side-by-side Grad-CAM heatmaps for "
            "ResNet50, DenseNet121, EfficientNet-B0, and VGG16."
        )
    )

    parser.add_argument(
        "--image",
        type=Path,
        required=True,
        help="Path to the histology image.",
    )

    parser.add_argument(
        "--checkpoint-dir",
        type=Path,
        default=DEFAULT_CHECKPOINT_DIR,
        help="Directory containing the trained model checkpoints.",
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help="Path where the Grad-CAM comparison image will be saved.",
    )

    parser.add_argument(
        "--image-size",
        type=int,
        default=224,
        help="Image width and height used by the models.",
    )

    parser.add_argument(
        "--target-class",
        type=int,
        default=None,
        help=(
            "Optional class index that every model should explain: "
            "0=Benign, 1=Carcinoma_InSitu, "
            "2=Carcinoma_Invasive, 3=Normal. "
            "Without this argument, each model explains its own prediction."
        ),
    )

    return parser.parse_args()


def extract_state_dict(checkpoint):
    """
    Extract trained model weights from several possible checkpoint formats.
    """

    if not isinstance(checkpoint, dict):
        raise TypeError("Checkpoint must be a Python dictionary.")

    if "model_state_dict" in checkpoint:
        return checkpoint["model_state_dict"]

    if "state_dict" in checkpoint:
        return checkpoint["state_dict"]

    if "model" in checkpoint and isinstance(checkpoint["model"], dict):
        return checkpoint["model"]

    # A raw state dictionary contains parameter names mapped to tensors.
    if checkpoint and all(
        isinstance(value, torch.Tensor)
        for value in checkpoint.values()
    ):
        return checkpoint

    raise KeyError(
        "Could not find model weights inside the checkpoint."
    )


def load_model(
    model_name,
    checkpoint_path,
    device,
):
    """
    Rebuild one model architecture and load its trained weights.
    """

    print(f"Loading {model_name}...")

    model = build_model(
        model_name=model_name,
        num_classes=len(CLASS_NAMES),
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


def find_last_conv_layer(model):
    """
    Find the final convolutional layer in a model automatically.

    Grad-CAM normally uses a late convolutional layer because it contains
    higher-level spatial features while still preserving image location.
    """

    last_conv_name = None
    last_conv_layer = None

    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Conv2d):
            last_conv_name = name
            last_conv_layer = module

    if last_conv_layer is None:
        raise ValueError(
            "No convolutional layer was found in the model."
        )

    return last_conv_name, last_conv_layer


class GradCAM:
    """
    Generate a Grad-CAM heatmap using activations and gradients from
    a selected convolutional layer.
    """

    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer

        self.activations = None
        self.gradients = None

        # Run this function whenever data passes through the target layer.
        self.forward_handle = (
            self.target_layer.register_forward_hook(
                self._save_activations
            )
        )

    def _save_activations(
        self,
        module,
        inputs,
        output,
    ):
        """
        Save the feature maps produced by the convolutional layer.
        """

        self.activations = output

        # Save the gradients that later flow backward through this output.
        output.register_hook(self._save_gradients)

    def _save_gradients(self, gradient):
        """
        Save gradients of the selected class score with respect to
        the convolutional feature maps.
        """

        self.gradients = gradient

    def generate(
        self,
        input_tensor,
        target_class=None,
    ):
        """
        Run prediction and generate a normalized Grad-CAM heatmap.
        """

        self.activations = None
        self.gradients = None

        self.model.zero_grad(set_to_none=True)

        # Raw class scores from the model.
        logits = self.model(input_tensor)

        # Convert raw scores into probability-like values.
        probabilities = torch.softmax(
            logits,
            dim=1,
        )

        predicted_class = int(
            probabilities.argmax(dim=1).item()
        )

        predicted_confidence = float(
            probabilities[
                0,
                predicted_class,
            ].item()
        )

        # By default, explain the class predicted by this model.
        if target_class is None:
            class_to_explain = predicted_class
        else:
            class_to_explain = target_class

        # Select the raw score for the class we want to explain.
        target_score = logits[
            0,
            class_to_explain,
        ]

        # Calculate gradients for the selected class.
        target_score.backward()

        if self.activations is None:
            raise RuntimeError(
                "Grad-CAM activations were not captured."
            )

        if self.gradients is None:
            raise RuntimeError(
                "Grad-CAM gradients were not captured."
            )

        # Average each feature map's gradients across width and height.
        weights = self.gradients.mean(
            dim=(2, 3),
            keepdim=True,
        )

        # Weight activation maps according to their importance.
        cam = (
            weights * self.activations
        ).sum(
            dim=1,
            keepdim=True,
        )

        # Keep only positive contributions.
        cam = torch.relu(cam)

        # Resize the small activation map to 224 × 224.
        cam = F.interpolate(
            cam,
            size=input_tensor.shape[2:],
            mode="bilinear",
            align_corners=False,
        )

        cam = (
            cam.squeeze()
            .detach()
            .cpu()
            .numpy()
        )

        # Normalize heatmap values to between 0 and 1.
        cam_min = float(cam.min())
        cam_max = float(cam.max())

        if cam_max > cam_min:
            cam = (
                cam - cam_min
            ) / (
                cam_max - cam_min
            )
        else:
            cam = np.zeros_like(cam)

        return {
            "heatmap": cam,
            "predicted_class": predicted_class,
            "confidence": predicted_confidence,
            "explained_class": class_to_explain,
            "probabilities": (
                probabilities[0]
                .detach()
                .cpu()
                .numpy()
            ),
        }

    def remove_hooks(self):
        """
        Remove the PyTorch hook after Grad-CAM is finished.
        """

        self.forward_handle.remove()


def load_and_preprocess_image(
    image_path,
    image_size,
):
    """
    Load the image and create:

    1. A normalized tensor for the CNN.
    2. A regular image array for displaying the heatmap.
    """

    image = Image.open(
        image_path
    ).convert("RGB")

    display_image = image.resize(
        (
            image_size,
            image_size,
        )
    )

    transform = transforms.Compose(
        [
            transforms.Resize(
                (
                    image_size,
                    image_size,
                )
            ),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[
                    0.485,
                    0.456,
                    0.406,
                ],
                std=[
                    0.229,
                    0.224,
                    0.225,
                ],
            ),
        ]
    )

    input_tensor = (
        transform(image)
        .unsqueeze(0)
    )

    display_array = (
        np.asarray(display_image)
        .astype(np.float32)
        / 255.0
    )

    return input_tensor, display_array


def create_overlay(
    original_image,
    heatmap,
    heatmap_strength=0.45,
):
    """
    Convert the Grad-CAM values into a colored heatmap and combine
    it with the original histology image.
    """

    colored_heatmap = (
        plt.get_cmap("jet")(heatmap)[..., :3]
    )

    overlay = (
        (1.0 - heatmap_strength)
        * original_image
        + heatmap_strength
        * colored_heatmap
    )

    return np.clip(
        overlay,
        0,
        1,
    )


def main():
    args = parse_args()

    # Resolve image path relative to the folder where the command was run.
    image_path = args.image.resolve()

    # Resolve checkpoint and output paths.
    checkpoint_dir = args.checkpoint_dir.resolve()
    output_path = args.output.resolve()

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image was not found:\n{image_path}"
        )

    if not checkpoint_dir.exists():
        raise FileNotFoundError(
            f"Checkpoint directory was not found:\n"
            f"{checkpoint_dir}"
        )

    if (
        args.target_class is not None
        and not 0 <= args.target_class < len(CLASS_NAMES)
    ):
        raise ValueError(
            "--target-class must be 0, 1, 2, or 3."
        )

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    print(f"Device: {device}")
    print(f"Image: {image_path}")

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    input_tensor, original_image = (
        load_and_preprocess_image(
            image_path=image_path,
            image_size=args.image_size,
        )
    )

    input_tensor = input_tensor.to(device)

    results = {}

    # Run Grad-CAM separately for every CNN.
    for model_name in MODEL_NAMES:
        checkpoint_path = (
            checkpoint_dir
            / CHECKPOINT_FILENAMES[model_name]
        )

        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"Checkpoint was not found for "
                f"{model_name}:\n{checkpoint_path}"
            )

        model = load_model(
            model_name=model_name,
            checkpoint_path=checkpoint_path,
            device=device,
        )

        layer_name, target_layer = (
            find_last_conv_layer(model)
        )

        print(
            f"{model_name} Grad-CAM layer: "
            f"{layer_name}"
        )

        gradcam = GradCAM(
            model=model,
            target_layer=target_layer,
        )

        result = gradcam.generate(
            input_tensor=input_tensor,
            target_class=args.target_class,
        )

        result["overlay"] = create_overlay(
            original_image=original_image,
            heatmap=result["heatmap"],
        )

        results[model_name] = result

        gradcam.remove_hooks()

        del gradcam
        del model

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    # ---------------------------------------------------------
    # Calculate ensemble result BEFORE creating the figure title.
    # ---------------------------------------------------------

    all_probabilities = np.stack(
        [
            results[model_name]["probabilities"]
            for model_name in MODEL_NAMES
        ]
    )

    # Soft voting: average all four probability vectors.
    ensemble_probabilities = (
        all_probabilities.mean(axis=0)
    )

    ensemble_class = int(
        np.argmax(ensemble_probabilities)
    )

    ensemble_confidence = float(
        ensemble_probabilities[
            ensemble_class
        ]
    )

    # ---------------------------------------------------------
    # Build the side-by-side visualization.
    # ---------------------------------------------------------

    figure, axes = plt.subplots(
        1,
        5,
        figsize=(22, 5),
    )

    axes[0].imshow(original_image)
    axes[0].set_title(
        "Original image",
        fontsize=11,
    )
    axes[0].axis("off")

    for index, model_name in enumerate(
        MODEL_NAMES,
        start=1,
    ):
        result = results[model_name]

        predicted_name = CLASS_NAMES[
            result["predicted_class"]
        ]

        explained_name = CLASS_NAMES[
            result["explained_class"]
        ]

        axes[index].imshow(
            result["overlay"]
        )

        if (
            result["predicted_class"]
            == result["explained_class"]
        ):
            title = (
                f"{DISPLAY_NAMES[model_name]}\n"
                f"Prediction: {predicted_name}\n"
                f"Confidence: "
                f"{result['confidence'] * 100:.1f}%"
            )
        else:
            title = (
                f"{DISPLAY_NAMES[model_name]}\n"
                f"Prediction: {predicted_name} "
                f"({result['confidence'] * 100:.1f}%)\n"
                f"Explaining: {explained_name}"
            )

        axes[index].set_title(
            title,
            fontsize=10,
        )

        axes[index].axis("off")

    if args.target_class is None:
        subtitle = (
            "Each model explains its own prediction"
        )
    else:
        subtitle = (
            f"All heatmaps explain: "
            f"{CLASS_NAMES[args.target_class]}"
        )

    figure.suptitle(
        f"Ensemble Prediction: "
        f"{CLASS_NAMES[ensemble_class]} "
        f"({ensemble_confidence * 100:.1f}%)\n"
        f"{subtitle}",
        fontsize=16,
    )

    figure.tight_layout(
        rect=[
            0,
            0,
            1,
            0.88,
        ]
    )

    figure.savefig(
        output_path,
        dpi=300,
        bbox_inches="tight",
    )

    plt.show()
    plt.close(figure)

    # ---------------------------------------------------------
    # Print individual and ensemble predictions.
    # ---------------------------------------------------------

    print("\nINDIVIDUAL MODEL PREDICTIONS")
    print("-" * 60)

    for model_name in MODEL_NAMES:
        result = results[model_name]

        predicted_name = CLASS_NAMES[
            result["predicted_class"]
        ]

        print(
            f"{DISPLAY_NAMES[model_name]:16s}: "
            f"{predicted_name:22s} "
            f"{result['confidence'] * 100:6.2f}%"
        )

    print("\nENSEMBLE RESULT")
    print("-" * 60)

    print(
        f"Prediction: "
        f"{CLASS_NAMES[ensemble_class]}"
    )

    print(
        f"Confidence: "
        f"{ensemble_confidence * 100:.2f}%"
    )

    print("\nEnsemble probabilities:")

    for class_name, probability in zip(
        CLASS_NAMES,
        ensemble_probabilities,
    ):
        print(
            f"{class_name:22s}: "
            f"{probability * 100:.2f}%"
        )

    print(
        f"\nSaved side-by-side Grad-CAM to:\n"
        f"{output_path}"
    )


if __name__ == "__main__":
    main()