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

CHECKPOINT_FILENAMES = {
    "resnet50": "best_resnet50_histology.pt",
    "densenet121": "best_densenet121_histology.pt",
    "efficientnet_b0": "best_efficientnet_b0_histology.pt",
    "vgg16": "best_vgg16_histology.pt",
}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate side-by-side Grad-CAM heatmaps for four CNN models."
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
        default=Path("resNetModel/checkpoints"),
        help="Directory containing the trained checkpoints.",
    )

    parser.add_argument(
        "--output",
        type=Path,
        default=Path("gradcam_results/all_models_gradcam.png"),
        help="Path where the side-by-side figure will be saved.",
    )

    parser.add_argument(
        "--image-size",
        type=int,
        default=224,
    )

    parser.add_argument(
        "--target-class",
        type=int,
        default=None,
        help=(
            "Optional class index to explain for every model. "
            "0=Benign, 1=Carcinoma_InSitu, "
            "2=Carcinoma_Invasive, 3=Normal. "
            "By default, each model explains its own prediction."
        ),
    )

    return parser.parse_args()


def extract_state_dict(checkpoint):
    """
    Supports either a raw model state_dict or a checkpoint dictionary.
    """

    if not isinstance(checkpoint, dict):
        raise TypeError("Checkpoint must be a dictionary.")

    if "model_state_dict" in checkpoint:
        return checkpoint["model_state_dict"]

    if "state_dict" in checkpoint:
        return checkpoint["state_dict"]

    if "model" in checkpoint and isinstance(checkpoint["model"], dict):
        return checkpoint["model"]

    if checkpoint and all(
        isinstance(value, torch.Tensor)
        for value in checkpoint.values()
    ):
        return checkpoint

    raise KeyError("Could not find model weights in the checkpoint.")


