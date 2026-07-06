import argparse
import json
from pathlib import Path

import torch
from torch import nn, optim

from busiDataset import create_data_loaders
from modelhyperparams import TrainingConfig
from resnetModel import build_resnet50


def parse_args():
    config = TrainingConfig()
    parser = argparse.ArgumentParser(description="Train pretrained ResNet50 on BUSI images.")
    parser.add_argument("--data-dir", type=Path, default=config.data_dir)
    parser.add_argument("--output-dir", type=Path, default=config.output_dir)
    parser.add_argument("--epochs", type=int, default=config.epochs)
    parser.add_argument("--batch-size", type=int, default=config.batch_size)
    parser.add_argument("--learning-rate", type=float, default=config.learning_rate)
    parser.add_argument("--weight-decay", type=float, default=config.weight_decay)
    parser.add_argument("--image-size", type=int, default=config.image_size)
    parser.add_argument("--num-workers", type=int, default=config.num_workers)
    parser.add_argument("--validation-split", type=float, default=config.validation_split)
    parser.add_argument("--test-split", type=float, default=config.test_split)
    parser.add_argument("--seed", type=int, default=config.seed)
    parser.add_argument("--dropout", type=float, default=config.dropout)
    parser.add_argument(
        "--fine-tune",
        action="store_true",
        help="Unfreeze the ResNet50 backbone instead of training only the final classifier.",
    )
    return parser.parse_args()


def train_one_epoch(model, data_loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in data_loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(dim=1) == labels).sum().item()
        total += labels.size(0)

    return running_loss / total, correct / total


@torch.no_grad()
def evaluate(model, data_loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in data_loader:
        images = images.to(device)
        labels = labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(dim=1) == labels).sum().item()
        total += labels.size(0)

    return running_loss / total, correct / total


def main():
    args = parse_args()
    torch.manual_seed(args.seed)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    loaders = create_data_loaders(
        data_dir=args.data_dir,
        image_size=args.image_size,
        batch_size=args.batch_size,
        validation_split=args.validation_split,
        test_split=args.test_split,
        seed=args.seed,
        num_workers=args.num_workers,
    )

    model = build_resnet50(
        num_classes=len(loaders["classes"]),
        freeze_backbone=not args.fine_tune,
        dropout=args.dropout,
    ).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(
        filter(lambda parameter: parameter.requires_grad, model.parameters()),
        lr=args.learning_rate,
        weight_decay=args.weight_decay,
    )

    best_val_accuracy = 0.0
    best_model_path = args.output_dir / "best_resnet50_busi.pt"

    print(f"Device: {device}")
    print(f"Classes: {loaders['classes']}")
    print(f"Training images: {len(loaders['train'].dataset)}")
    print(f"Validation images: {len(loaders['val'].dataset)}")
    print(f"Test images: {len(loaders['test'].dataset)}")

    for epoch in range(1, args.epochs + 1):
        train_loss, train_accuracy = train_one_epoch(
            model,
            loaders["train"],
            criterion,
            optimizer,
            device,
        )
        val_loss, val_accuracy = evaluate(model, loaders["val"], criterion, device)

        print(
            f"Epoch {epoch:02d}/{args.epochs} "
            f"train_loss={train_loss:.4f} train_acc={train_accuracy:.4f} "
            f"val_loss={val_loss:.4f} val_acc={val_accuracy:.4f}"
        )

        if val_accuracy > best_val_accuracy:
            best_val_accuracy = val_accuracy
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "classes": loaders["classes"],
                    "image_size": args.image_size,
                    "val_accuracy": val_accuracy,
                },
                best_model_path,
            )

    test_loss, test_accuracy = evaluate(model, loaders["test"], criterion, device)
    metrics = {
        "best_val_accuracy": best_val_accuracy,
        "test_loss": test_loss,
        "test_accuracy": test_accuracy,
        "classes": loaders["classes"],
    }
    (args.output_dir / "metrics.json").write_text(json.dumps(metrics, indent=2))

    print(f"Best model saved to: {best_model_path}")
    print(f"Test loss: {test_loss:.4f}")
    print(f"Test accuracy: {test_accuracy:.4f}")


if __name__ == "__main__":
    main()
