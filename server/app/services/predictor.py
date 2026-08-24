import base64
from io import BytesIO

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

from app.config import DEFAULT_CHECKPOINT_DIR
from app.services.checkpoints import ensure_checkpoints
from app.services.preprocessing import preprocess_image
from model.resNetModel.modelFactory import build_model


FALLBACK_CLASSES = [
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

DISPLAY_NAMES = {
    "resnet50": "ResNet50",
    "densenet121": "DenseNet121",
    "efficientnet_b0": "EfficientNet-B0",
    "vgg16": "VGG16",
}


def extract_state_dict(checkpoint):
    if not isinstance(checkpoint, dict):
        raise TypeError("Checkpoint must be a dictionary.")

    if "model_state_dict" in checkpoint:
        return checkpoint["model_state_dict"]

    if "state_dict" in checkpoint:
        return checkpoint["state_dict"]

    if "model" in checkpoint and isinstance(checkpoint["model"], dict):
        return checkpoint["model"]

    if checkpoint and all(isinstance(value, torch.Tensor) for value in checkpoint.values()):
        return checkpoint

    raise KeyError("Could not find model weights inside the checkpoint.")


class Predictor:
    def __init__(self, checkpoint_dir=DEFAULT_CHECKPOINT_DIR):
        self.checkpoint_dir = checkpoint_dir
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
        elif torch.backends.mps.is_available():
            self.device = torch.device("mps")
        else:
            self.device = torch.device("cpu")
        self.models = {}
        self.classes = FALLBACK_CLASSES
        self.image_size = 224
        self.load_error: str | None = None
        self._load_models()

    @property
    def model_loaded(self) -> bool:
        return len(self.models) == len(MODEL_NAMES)

    @property
    def loaded_model_names(self) -> list[str]:
        return list(self.models.keys())

    def _load_models(self) -> None:
        try:
            ensure_checkpoints(
                self.checkpoint_dir,
                [CHECKPOINT_FILENAMES[name] for name in MODEL_NAMES],
            )
        except RuntimeError as exc:
            self.load_error = str(exc)
            return

        if not self.checkpoint_dir.exists():
            self.load_error = f"Checkpoint directory not found: {self.checkpoint_dir}"
            return

        try:
            for model_name in MODEL_NAMES:
                checkpoint_path = self.checkpoint_dir / CHECKPOINT_FILENAMES[model_name]

                if not checkpoint_path.exists():
                    raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")

                checkpoint = torch.load(checkpoint_path, map_location=self.device)

                if model_name == MODEL_NAMES[0]:
                    self.classes = checkpoint.get("classes", FALLBACK_CLASSES)
                    self.image_size = int(checkpoint.get("image_size", 224))

                model = build_model(
                    model_name=model_name,
                    num_classes=len(self.classes),
                    freeze_backbone=False,
                    dropout=0.3,
                    pretrained=False,
                )
                model.load_state_dict(extract_state_dict(checkpoint))
                model.to(self.device)
                model.eval()
                self.models[model_name] = model
        except Exception as exc:
            self.models = {}
            self.load_error = str(exc)

    @torch.no_grad()
    def _predict_probabilities(self, input_tensor):
        model_probabilities = {}

        for model_name, model in self.models.items():
            logits = model(input_tensor)
            probabilities = torch.softmax(logits, dim=1).squeeze(0)
            model_probabilities[model_name] = probabilities

        return model_probabilities

    def predict(self, image):
        if not self.model_loaded:
            return self._fallback_prediction()

        input_tensor = preprocess_image(image, self.image_size).to(self.device)
        model_probabilities = self._predict_probabilities(input_tensor)

        ensemble_probabilities = torch.stack(
            list(model_probabilities.values())
        ).mean(dim=0).cpu()

        predicted_idx = int(ensemble_probabilities.argmax().item())
        gradcams = self._generate_gradcams(
            image=image,
            input_tensor=input_tensor,
            target_class=predicted_idx,
        )

        return {
            "model_loaded": True,
            "predicted_class": self.classes[predicted_idx],
            "confidence": float(ensemble_probabilities[predicted_idx].item()),
            "probabilities": {
                class_name: float(ensemble_probabilities[idx].item())
                for idx, class_name in enumerate(self.classes)
            },
            "individual_predictions": {
                model_name: {
                    "predicted_class": self.classes[int(probabilities.argmax().item())],
                    "confidence": float(probabilities.max().item()),
                    "probabilities": {
                        class_name: float(probabilities[idx].item())
                        for idx, class_name in enumerate(self.classes)
                    },
                }
                for model_name, probabilities in model_probabilities.items()
            },
            "gradcams": gradcams,
        }

    def _generate_gradcams(self, image, input_tensor, target_class):
        display_image = image.resize((self.image_size, self.image_size))
        original_array = np.asarray(display_image).astype(np.float32) / 255.0
        gradcams = {}

        for model_name, model in self.models.items():
            layer_name, target_layer = self._find_last_conv_layer(model)
            activations = None
            gradients = None

            def save_activations(module, inputs, output):
                nonlocal activations
                activations = output
                output.register_hook(save_gradients)

            def save_gradients(gradient):
                nonlocal gradients
                gradients = gradient

            handle = target_layer.register_forward_hook(save_activations)

            try:
                model.zero_grad(set_to_none=True)
                logits = model(input_tensor)
                probabilities = torch.softmax(logits, dim=1)
                predicted_class = int(probabilities.argmax(dim=1).item())
                confidence = float(probabilities[0, predicted_class].item())
                logits[0, target_class].backward()

                if activations is None or gradients is None:
                    raise RuntimeError(f"Grad-CAM++ hooks failed for {model_name}.")

                # Grad-CAM++ channel weights (Chattopadhyay et al.)
                # alpha_ij^k = G^2 / (2*G^2 + A_sum * G^3)
                # w^k = sum_{i,j} alpha_ij^k * ReLU(G_ij^k)
                grads_power_2 = gradients.pow(2)
                grads_power_3 = grads_power_2 * gradients
                sum_activations = activations.sum(dim=(2, 3), keepdim=True)
                denom = (2.0 * grads_power_2) + (sum_activations * grads_power_3)
                denom = torch.where(
                    denom != 0.0,
                    denom,
                    torch.full_like(denom, 1e-8),
                )
                alpha = grads_power_2 / denom
                weights = (alpha * torch.relu(gradients)).sum(
                    dim=(2, 3),
                    keepdim=True,
                )
                cam = torch.relu((weights * activations).sum(dim=1, keepdim=True))
                cam = F.interpolate(
                    cam,
                    size=input_tensor.shape[2:],
                    mode="bilinear",
                    align_corners=False,
                )
                heatmap = cam.squeeze().detach().cpu().numpy()
                heatmap_min = float(heatmap.min())
                heatmap_max = float(heatmap.max())

                if heatmap_max > heatmap_min:
                    heatmap = (heatmap - heatmap_min) / (heatmap_max - heatmap_min)
                else:
                    heatmap = np.zeros_like(heatmap)

                overlay = self._create_overlay(original_array, heatmap)
                gradcams[model_name] = {
                    "display_name": DISPLAY_NAMES[model_name],
                    "predicted_class": self.classes[predicted_class],
                    "confidence": confidence,
                    "explained_class": self.classes[target_class],
                    "overlay": self._array_to_data_url(overlay),
                }
            finally:
                handle.remove()
                model.zero_grad(set_to_none=True)

        return gradcams

    def _find_last_conv_layer(self, model):
        last_name = None
        last_layer = None

        for name, module in model.named_modules():
            if isinstance(module, torch.nn.Conv2d):
                last_name = name
                last_layer = module

        if last_layer is None:
            raise ValueError("No convolutional layer was found in the model.")

        return last_name, last_layer

    def _create_overlay(self, original_array, heatmap, heatmap_strength=0.45):
        colored_heatmap = plt.get_cmap("jet")(heatmap)[..., :3]
        overlay = (
            (1.0 - heatmap_strength) * original_array
            + heatmap_strength * colored_heatmap
        )
        return np.clip(overlay, 0, 1)

    def _array_to_data_url(self, image_array):
        image = Image.fromarray((image_array * 255).astype(np.uint8))
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        return f"data:image/png;base64,{encoded}"

    def _fallback_prediction(self):
        probabilities = {
            "Benign": 0.25,
            "Carcinoma_InSitu": 0.25,
            "Carcinoma_Invasive": 0.25,
            "Normal": 0.25,
        }
        return {
            "model_loaded": False,
            "predicted_class": "Benign",
            "confidence": probabilities["Benign"],
            "probabilities": probabilities,
            "individual_predictions": {},
            "gradcams": {},
        }


predictor = Predictor()
