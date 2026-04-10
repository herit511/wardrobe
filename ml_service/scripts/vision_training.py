"""
Style DNA — YOLOv11 + Multi-Head Classifier Training Script
=============================================================
Trains a two-stage clothing detection and classification pipeline
on the DeepFashion2 dataset.

Stage 1: YOLOv11 fine-tuning for clothing bounding box detection
Stage 2: Multi-head CNN classifier for attributes
         (item category, color, pattern, fit, occasion, weather)

Prerequisites:
    1. Download DeepFashion2 from:
       https://github.com/switchablenorms/DeepFashion2
    2. Extract to ml_service/data/deepfashion2/ with structure:
         data/deepfashion2/
           train/
             image/
             annos/
           validation/
             image/
             annos/
    3. Install dependencies:
       pip install -r requirements.txt

Usage:
    cd ml_service
    python scripts/vision_training.py --stage all --epochs 50 --batch-size 16

    Or train stages independently:
    python scripts/vision_training.py --stage yolo --epochs 100
    python scripts/vision_training.py --stage classifier --epochs 30

Output:
    weights/clothing_detector.pt   — YOLOv11 fine-tuned weights
    weights/clothing_classifier.pt — Multi-head classifier weights
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image

# ── Constants ─────────────────────────────────────────────────────────────────

ROOT_DIR = Path(__file__).resolve().parent.parent  # ml_service/
DATA_DIR = ROOT_DIR / "data" / "deepfashion2"
WEIGHTS_DIR = ROOT_DIR / "weights"
YOLO_DATA_DIR = ROOT_DIR / "data" / "yolo_format"  # converted dataset

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# DeepFashion2 category IDs → our canonical item labels
# DeepFashion2 has 13 clothing categories:
DEEPFASHION2_CATEGORIES = {
    1: "short_sleeve_top",
    2: "long_sleeve_top",
    3: "short_sleeve_outwear",
    4: "long_sleeve_outwear",
    5: "vest",
    6: "sling",
    7: "shorts",
    8: "trousers",
    9: "skirt",
    10: "short_sleeve_dress",
    11: "long_sleeve_dress",
    12: "vest_dress",
    13: "sling_dress",
}

# Map DeepFashion2 categories to our app's canonical labels
DF2_TO_CANONICAL = {
    "short_sleeve_top": "t-shirt",
    "long_sleeve_top": "shirt",
    "short_sleeve_outwear": "jacket",
    "long_sleeve_outwear": "jacket",
    "vest": "vest",
    "sling": "tank top",
    "shorts": "shorts",
    "trousers": "trousers",
    "skirt": "skirt",
    "short_sleeve_dress": "dress",
    "long_sleeve_dress": "dress",
    "vest_dress": "dress",
    "sling_dress": "dress",
}

# Canonical label sets (must match main.py)
ITEM_LABELS = [
    "t-shirt", "graphic tee", "polo shirt", "shirt", "dress shirt", "blouse",
    "tank top", "crop top", "sweater", "turtleneck", "hoodie", "sweatshirt",
    "jeans", "slim jeans", "straight jeans", "wide leg jeans", "chinos",
    "trousers", "shorts", "cargo pants", "joggers", "sweatpants",
    "skirt", "mini skirt", "midi skirt", "maxi skirt", "leggings",
    "jacket", "blazer", "suit jacket", "denim jacket", "leather jacket",
    "bomber jacket", "trench coat", "overcoat", "parka", "cardigan", "vest",
    "sneakers", "white sneakers", "chunky sneakers", "loafers", "oxford shoes",
    "derby shoes", "chelsea boots", "ankle boots", "boots", "sandals", "slides",
    "heels", "block heels", "mules", "flip flops", "dress",
]

COLOR_LABELS = [
    "white", "black", "gray", "light gray", "beige", "cream", "ivory",
    "off-white", "camel", "tan", "taupe", "charcoal", "brown", "dark brown",
    "navy", "blue", "light blue", "royal blue", "sky blue", "cobalt", "denim",
    "green", "olive", "khaki", "forest green", "sage", "mint", "emerald",
    "red", "dark red", "crimson", "maroon", "burgundy", "wine",
    "pink", "hot pink", "blush", "mauve", "rose",
    "yellow", "mustard", "gold", "orange", "coral", "peach", "rust", "terracotta",
    "purple", "lavender", "violet", "plum", "lilac",
]

PATTERN_LABELS = [
    "solid", "striped", "thin stripe", "wide stripe", "checkered", "plaid",
    "tartan", "floral", "small floral", "graphic", "camo", "animal",
    "paisley", "houndstooth", "herringbone", "pinstripe", "polka",
    "tie_dye", "geometric", "abstract",
]

FIT_LABELS = ["slim", "regular", "relaxed", "oversized", "boxy"]
OCCASION_LABELS = ["casual", "office", "party", "date night", "gym", "ethnic"]
WEATHER_LABELS = ["hot", "mild", "cold"]

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("training")


# ══════════════════════════════════════════════════════════════════════════════
# STAGE 1: YOLOv11 FINE-TUNING FOR CLOTHING DETECTION
# ══════════════════════════════════════════════════════════════════════════════

def convert_deepfashion2_to_yolo(split: str = "train"):
    """
    Convert DeepFashion2 annotations to YOLO format.

    DeepFashion2 stores per-image JSON annotations with bounding boxes
    and category_id. YOLO expects:
        <class_id> <x_center> <y_center> <width> <height>
    (all normalized to 0-1).

    Args:
        split: "train" or "validation"
    """
    src_img_dir = DATA_DIR / split / "image"
    src_anno_dir = DATA_DIR / split / "annos"
    dst_img_dir = YOLO_DATA_DIR / "images" / split
    dst_lbl_dir = YOLO_DATA_DIR / "labels" / split

    if not src_img_dir.exists():
        logger.error(f"Source image directory not found: {src_img_dir}")
        logger.error("Please download DeepFashion2 and extract to ml_service/data/deepfashion2/")
        sys.exit(1)

    dst_img_dir.mkdir(parents=True, exist_ok=True)
    dst_lbl_dir.mkdir(parents=True, exist_ok=True)

    anno_files = sorted(src_anno_dir.glob("*.json"))
    logger.info(f"Converting {len(anno_files)} {split} annotations to YOLO format...")

    converted = 0
    for anno_path in anno_files:
        try:
            with open(anno_path, "r") as f:
                anno = json.load(f)
        except (json.JSONDecodeError, IOError):
            continue

        # Get image dimensions
        img_name = anno_path.stem + ".jpg"
        img_path = src_img_dir / img_name
        if not img_path.exists():
            continue

        try:
            img = Image.open(img_path)
            img_w, img_h = img.size
        except Exception:
            continue

        # Create symlink / copy for YOLO image dir
        dst_img_path = dst_img_dir / img_name
        if not dst_img_path.exists():
            import shutil
            shutil.copy2(img_path, dst_img_path)

        # Convert each annotated item
        yolo_lines = []
        for key, value in anno.items():
            if not isinstance(value, dict) or "category_id" not in value:
                continue

            cat_id = value["category_id"]
            if cat_id not in DEEPFASHION2_CATEGORIES:
                continue

            bbox = value.get("bounding_box", None)
            if bbox is None or len(bbox) < 4:
                continue

            # DeepFashion2 bbox: [x1, y1, x2, y2]
            x1, y1, x2, y2 = bbox[:4]

            # Convert to YOLO format: center_x, center_y, width, height (normalized)
            cx = ((x1 + x2) / 2) / img_w
            cy = ((y1 + y2) / 2) / img_h
            bw = (x2 - x1) / img_w
            bh = (y2 - y1) / img_h

            # Clamp to [0, 1]
            cx = max(0.0, min(1.0, cx))
            cy = max(0.0, min(1.0, cy))
            bw = max(0.001, min(1.0, bw))
            bh = max(0.001, min(1.0, bh))

            # YOLO class ID (0-indexed)
            class_id = cat_id - 1
            yolo_lines.append(f"{class_id} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}")

        if yolo_lines:
            label_path = dst_lbl_dir / (anno_path.stem + ".txt")
            with open(label_path, "w") as f:
                f.write("\n".join(yolo_lines))
            converted += 1

    logger.info(f"Converted {converted} images to YOLO format in {dst_lbl_dir}")
    return converted


def create_yolo_dataset_yaml():
    """Create the dataset.yaml required by Ultralytics YOLO."""
    yaml_path = YOLO_DATA_DIR / "dataset.yaml"
    yaml_path.parent.mkdir(parents=True, exist_ok=True)

    category_names = [DEEPFASHION2_CATEGORIES[i] for i in range(1, 14)]

    content = f"""# DeepFashion2 → YOLO format