def load_model(
    model_name,
    checkpoint_path,
    device,
):
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
    Finds the final Conv2d layer automatically.

    This works for ResNet50, DenseNet121,
    EfficientNet-B0, and VGG16.
    """

    last_conv_layer = None
    last_conv_name = None

    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Conv2d):
            last_conv_layer = module
            last_conv_name = name

    if last_conv_layer is None:
        raise ValueError("No convolutional layer was found.")

    return last_conv_name, last_conv_layer


class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer

        self.activations = None
        self.gradients = None

        self.forward_handle = self.target_layer.register_forward_hook(
            self._forward_hook
        )

    def _forward_hook(self, module, inputs, output):
        self.activations = output

        # Store gradients flowing backward through this output tensor.
        output.register_hook(self._gradient_hook)

    def _gradient_hook(self, gradient):
        self.gradients = gradient

    def generate(
        self,
        input_tensor,
        target_class=None,
    ):
        self.model.zero_grad(set_to_none=True)

        logits = self.model(input_tensor)
        probabilities = torch.softmax(logits, dim=1)

        predicted_class = int(
            probabilities.argmax(dim=1).item()
        )

        predicted_confidence = float(
            probabilities[0, predicted_class].item()
        )

        if target_class is None:
            class_to_explain = predicted_class
        else:
            class_to_explain = target_class

        target_score = logits[0, class_to_explain]
        target_score.backward()

        if self.activations is None:
            raise RuntimeError("Grad-CAM activations were not captured.")

        if self.gradients is None:
            raise RuntimeError("Grad-CAM gradients were not captured.")

        # Average gradients across the spatial dimensions.
        weights = self.gradients.mean(
            dim=(2, 3),
            keepdim=True,
        )

        # Weighted combination of the activation maps.
        cam = (
            weights * self.activations
        ).sum(dim=1, keepdim=True)

        # Keep only positive influence.
        cam = torch.relu(cam)

        # Resize the heatmap to match the input image.
        cam = F.interpolate(
            cam,
            size=input_tensor.shape[2:],
            mode="bilinear",
            align_corners=False,
        )

        cam = cam.squeeze().detach().cpu().numpy()

        # Normalize the heatmap to the range 0–1.
        cam_min = cam.min()
        cam_max = cam.max()

        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        return {
            "heatmap": cam,
            "predicted_class": predicted_class,
            "confidence": predicted_confidence,
            "explained_class": class_to_explain,
            "probabilities": probabilities.detach().cpu().numpy()[0],
        }

    def remove_hooks(self):
        self.forward_handle.remove()


def load_and_preprocess_image(
    image_path,
    image_size,
):
    image = Image.open(image_path).convert("RGB")

    display_image = image.resize(
        (image_size, image_size)
    )

    transform = transforms.Compose(
        [
            transforms.Resize(
                (image_size, image_size)
            ),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    input_tensor = transform(image).unsqueeze(0)

    display_array = np.asarray(
        display_image
    ).astype(np.float32) / 255.0

    return input_tensor, display_array


def create_overlay(
    original_image,
    heatmap,
    heatmap_strength=0.45,
):
    """
    Converts the heatmap into colors and overlays it on the image.
    """

    colored_heatmap = plt.get_cmap("jet")(heatmap)[..., :3]

    overlay = (
        (1.0 - heatmap_strength) * original_image
        + heatmap_strength * colored_heatmap
    )

    return np.clip(overlay, 0, 1)


def main():
    args = parse_args()

    if not args.image.exists():
        raise FileNotFoundError(
            f"Image was not found:\n{args.image}"
        )

    if args.target_class is not None:
        if args.target_class < 0 or args.target_class >= len(CLASS_NAMES):
            raise ValueError(
                "--target-class must be 0, 1, 2, or 3."
            )

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print(f"Device: {device}")
    print(f"Image: {args.image}")

    args.output.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    input_tensor, original_image = load_and_preprocess_image(
        image_path=args.image,
        image_size=args.image_size,
    )

    input_tensor = input_tensor.to(device)

    results = {}

    for model_name in MODEL_NAMES:
        checkpoint_path = (
            args.checkpoint_dir
            / CHECKPOINT_FILENAMES[model_name]
        )

        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"Checkpoint was not found for {model_name}:\n"
                f"{checkpoint_path}"
            )

        model = load_model(
            model_name=model_name,
            checkpoint_path=checkpoint_path,
            device=device,
        )

        layer_name, target_layer = find_last_conv_layer(model)

        print(
            f"{model_name} Grad-CAM layer: {layer_name}"
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

        # Release memory before loading the next model.
        del model
        del gradcam

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    # Original image plus one Grad-CAM for each model.
    figure, axes = plt.subplots(
        1,
        5,
        figsize=(22, 5),
    )

    axes[0].imshow(original_image)
    axes[0].set_title("Original image")
    axes[0].axis("off")

    display_names = {
        "resnet50": "ResNet50",
        "densenet121": "DenseNet121",
        "efficientnet_b0": "EfficientNet-B0",
        "vgg16": "VGG16",
    }

    for index, model_name in enumerate(
        MODEL_NAMES,
        start=1,
    ):
        result = results[model_name]

        prediction_name = CLASS_NAMES[
            result["predicted_class"]
        ]

        explained_name = CLASS_NAMES[
            result["explained_class"]
        ]

        axes[index].imshow(result["overlay"])

        if result["predicted_class"] == result["explained_class"]:
            title = (
                f"{display_names[model_name]}\n"
                f"Prediction: {prediction_name}\n"
                f"Confidence: {result['confidence'] * 100:.1f}%"
            )
        else:
            title = (
                f"{display_names[model_name]}\n"
                f"Prediction: {prediction_name} "
                f"({result['confidence'] * 100:.1f}%)\n"
                f"Explaining: {explained_name}"
            )

        axes[index].set_title(
            title,
            fontsize=10,
        )
        axes[index].axis("off")

    if args.target_class is None:
        figure.suptitle(
            "Grad-CAM Comparison: Each Model's Predicted Class",
            f"Ensemble Prediction: {CLASS_NAMES[ensemble_class]} ",
            f"({ensemble_confidence * 100:.1f}%)",
            fontsize=16,
        )
    else:
        figure.suptitle(
            "Grad-CAM Comparison for "
            f"{CLASS_NAMES[args.target_class]}",
            fontsize=16,
        )

    figure.tight_layout(
        rect=[0, 0, 1, 0.92]
    )

    figure.savefig(
        args.output,
        dpi=300,
        bbox_inches="tight",
    )

    plt.show()
    plt.close(figure)

    print("\nPredictions")

    for model_name in MODEL_NAMES:
        result = results[model_name]

        predicted_name = CLASS_NAMES[
            result["predicted_class"]
        ]

        print(
            f"{display_names[model_name]:16s}: "
            f"{predicted_name:20s} "
            f"{result['confidence'] * 100:.2f}%"
        )

    print(f"\nSaved side-by-side Grad-CAM to:\n{args.output}")
    all_probabilities = np.stack(
    [results[name]["probabilities"] for name in MODEL_NAMES]
    )

    ensemble_probabilities = all_probabilities.mean(axis=0)
    ensemble_class = int(np.argmax(ensemble_probabilities))
    ensemble_confidence = float(ensemble_probabilities[ensemble_class])

    print("\nENSEMBLE RESULT")
    print("-" * 40)
    print(f"Prediction: {CLASS_NAMES[ensemble_class]}")
    print(f"Confidence: {ensemble_confidence * 100:.2f}%")
    


if __name__ == "__main__":
    main()