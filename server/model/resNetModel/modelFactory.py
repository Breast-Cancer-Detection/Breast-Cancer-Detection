#fileInvolved
from torch import nn
from torchvision.models import (
    ResNet50_Weights,
    DenseNet121_Weights,
    EfficientNet_B0_Weights,
    VGG16_Weights,
    resnet50,
    densenet121,
    efficientnet_b0,
    vgg16,
)


def build_model(
    model_name: str,
    num_classes: int,
    freeze_backbone: bool = True,
    dropout: float = 0.3,
    pretrained: bool = True,
) -> nn.Module:

    model_name = model_name.lower()

    if model_name == "resnet50":
        weights = ResNet50_Weights.DEFAULT if pretrained else None
        model = resnet50(weights=weights)

        if freeze_backbone:
            for parameter in model.parameters():
                parameter.requires_grad = False

        in_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(in_features, num_classes),
        )

    elif model_name == "densenet121":
        weights = DenseNet121_Weights.DEFAULT if pretrained else None
        model = densenet121(weights=weights)

        if freeze_backbone:
            for parameter in model.parameters():
                parameter.requires_grad = False

        in_features = model.classifier.in_features
        model.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(in_features, num_classes),
        )

    elif model_name == "efficientnet_b0":
        weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
        model = efficientnet_b0(weights=weights)

        if freeze_backbone:
            for parameter in model.parameters():
                parameter.requires_grad = False

        in_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(in_features, num_classes),
        )

    elif model_name == "vgg16":
        weights = VGG16_Weights.DEFAULT if pretrained else None
        model = vgg16(weights=weights)

        if freeze_backbone:
            for parameter in model.parameters():
                parameter.requires_grad = False

        in_features = model.classifier[6].in_features
        model.classifier[6] = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(in_features, num_classes),
        )

    else:
        raise ValueError(
            f"Unknown model: {model_name}. "
            "Choose resnet50, densenet121, efficientnet_b0, or vgg16."
        )

    return model
