from pathlib import Path
import sys
import json

import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt

from torchvision.models import resnet50
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

# imports Allen's dataset loader from resNetModel/
PROJECT_ROOT = Path(__file__).resolve().parent
RESNET_DIR = PROJECT_ROOT / "resNetModel"

sys.path.append(str(RESNET_DIR))

from busiDataset import create_data_loaders

MODEL_PATH = Path("resNetModel/checkpoints/best_resnet50_busi.pt")
DATA_DIR = Path("data/BUSI")
OUTPUT_DIR = Path("evaluation_results")
OUTPUT_DIR.mkdir(exist_ok=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# Load trained checkpoint
checkpoint = torch.load(MODEL_PATH, map_location=device)
classes = checkpoint["classes"]
image_size = checkpoint["image_size"]

print("Classes:", classes)
print("Image size:", image_size)
print("Best validation accuracy:", checkpoint["val_accuracy"])


# Rebuild same ResNet50 model structure
model = resnet50(weights=None)

in_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(p=0.3),
    nn.Linear(in_features, len(classes)),
)

model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()


loaders = create_data_loaders(
    data_dir=DATA_DIR,
    image_size=image_size,
    batch_size=16,
    validation_split=0.2,
    test_split=0.1,
    seed=42,
    num_workers=0,
)

test_loader = loaders["test"]

all_true = []
all_pred = []


# test set
with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        labels = labels.to(device)

        outputs = model(images)
        predictions = outputs.argmax(dim=1)

        all_true.extend(labels.cpu().numpy())
        all_pred.extend(predictions.cpu().numpy())


# Calculate metrics
accuracy = accuracy_score(all_true, all_pred)

precision, recall, f1, support = precision_recall_fscore_support(
    all_true,
    all_pred,
    labels=list(range(len(classes))),
    zero_division=0,
)

macro_precision, macro_recall, macro_f1, _ = precision_recall_fscore_support(
    all_true,
    all_pred,
    average="macro",
    zero_division=0,
)

weighted_precision, weighted_recall, weighted_f1, _ = precision_recall_fscore_support(
    all_true,
    all_pred,
    average="weighted",
    zero_division=0,
)


print("\n--- Overall Metrics ---")
print("Accuracy:", round(accuracy, 4))
print("Macro Precision:", round(macro_precision, 4))
print("Macro Recall:", round(macro_recall, 4))
print("Macro F1:", round(macro_f1, 4))
print("Weighted Precision:", round(weighted_precision, 4))
print("Weighted Recall:", round(weighted_recall, 4))
print("Weighted F1:", round(weighted_f1, 4))


print("\n--- Classification Report ---")
report = classification_report(
    all_true,
    all_pred,
    target_names=classes,
    zero_division=0,
)
print(report)


# JSON
metrics = {
    "accuracy": accuracy,
    "macro_precision": macro_precision,
    "macro_recall": macro_recall,
    "macro_f1": macro_f1,
    "weighted_precision": weighted_precision,
    "weighted_recall": weighted_recall,
    "weighted_f1": weighted_f1,
    "per_class_metrics": {},
}

for i, class_name in enumerate(classes):
    metrics["per_class_metrics"][class_name] = {
        "precision": float(precision[i]),
        "recall": float(recall[i]),
        "f1": float(f1[i]),
        "support": int(support[i]),
    }

with open(OUTPUT_DIR / "metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

with open(OUTPUT_DIR / "classification_report.txt", "w") as f:
    f.write(report)


# PNG
cm = confusion_matrix(all_true, all_pred, labels=list(range(len(classes))))

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=classes,
)

fig, ax = plt.subplots(figsize=(9, 7))
disp.plot(ax=ax, cmap="Blues", values_format="d")
plt.title("Confusion Matrix: ResNet50 Histology Classifier")
plt.xticks(rotation=30, ha="right")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "confusion_matrix.png", dpi=200)
plt.show()


print("\nSaved results to:")
print(OUTPUT_DIR / "metrics2.json")
print(OUTPUT_DIR / "classification_report2.txt")
print(OUTPUT_DIR / "confusion_matrix2.png")