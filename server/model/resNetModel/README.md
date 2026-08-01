# ResNet50 BUSI MVP

This folder contains a minimum viable PyTorch pipeline for training an ImageNet-pretrained ResNet50 on BUSI breast ultrasound images.

Expected dataset layout:

```text
data/BUSI/
  benign/
    benign (1).png
    benign (1)_mask.png
  malignant/
    malignant (1).png
    malignant (1)_mask.png
  normal/
    normal (1).png
    normal (1)_mask.png
```

Mask files are skipped automatically when `"mask"` appears in the filename.

Install dependencies inside your virtual environment:

```powershell
venv\Scripts\activate
pip install -r resNetModel\requirements.txt
```

Train from the project root:

```powershell
python resNetModel\train.py --data-dir data\BUSI
```

Useful options:

```powershell
python resNetModel\train.py --data-dir data\BUSI --epochs 15 --batch-size 8
python resNetModel\train.py --data-dir data\BUSI --fine-tune
```

Outputs are written to:

```text
resNetModel/checkpoints/best_resnet50_busi.pt
resNetModel/checkpoints/metrics.json
```
