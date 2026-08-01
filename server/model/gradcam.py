from pathlib import Path
import random


import torch
import torch.nn as nn
import torch.nn.functional as F #softmax
import numpy as np
import matplotlib.pyplot as plt


from PIL import Image #Python Imaging Library to open the png
from torchvision import transforms
from torchvision.models import resnet50
from skimage.transform import resize


#Trained model of Allen
MODEL_PATH = Path("resNetModel/checkpoints/best_resnet50_busi.pt")

DATA_DIR = Path("data/BUSI")
OUTPUT_IMAGE = Path("gradcam_result.png")

#GPU or if not CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

checkpoint = torch.load(MODEL_PATH, map_location=device)

classes = checkpoint["classes"]

#224 as set in modelhyperparams.py
image_size = checkpoint["image_size"]


print("Classes:", classes)
print("Image size:", image_size)
print("Validation accuracy:", checkpoint["val_accuracy"])

#new Resnet model with no weights, since we will add them from trained model
model = resnet50(weights=None)

in_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(p=0.3),
    nn.Linear(in_features, len(classes)),
)

#Loading trained weights into model
model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()


transform = transforms.Compose([
    transforms.Resize((image_size, image_size)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


all_images = (
    list(DATA_DIR.rglob("*.png"))
    + list(DATA_DIR.rglob("*.jpg"))
    + list(DATA_DIR.rglob("*.jpeg"))
)

if len(all_images) == 0:
    raise FileNotFoundError("No images found in data/BUSI")

image_path = random.choice(all_images)
true_class = image_path.parent.name

image = Image.open(image_path).convert("RGB")
input_tensor = transform(image).unsqueeze(0).to(device)


with torch.no_grad():
    outputs = model(input_tensor)
    probs = F.softmax(outputs, dim=1)
    confidence, pred_idx = torch.max(probs, dim=1)

predicted_class = classes[pred_idx.item()]
confidence_score = confidence.item()

print("\n--- Prediction ---")
print("Image:", image_path)
print("True class:", true_class)
print("Predicted class:", predicted_class)
print("Confidence:", round(confidence_score * 100, 2), "%")
print("Correct:", true_class == predicted_class)



class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        self.target_layer.register_forward_hook(self.save_activation)
        self.target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor, class_idx):
        output = self.model(input_tensor)
        score = output[:, class_idx]

        self.model.zero_grad()
        score.backward()

        gradients = self.gradients[0]
        activations = self.activations[0]

        weights = gradients.mean(dim=(1, 2))

        cam = torch.zeros(activations.shape[1:], dtype=torch.float32).to(device)

        for i, weight in enumerate(weights):
            cam += weight * activations[i]

        cam = torch.relu(cam)
        cam = cam.cpu().numpy()

        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)

        return cam



target_layer = model.layer4[-1]
gradcam = GradCAM(model, target_layer)

cam = gradcam.generate(input_tensor, pred_idx.item())

original_resized = image.resize((image_size, image_size))
original_np = np.array(original_resized)

cam_resized = resize(cam, (image_size, image_size))

def get_triage(predicted_class, confidence):
    cancer_classes = ["Carcinoma_InSitu", "Carcinoma_Invasive"]

    if confidence < 0.60:
        return "Uncertain — expert review recommended"

    if predicted_class in cancer_classes and confidence >= 0.80:
        return "Urgent review"

    if predicted_class in cancer_classes:
        return "Medium priority review"

    return "Low priority"


triage = get_triage(predicted_class, confidence_score)

print("Triage:", triage)

plt.figure(figsize=(10, 4))

plt.subplot(1, 2, 1)
plt.imshow(original_np)
plt.title(f"Original\nTrue: {true_class}")
plt.axis("off")

plt.subplot(1, 2, 2)
plt.imshow(original_np)
plt.imshow(cam_resized, alpha=0.45, cmap="jet")
plt.title(
    f"Grad-CAM\nPredicted: {predicted_class}\n"
    f"Confidence: {confidence_score:.1%}\n{triage}"
)
plt.axis("off")

plt.tight_layout()
plt.savefig(OUTPUT_IMAGE, dpi=200)
plt.show()

print(f"\nSaved heatmap to: {OUTPUT_IMAGE.resolve()}")