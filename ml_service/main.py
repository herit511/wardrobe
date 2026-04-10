"""
Style DNA — ML Clothing Detection Service
==========================================
FastAPI server that accepts a clothing image and returns structured
metadata (name, color, pattern, fit, occasion, weather).

This replaces the external Google Gemini API call in the Node.js backend.
The /analyze endpoint returns the exact JSON contract expected by the
frontend (AddItem.jsx) and backend (POST /api/items/analyze proxy).

Usage:
    cd ml_service
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ml_service")

# ── Constants ─────────────────────────────────────────────────────────────────

# Canonical label vocabularies — must match the Node.js backend/frontend enums
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
    "heels", "block heels", "mules", "flip flops",
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


# ── Model Manager (lazy singleton) ───────────────────────────────────────────

class ClothingDetector:
    """
    Wraps the custom-trained YOLOv11 model + classification heads.

    On startup, tries to load a trained model from `weights/`.
    If no trained model exists yet, falls back to rule-based heuristics
    so the API contract is always satisfied during development.
    """

    def __init__(self):
        self.yolo_model = None
        self.classifier = None
        self._loaded = False

    def load(self):
        """Attempt to load trained model weights."""
        weights_dir = Path(__file__).parent / "weights"
        yolo_weights = weights_dir / "clothing_detector.pt"
        classifier_weights = weights_dir / "clothing_classifier.pt"

        if yolo_weights.exists():
            try:
                from ultralytics import YOLO
                self.yolo_model = YOLO(str(yolo_weights))
                logger.info(f"Loaded YOLO detection model from {yolo_weights}")
            except Exception as e:
                logger.warning(f"Failed to load YOLO model: {e}")

        if classifier_weights.exists():
            try:
                import torch
                self.classifier = torch.load(str(classifier_weights), map_location="cpu")
                self.classifier.eval()
                logger.info(f"Loaded classifier model from {classifier_weights}")
            except Exception as e:
                logger.warning(f"Failed to load classifier model: {e}")

        self._loaded = True
        if not self.yolo_model and not self.classifier:
            logger.warning(
                "No trained weights found in weights/. "
                "Using heuristic fallback mode. "
                "Train models with: python scripts/vision_training.py"
            )

    def predict(self, image: Image.Image) -> dict:
        """
        Run inference on a PIL Image.

        Returns the canonical JSON structure:
        {
            "name": str,
            "color": str,
            "pattern": str,
            "fit": str,
            "occasion": [str],
            "weather": [str]
        }
        """
        if self.yolo_model and self.classifier:
            return self._predict_ml(image)
        elif self.yolo_model:
            return self._predict_yolo_only(image)
        else:
            return self._predict_heuristic(image)

    # ── ML Inference (full pipeline) ──────────────────────────────────────

    def _predict_ml(self, image: Image.Image) -> dict:
        """Full ML pipeline: YOLO detection → crop → classifier."""
        import torch
        from torchvision import transforms

        # Step 1: Detect clothing bounding box with YOLO
        results = self.yolo_model.predict(source=image, conf=0.25, verbose=False)
        if len(results) == 0 or len(results[0].boxes) == 0:
            return self._predict_heuristic(image)

        # Take highest-confidence detection
        boxes = results[0].boxes
        best_idx = boxes.conf.argmax().item()
        box = boxes.xyxy[best_idx].cpu().numpy().astype(int)
        cls_id = int(boxes.cls[best_idx].item())

        # Crop detected region
        x1, y1, x2, y2 = box
        cropped = image.crop((x1, y1, x2, y2))

        # Step 2: Classify attributes on cropped region
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        tensor = transform(cropped).unsqueeze(0)

        with torch.no_grad():
            outputs = self.classifier(tensor)

        # Parse multi-head classifier outputs
        item_name = ITEM_LABELS[outputs["item"].argmax(dim=1).item()]
        color = COLOR_LABELS[outputs["color"].argmax(dim=1).item()]
        pattern = PATTERN_LABELS[outputs["pattern"].argmax(dim=1).item()]
        fit = FIT_LABELS[outputs["fit"].argmax(dim=1).item()]

        # Multi-label heads (sigmoid threshold)
        occasion_probs = torch.sigmoid(outputs["occasion"]).squeeze()
        occasion = [OCCASION_LABELS[i] for i, p in enumerate(occasion_probs) if p > 0.4]
        if not occasion:
            occasion = ["casual"]

        weather_probs = torch.sigmoid(outputs["weather"]).squeeze()
        weather = [WEATHER_LABELS[i] for i, p in enumerate(weather_probs) if p > 0.4]
        if not weather:
            weather = ["mild"]

        return {
            "name": item_name,
            "color": color,
            "pattern": pattern,
            "fit": fit,
            "occasion": occasion,
            "weather": weather,
        }

    # ── YOLO-only fallback (detection without classifier) ─────────────────

    def _predict_yolo_only(self, image: Image.Image) -> dict:
        """Use YOLO for detection + dominant color extraction."""
        results = self.yolo_model.predict(source=image, conf=0.25, verbose=False)

        item_name = "t-shirt"  # default
        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            best_idx = boxes.conf.argmax().item()
            cls_id = int(boxes.cls[best_idx].item())
            class_names = results[0].names
            yolo_name = class_names.get(cls_id, "t-shirt")
            # Map YOLO class name to our vocabulary
            item_name = self._map_yolo_class(yolo_name)

            # Crop for color extraction
            box = boxes.xyxy[best_idx].cpu().numpy().astype(int)
            cropped = image.crop((box[0], box[1], box[2], box[3]))
        else:
            cropped = image

        color = self._extract_dominant_color(cropped)

        return {
            "name": item_name,
            "color": color,
            "pattern": "solid",
            "fit": "regular",
            "occasion": ["casual"],
            "weather": ["mild"],
        }

    # ── Heuristic fallback (no models loaded) ─────────────────────────────

    def _predict_heuristic(self, image: Image.Image) -> dict:
        """
        Pure heuristic: extract dominant color from the image center.
        Returns a safe default for all other fields.
        Used during development before models are trained.
        """
        color = self._extract_dominant_color(image)

        return {
            "name": "t-shirt",
            "color": color,
            "pattern": "solid",
            "fit": "regular",
            "occasion": ["casual"],
            "weather": ["mild"],
        }

    # ── Helpers ───────────────────────────────────────────────────────────

    def _extract_dominant_color(self, image: Image.Image) -> str:
        """
        Extract the dominant color from the center region of an image
        and map it to the nearest canonical color label.
        """
        img = image.convert("RGB")
        w, h = img.size

        # Sample from center 50% of image to avoid background
        left = w // 4
        top = h // 4
        right = 3 * w // 4
        bottom = 3 * h // 4
        center_crop = img.crop((left, top, right, bottom))

        # Resize for speed
        center_crop = center_crop.resize((64, 64))
        pixels = np.array(center_crop).reshape(-1, 3)

        # K-means with 3 clusters to find dominant color
        try:
            from sklearn.cluster import KMeans
            kmeans = KMeans(n_clusters=min(3, len(pixels)), n_init=5, random_state=42)
            kmeans.fit(pixels)
            # Pick cluster with most members
            counts = np.bincount(kmeans.labels_)
            dominant_rgb = kmeans.cluster_centers_[counts.argmax()].astype(int)
        except Exception:
            # Fallback: simple mean
            dominant_rgb = pixels.mean(axis=0).astype(int)

        return self._rgb_to_color_name(tuple(dominant_rgb))

    def _rgb_to_color_name(self, rgb: tuple) -> str:
        """Map an RGB tuple to the nearest canonical color label."""
        # Reference colors for matching (canonical label → representative RGB)
        color_refs = {
            "white": (255, 255, 255), "black": (0, 0, 0),
            "gray": (128, 128, 128), "light gray": (211, 211, 211),
            "charcoal": (54, 69, 79), "beige": (245, 245, 220),
            "cream": (255, 253, 208), "ivory": (255, 255, 240),
            "brown": (139, 69, 19), "dark brown": (101, 67, 33),
            "tan": (210, 180, 140), "camel": (193, 154, 107),
            "taupe": (72, 60, 50), "navy": (27, 42, 74),
            "blue": (0, 0, 255), "light blue": (173, 216, 230),
            "royal blue": (65, 105, 225), "sky blue": (135, 206, 235),
            "cobalt": (0, 71, 171), "denim": (21, 96, 189),
            "green": (0, 128, 0), "olive": (128, 128, 0),
            "khaki": (240, 230, 140), "forest green": (34, 139, 34),
            "sage": (188, 184, 138), "mint": (152, 255, 152),
            "emerald": (80, 200, 120), "red": (255, 0, 0),
            "dark red": (139, 0, 0), "crimson": (220, 20, 60),
            "maroon": (128, 0, 0), "burgundy": (128, 0, 32),
            "wine": (114, 47, 55), "pink": (255, 192, 203),
            "hot pink": (255, 105, 180), "blush": (222, 93, 131),
            "mauve": (224, 176, 255), "rose": (255, 0, 127),
            "yellow": (255, 255, 0), "mustard": (255, 219, 88),
            "gold": (255, 215, 0), "orange": (255, 165, 0),
            "coral": (255, 127, 80), "peach": (255, 203, 164),
            "rust": (183, 65, 14), "terracotta": (226, 114, 91),
            "purple": (128, 0, 128), "lavender": (230, 230, 250),
            "violet": (143, 0, 255), "plum": (221, 160, 221),
            "lilac": (200, 162, 200), "off-white": (250, 249, 246),
        }

        r, g, b = rgb
        min_dist = float("inf")
        best_name = "black"

        for name, (cr, cg, cb) in color_refs.items():
            # Weighted Euclidean distance (perceptual)
            rmean = (r + cr) / 2
            dr = r - cr
            dg = g - cg
            db = b - cb
            dist = ((2 + rmean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmean) / 256) * db * db)
            if dist < min_dist:
                min_dist = dist
                best_name = name

        return best_name

    @staticmethod
    def _map_yolo_class(yolo_name: str) -> str:
        """Map a YOLO class name to our canonical item vocabulary."""
        yolo_name = yolo_name.lower().strip()

        # Direct match
        if yolo_name in ITEM_LABELS:
            return yolo_name

        # Common mappings from DeepFashion2 / COCO class names
        mapping = {
            "short_sleeve_top": "t-shirt",
            "long_sleeve_top": "shirt",
            "short_sleeve_outwear": "jacket",
            "long_sleeve_outwear": "jacket",
            "short_sleeve_dress": "dress",
            "long_sleeve_dress": "dress",
            "sling_dress": "dress",
            "sling": "tank top",
            "vest_top": "vest",
            "vest_outwear": "vest",
            "trousers_pants": "trousers",
            "skirt_pants": "skirt",
            "short_pants": "shorts",
            "long_pants": "trousers",
        }

        if yolo_name in mapping:
            return mapping[yolo_name]

        # Partial match
        for label in ITEM_LABELS:
            if label in yolo_name or yolo_name in label:
                return label

        return "t-shirt"  # safe default


# ── Global model instance ────────────────────────────────────────────────────
detector = ClothingDetector()


# ── App lifecycle ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    logger.info("Starting ML Service — loading models...")
    detector.load()
    logger.info("ML Service ready.")
    yield
    logger.info("ML Service shutting down.")


# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Style DNA — Clothing Detection ML Service",
    description="Analyzes clothing images and returns structured metadata for the wardrobe app.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "models_loaded": detector._loaded,
        "yolo_available": detector.yolo_model is not None,
        "classifier_available": detector.classifier is not None,
    }


@app.post("/analyze")
async def analyze_clothing(image: UploadFile = File(...)):
    """
    Analyze a clothing image and return structured metadata.

    Accepts: multipart/form-data with an `image` field.

    Returns the exact JSON structure expected by the Node.js backend
    and React frontend:
    {
        "name": "t-shirt",
        "color": "navy",
        "pattern": "solid",
        "fit": "regular",
        "occasion": ["casual"],
        "weather": ["mild"]
    }
    """
    # Validate file type
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    try:
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read image: {e}")

    # Run detection
    try:
        result = detector.predict(pil_image)
        logger.info(f"[Analyze] Result: {result}")
        return result
    except Exception as e:
        logger.error(f"[Analyze] Prediction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")


# ── Dev entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