# Auto-generated by vision_training.py

path: {YOLO_DATA_DIR.resolve()}
train: images/train
val: images/validation

nc: {len(category_names)}
names: {category_names}
"""
    with open(yaml_path, "w") as f:
        f.write(content)

    logger.info(f"Created YOLO dataset config: {yaml_path}")
    return yaml_path


def train_yolo(epochs: int = 100, batch_size: int = 16, img_size: int = 640):
    """
    Fine-tune YOLOv11 on DeepFashion2 for clothing detection.

    Uses the Ultralytics API to:
    1. Load a pre-trained YOLOv11n (nano) model
    2. Fine-tune on our converted DeepFashion2 data
    3. Export best weights to weights/clothing_detector.pt
    """
    from ultralytics import YOLO

    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Convert dataset if not already done
    yolo_train_dir = YOLO_DATA_DIR / "images" / "train"
    if not yolo_train_dir.exists() or len(list(yolo_train_dir.glob("*.jpg"))) == 0:
        logger.info("Converting DeepFashion2 → YOLO format...")
        convert_deepfashion2_to_yolo("train")
        convert_deepfashion2_to_yolo("validation")

    # Step 2: Create dataset YAML
    dataset_yaml = create_yolo_dataset_yaml()

    # Step 3: Initialize YOLOv11 nano (pre-trained on COCO)
    #   - yolo11n.pt is the smallest YOLOv11 variant
    #   - Good balance of speed and accuracy for clothing detection
    logger.info("Initializing YOLOv11n model...")
    model = YOLO("yolo11n.pt")

    # Step 4: Train
    logger.info(f"Starting YOLO training: {epochs} epochs, batch={batch_size}, img={img_size}")
    logger.info(f"Device: {DEVICE}")

    results = model.train(
        data=str(dataset_yaml),
        epochs=epochs,
        batch=batch_size,
        imgsz=img_size,
        device=str(DEVICE),
        project=str(ROOT_DIR / "runs" / "detect"),
        name="clothing_detector",
        exist_ok=True,
        # Training hyperparameters
        lr0=0.01,          # Initial learning rate
        lrf=0.01,          # Final learning rate factor
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        warmup_momentum=0.8,
        # Augmentation
        hsv_h=0.015,       # Hue augmentation
        hsv_s=0.7,         # Saturation augmentation
        hsv_v=0.4,         # Value augmentation
        degrees=10.0,      # Rotation
        translate=0.1,
        scale=0.5,
        flipud=0.0,        # No vertical flip (clothing orientation matters)
        fliplr=0.5,        # Horizontal flip OK
        mosaic=1.0,
        mixup=0.1,
        # Callbacks
        save=True,
        save_period=10,
        plots=True,
        verbose=True,
    )

    # Step 5: Copy best weights to our weights directory
    best_src = ROOT_DIR / "runs" / "detect" / "clothing_detector" / "weights" / "best.pt"
    best_dst = WEIGHTS_DIR / "clothing_detector.pt"

    if best_src.exists():
        import shutil
        shutil.copy2(best_src, best_dst)
        logger.info(f"Best YOLO weights saved to: {best_dst}")
    else:
        logger.warning(f"Best weights not found at {best_src}")

    return results


# ══════════════════════════════════════════════════════════════════════════════
# STAGE 2: MULTI-HEAD CLASSIFIER FOR CLOTHING ATTRIBUTES
# ══════════════════════════════════════════════════════════════════════════════

class DeepFashion2ClassifierDataset(Dataset):
    """
    PyTorch Dataset for the multi-head attribute classifier.

    Reads DeepFashion2 images, crops each annotated clothing item,
    and produces labels for: item type, color, pattern.

    Color and pattern are derived from the image itself using
    heuristic pre-labeling (bootstrapping), since DeepFashion2
    only provides category_id natively.
    """

    def __init__(self, split: str = "train", transform=None, max_samples: int = None):
        """
        Args:
            split: "train" or "validation"
            transform: torchvision transforms for the cropped image
            max_samples: limit number of samples (for debugging)
        """
        self.split = split
        self.transform = transform or self._default_transform()
        self.samples = []

        img_dir = DATA_DIR / split / "image"
        anno_dir = DATA_DIR / split / "annos"

        if not img_dir.exists():
            logger.error(f"Dataset not found: {img_dir}")
            logger.error("Download DeepFashion2 to ml_service/data/deepfashion2/")
            return

        anno_files = sorted(anno_dir.glob("*.json"))
        logger.info(f"Loading {split} dataset from {len(anno_files)} annotation files...")

        for anno_path in anno_files:
            try:
                with open(anno_path, "r") as f:
                    anno = json.load(f)
            except (json.JSONDecodeError, IOError):
                continue

            img_name = anno_path.stem + ".jpg"
            img_path = img_dir / img_name
            if not img_path.exists():
                continue

            for key, value in anno.items():
                if not isinstance(value, dict) or "category_id" not in value:
                    continue

                cat_id = value["category_id"]
                if cat_id not in DEEPFASHION2_CATEGORIES:
                    continue

                bbox = value.get("bounding_box", None)
                if bbox is None or len(bbox) < 4:
                    continue

                df2_name = DEEPFASHION2_CATEGORIES[cat_id]
                canonical_name = DF2_TO_CANONICAL.get(df2_name, "t-shirt")

                # Map to index in ITEM_LABELS
                if canonical_name in ITEM_LABELS:
                    item_idx = ITEM_LABELS.index(canonical_name)
                else:
                    item_idx = 0  # default to t-shirt

                self.samples.append({
                    "img_path": str(img_path),
                    "bbox": bbox[:4],
                    "item_idx": item_idx,
                    "category_name": canonical_name,
                })

                if max_samples and len(self.samples) >= max_samples:
                    break

            if max_samples and len(self.samples) >= max_samples:
                break

        logger.info(f"Loaded {len(self.samples)} clothing samples for {split}")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]

        # Load and crop image
        img = Image.open(sample["img_path"]).convert("RGB")
        x1, y1, x2, y2 = sample["bbox"]
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

        # Ensure valid crop
        w, h = img.size
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        if x2 <= x1 or y2 <= y1:
            x1, y1, x2, y2 = 0, 0, w, h

        cropped = img.crop((x1, y1, x2, y2))

        # Extract color label from cropped image (heuristic pre-labeling)
        color_idx = self._extract_color_label(cropped)

        # Pattern: default to solid (heuristic — can be improved with texture analysis)
        pattern_idx = 0  # "solid"

        # Fit: default to regular
        fit_idx = 1  # "regular"

        # Occasion: heuristic based on item type
        occasion_vec = self._item_to_occasion(sample["category_name"])

        # Weather: heuristic based on item type
        weather_vec = self._item_to_weather(sample["category_name"])

        # Apply transform
        if self.transform:
            cropped = self.transform(cropped)

        return {
            "image": cropped,
            "item_label": torch.tensor(sample["item_idx"], dtype=torch.long),
            "color_label": torch.tensor(color_idx, dtype=torch.long),
            "pattern_label": torch.tensor(pattern_idx, dtype=torch.long),
            "fit_label": torch.tensor(fit_idx, dtype=torch.long),
            "occasion_label": torch.tensor(occasion_vec, dtype=torch.float),
            "weather_label": torch.tensor(weather_vec, dtype=torch.float),
        }

    def _extract_color_label(self, img: Image.Image) -> int:
        """Extract dominant color from cropped clothing image."""
        small = img.resize((32, 32))
        pixels = np.array(small).reshape(-1, 3)
        dominant = pixels.mean(axis=0).astype(int)
        r, g, b = int(dominant[0]), int(dominant[1]), int(dominant[2])

        # Simplified color matching
        color_refs = {
            0: (255, 255, 255),   # white
            1: (0, 0, 0),         # black
            2: (128, 128, 128),   # gray
            14: (27, 42, 74),     # navy
            15: (0, 0, 255),      # blue
            21: (0, 128, 0),      # green
            28: (255, 0, 0),      # red
            34: (255, 192, 203),  # pink
            39: (255, 255, 0),    # yellow
            43: (255, 165, 0),    # orange
            47: (128, 0, 128),    # purple
            4: (245, 245, 220),   # beige
            12: (139, 69, 19),    # brown
        }

        min_dist = float("inf")
        best_idx = 1  # default black

        for idx, (cr, cg, cb) in color_refs.items():
            dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
            if dist < min_dist:
                min_dist = dist
                best_idx = idx

        return best_idx

    def _item_to_occasion(self, category: str) -> list:
        """Heuristic: map clothing category to likely occasions."""
        occasion_map = {
            "t-shirt": [1, 0, 0, 0, 1, 0],       # casual, gym
            "shirt": [1, 1, 0, 1, 0, 0],           # casual, office, date night
            "dress shirt": [0, 1, 0, 1, 0, 0],     # office, date night
            "tank top": [1, 0, 0, 0, 1, 0],        # casual, gym
            "vest": [0, 1, 0, 0, 0, 0],            # office
            "shorts": [1, 0, 0, 0, 1, 0],          # casual, gym
            "trousers": [0, 1, 0, 1, 0, 0],        # office, date night
            "skirt": [1, 1, 1, 1, 0, 0],           # casual, office, party, date night
            "jacket": [1, 1, 0, 1, 0, 0],          # casual, office, date night
            "dress": [0, 1, 1, 1, 0, 0],           # office, party, date night
        }
        return occasion_map.get(category, [1, 0, 0, 0, 0, 0])

    def _item_to_weather(self, category: str) -> list:
        """Heuristic: map clothing category to suitable weather."""
        weather_map = {
            "t-shirt": [1, 1, 0],      # hot, mild
            "shirt": [1, 1, 1],         # all
            "tank top": [1, 0, 0],      # hot only
            "vest": [0, 1, 1],          # mild, cold
            "shorts": [1, 0, 0],        # hot only
            "trousers": [0, 1, 1],      # mild, cold
            "skirt": [1, 1, 0],         # hot, mild
            "jacket": [0, 1, 1],        # mild, cold
            "dress": [1, 1, 0],         # hot, mild
            "sweater": [0, 0, 1],       # cold
            "hoodie": [0, 1, 1],        # mild, cold
        }
        return weather_map.get(category, [0, 1, 0])

    @staticmethod
    def _default_transform():
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(10),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])


class MultiHeadClothingClassifier(nn.Module):
    """
    Multi-head classifier built on a ResNet-50 backbone.

    Takes a 224×224 cropped clothing image and outputs predictions
    for six attribute heads simultaneously:
        - item:     softmax over ITEM_LABELS (single-label)
        - color:    softmax over COLOR_LABELS (single-label)
        - pattern:  softmax over PATTERN_LABELS (single-label)
        - fit:      softmax over FIT_LABELS (single-label)
        - occasion: sigmoid over OCCASION_LABELS (multi-label)
        - weather:  sigmoid over WEATHER_LABELS (multi-label)
    """

    def __init__(self, pretrained: bool = True):
        super().__init__()

        # Backbone: ResNet-50 (pre-trained on ImageNet)
        backbone = models.resnet50(
            weights=models.ResNet50_Weights.IMAGENET1K_V2 if pretrained else None
        )

        # Remove the original fully-connected layer
        self.features = nn.Sequential(*list(backbone.children())[:-1])  # Output: (B, 2048, 1, 1)
        feature_dim = 2048

        # Shared projection layer
        self.shared_fc = nn.Sequential(
            nn.Flatten(),
            nn.Linear(feature_dim, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(1024, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
        )

        # Classification heads
        self.head_item = nn.Linear(512, len(ITEM_LABELS))
        self.head_color = nn.Linear(512, len(COLOR_LABELS))
        self.head_pattern = nn.Linear(512, len(PATTERN_LABELS))
        self.head_fit = nn.Linear(512, len(FIT_LABELS))
        self.head_occasion = nn.Linear(512, len(OCCASION_LABELS))  # multi-label
        self.head_weather = nn.Linear(512, len(WEATHER_LABELS))    # multi-label

    def forward(self, x):
        features = self.features(x)
        shared = self.shared_fc(features)

        return {
            "item": self.head_item(shared),
            "color": self.head_color(shared),
            "pattern": self.head_pattern(shared),
            "fit": self.head_fit(shared),
            "occasion": self.head_occasion(shared),
            "weather": self.head_weather(shared),
        }


def train_classifier(epochs: int = 30, batch_size: int = 32, lr: float = 1e-4,
                      max_samples: int = None):
    """
    Train the multi-head clothing attribute classifier.

    Args:
        epochs: Number of training epochs
        batch_size: Training batch size
        lr: Learning rate
        max_samples: Limit dataset size (for debugging)
    """
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

    # ── Data ──────────────────────────────────────────────────────────────

    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomCrop(224),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    logger.info("Loading training dataset...")
    train_dataset = DeepFashion2ClassifierDataset(
        split="train", transform=train_transform, max_samples=max_samples
    )

    logger.info("Loading validation dataset...")
    val_dataset = DeepFashion2ClassifierDataset(
        split="validation", transform=val_transform,
        max_samples=max_samples // 5 if max_samples else None
    )

    if len(train_dataset) == 0:
        logger.error("No training samples found. Aborting.")
        return

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True,
        drop_last=True,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=4,
        pin_memory=True,
    )

    logger.info(f"Train: {len(train_dataset)} samples, Val: {len(val_dataset)} samples")
    logger.info(f"Batches per epoch: {len(train_loader)}")

    # ── Model ─────────────────────────────────────────────────────────────

    model = MultiHeadClothingClassifier(pretrained=True).to(DEVICE)
    logger.info(f"Model initialized on {DEVICE}")
    logger.info(f"Total parameters: {sum(p.numel() for p in model.parameters()):,}")
    logger.info(f"Trainable parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}")

    # ── Loss Functions ────────────────────────────────────────────────────

    # Single-label heads: CrossEntropyLoss
    criterion_item = nn.CrossEntropyLoss(label_smoothing=0.1)
    criterion_color = nn.CrossEntropyLoss(label_smoothing=0.1)
    criterion_pattern = nn.CrossEntropyLoss(label_smoothing=0.1)
    criterion_fit = nn.CrossEntropyLoss(label_smoothing=0.1)

    # Multi-label heads: BCEWithLogitsLoss
    criterion_occasion = nn.BCEWithLogitsLoss()
    criterion_weather = nn.BCEWithLogitsLoss()

    # Loss weights (item accuracy is most important)
    loss_weights = {
        "item": 2.0,
        "color": 1.5,
        "pattern": 1.0,
        "fit": 0.5,
        "occasion": 0.8,
        "weather": 0.8,
    }

    # ── Optimizer & Scheduler ─────────────────────────────────────────────

    # Differential learning rates: backbone (frozen initially) + heads
    backbone_params = list(model.features.parameters())
    head_params = (
        list(model.shared_fc.parameters())
        + list(model.head_item.parameters())
        + list(model.head_color.parameters())
        + list(model.head_pattern.parameters())
        + list(model.head_fit.parameters())
        + list(model.head_occasion.parameters())
        + list(model.head_weather.parameters())
    )

    # Freeze backbone for first 5 epochs (transfer learning warmup)
    for param in backbone_params:
        param.requires_grad = False

    optimizer = optim.AdamW([
        {"params": head_params, "lr": lr},
    ], weight_decay=1e-4)

    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)

    # ── Training Loop ─────────────────────────────────────────────────────

    best_val_loss = float("inf")
    patience_counter = 0
    patience_limit = 10  # early stopping

    for epoch in range(epochs):
        # Unfreeze backbone after warmup
        if epoch == 5:
            logger.info("Epoch 5: Unfreezing backbone and adding backbone LR group")
            for param in backbone_params:
                param.requires_grad = True
            optimizer.add_param_group({"params": backbone_params, "lr": lr * 0.1})

        # ── Train ─────────────────────────────────────────────────────────
        model.train()
        train_loss = 0.0
        train_item_correct = 0
        train_color_correct = 0
        train_total = 0

        for batch_idx, batch in enumerate(train_loader):
            images = batch["image"].to(DEVICE)
            item_labels = batch["item_label"].to(DEVICE)
            color_labels = batch["color_label"].to(DEVICE)
            pattern_labels = batch["pattern_label"].to(DEVICE)
            fit_labels = batch["fit_label"].to(DEVICE)
            occasion_labels = batch["occasion_label"].to(DEVICE)
            weather_labels = batch["weather_label"].to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)

            # Compute weighted losses
            loss_item = criterion_item(outputs["item"], item_labels) * loss_weights["item"]
            loss_color = criterion_color(outputs["color"], color_labels) * loss_weights["color"]
            loss_pattern = criterion_pattern(outputs["pattern"], pattern_labels) * loss_weights["pattern"]
            loss_fit = criterion_fit(outputs["fit"], fit_labels) * loss_weights["fit"]
            loss_occasion = criterion_occasion(outputs["occasion"], occasion_labels) * loss_weights["occasion"]
            loss_weather = criterion_weather(outputs["weather"], weather_labels) * loss_weights["weather"]

            total_loss = loss_item + loss_color + loss_pattern + loss_fit + loss_occasion + loss_weather
            total_loss.backward()

            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            train_loss += total_loss.item()
            train_item_correct += (outputs["item"].argmax(1) == item_labels).sum().item()
            train_color_correct += (outputs["color"].argmax(1) == color_labels).sum().item()
            train_total += images.size(0)

            if (batch_idx + 1) % 50 == 0:
                logger.info(
                    f"  Epoch {epoch+1}/{epochs} | Batch {batch_idx+1}/{len(train_loader)} | "
                    f"Loss: {total_loss.item():.4f} | "
                    f"Item Acc: {train_item_correct/train_total:.3f} | "
                    f"Color Acc: {train_color_correct/train_total:.3f}"
                )

        scheduler.step()

        avg_train_loss = train_loss / len(train_loader)
        train_item_acc = train_item_correct / max(1, train_total)
        train_color_acc = train_color_correct / max(1, train_total)

        # ── Validate ──────────────────────────────────────────────────────
        model.eval()
        val_loss = 0.0
        val_item_correct = 0
        val_color_correct = 0
        val_total = 0

        with torch.no_grad():
            for batch in val_loader:
                images = batch["image"].to(DEVICE)
                item_labels = batch["item_label"].to(DEVICE)
                color_labels = batch["color_label"].to(DEVICE)
                pattern_labels = batch["pattern_label"].to(DEVICE)
                fit_labels = batch["fit_label"].to(DEVICE)
                occasion_labels = batch["occasion_label"].to(DEVICE)
                weather_labels = batch["weather_label"].to(DEVICE)

                outputs = model(images)

                loss_item = criterion_item(outputs["item"], item_labels) * loss_weights["item"]
                loss_color = criterion_color(outputs["color"], color_labels) * loss_weights["color"]
                loss_pattern = criterion_pattern(outputs["pattern"], pattern_labels) * loss_weights["pattern"]
                loss_fit = criterion_fit(outputs["fit"], fit_labels) * loss_weights["fit"]
                loss_occasion = criterion_occasion(outputs["occasion"], occasion_labels) * loss_weights["occasion"]
                loss_weather = criterion_weather(outputs["weather"], weather_labels) * loss_weights["weather"]

                total_loss = loss_item + loss_color + loss_pattern + loss_fit + loss_occasion + loss_weather
                val_loss += total_loss.item()
                val_item_correct += (outputs["item"].argmax(1) == item_labels).sum().item()
                val_color_correct += (outputs["color"].argmax(1) == color_labels).sum().item()
                val_total += images.size(0)

        avg_val_loss = val_loss / max(1, len(val_loader))
        val_item_acc = val_item_correct / max(1, val_total)
        val_color_acc = val_color_correct / max(1, val_total)

        logger.info(
            f"Epoch {epoch+1}/{epochs} | "
            f"Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f} | "
            f"Train Item Acc: {train_item_acc:.3f} | Val Item Acc: {val_item_acc:.3f} | "
            f"Train Color Acc: {train_color_acc:.3f} | Val Color Acc: {val_color_acc:.3f} | "
            f"LR: {optimizer.param_groups[0]['lr']:.2e}"
        )

        # ── Checkpoint ────────────────────────────────────────────────────
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            patience_counter = 0
            save_path = WEIGHTS_DIR / "clothing_classifier.pt"
            torch.save(model, save_path)
            logger.info(f"  ✓ New best model saved → {save_path} (val_loss={avg_val_loss:.4f})")
        else:
            patience_counter += 1
            if patience_counter >= patience_limit:
                logger.info(f"Early stopping at epoch {epoch+1} (no improvement for {patience_limit} epochs)")
                break

    logger.info("Classifier training complete.")
    logger.info(f"Best validation loss: {best_val_loss:.4f}")
    logger.info(f"Weights saved to: {WEIGHTS_DIR / 'clothing_classifier.pt'}")


# ══════════════════════════════════════════════════════════════════════════════
# CLI ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Style DNA — Train clothing detection & classification models",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Train both stages
  python scripts/vision_training.py --stage all --epochs 50

  # Train only YOLO detector
  python scripts/vision_training.py --stage yolo --epochs 100

  # Train only classifier (assumes YOLO already trained)
  python scripts/vision_training.py --stage classifier --epochs 30

  # Quick debug run with limited data
  python scripts/vision_training.py --stage classifier --epochs 2 --max-samples 500
        """,
    )

    parser.add_argument(
        "--stage", choices=["yolo", "classifier", "all", "convert"],
        default="all", help="Training stage to run (default: all)"
    )
    parser.add_argument("--epochs", type=int, default=50, help="Training epochs (default: 50)")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size (default: 16)")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate for classifier (default: 1e-4)")
    parser.add_argument("--img-size", type=int, default=640, help="YOLO input size (default: 640)")
    parser.add_argument("--max-samples", type=int, default=None, help="Limit dataset size for debugging")

    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("Style DNA — Vision Model Training Pipeline")
    logger.info("=" * 60)
    logger.info(f"Stage: {args.stage}")
    logger.info(f"Device: {DEVICE}")
    logger.info(f"Data directory: {DATA_DIR}")
    logger.info(f"Weights directory: {WEIGHTS_DIR}")
    logger.info("")

    if args.stage in ("convert", "all"):
        logger.info("── Converting DeepFashion2 → YOLO format ──")
        convert_deepfashion2_to_yolo("train")
        convert_deepfashion2_to_yolo("validation")
        if args.stage == "convert":
            return

    if args.stage in ("yolo", "all"):
        logger.info("── Stage 1: YOLO Detection Training ──")
        train_yolo(
            epochs=args.epochs,
            batch_size=args.batch_size,
            img_size=args.img_size,
        )

    if args.stage in ("classifier", "all"):
        logger.info("── Stage 2: Multi-Head Classifier Training ──")
        train_classifier(
            epochs=args.epochs,
            batch_size=args.batch_size,
            lr=args.lr,
            max_samples=args.max_samples,
        )

    logger.info("=" * 60)
    logger.info("Training complete! Weights saved to ml_service/weights/")
    logger.info("Start the inference server: uvicorn main:app --port 8000")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
