from torch import nn
from torchvision.models import ResNet50_Weights, resnet50


def build_resnet50(
    num_classes: int,
    freeze_backbone: bool = True,
    dropout: float = 0.3,
    weights: ResNet50_Weights = ResNet50_Weights.DEFAULT,
) -> nn.Module:
    """Build an ImageNet-pretrained ResNet50 classifier for BUSI classes."""
    model = resnet50(weights=weights)

    if freeze_backbone:
        for parameter in model.parameters():
            parameter.requires_grad = False

    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=dropout),
        nn.Linear(in_features, num_classes),
    )

    return model
