"""Global taxonomy scraper for strict wardrobe ingestion.

This module synchronizes the scraper taxonomy with the engine taxonomy by:
1) scraping CLOTHING_ITEMS keys from fashionEngineV3.js,
2) merging them with scraper DATA_MAP keys,
3) generating a GlobalTaxonomy Enum,
4) enforcing Gemini response_schema against that exact list.
"""

from __future__ import annotations

from dataclasses import dataclass
from difflib import get_close_matches
from enum import Enum
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple


ROOT_DIR = Path(__file__).resolve().parents[1]
ENGINE_PATH = ROOT_DIR / "fashionEngineV3.js"


# Legacy scraper aliases expected from upstream detectors.
# Keys are canonical scraper tokens and must stay stable.
DATA_MAP: Dict[str, str] = {
    "tshirt": "t-shirt",
    "polo": "polo shirt",
    "shirt": "shirt",
    "blazer": "blazer",
    "trousers": "trousers",
    "shorts": "shorts",
    "mojari": "mojari",
    "kurta": "kurta",
    "sneakers": "sneakers",
    "joggers": "joggers",
    "chinos": "chinos",
    "hoodie": "hoodie",
    "jeans": "jeans",
    "overcoat": "overcoat",
    "puffer_jacket": "puffer jacket",
    "windbreaker": "windbreaker",
    "oxford_shoes": "oxford shoes",
    "derby_shoes": "derby shoes",
}


def _extract_object_block(js_text: str, const_name: str) -> str:
    marker = f"const {const_name} = {{"
    start = js_text.find(marker)
    if start == -1:
        raise ValueError(f"Could not find '{const_name}' in engine file")

    i = start + len(marker) - 1
    depth = 0
    end = -1
    while i < len(js_text):
        ch = js_text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
        i += 1

    if end == -1:
        raise ValueError(f"Could not parse object block for '{const_name}'")

    return js_text[start:end + 1]


def scrape_engine_keys(engine_path: Path = ENGINE_PATH) -> List[str]:
    js_text = engine_path.read_text(encoding="utf-8")
    block = _extract_object_block(js_text, "CLOTHING_ITEMS")
    return sorted(set(re.findall(r'"([^"]+)"\s*:\s*\{', block)))


def _enum_member_name(value: str) -> str:
    name = re.sub(r"[^A-Za-z0-9]+", "_", value).strip("_").upper()
    if not name:
        name = "UNKNOWN"
    if name[0].isdigit():
        name = f"ITEM_{name}"
    return name


def build_global_taxonomy(engine_path: Path = ENGINE_PATH) -> Tuple[Enum, List[str]]:
    engine_keys = scrape_engine_keys(engine_path)
    merged = sorted(set(engine_keys) | set(DATA_MAP.keys()))

    members = {}
    for key in merged:
        candidate = _enum_member_name(key)
        unique = candidate
        suffix = 2
        while unique in members:
            unique = f"{candidate}_{suffix}"
            suffix += 1
        members[unique] = key

    taxonomy_enum = Enum("GlobalTaxonomy", members)
    return taxonomy_enum, merged


# Concrete universal enum used by scraper logic.
GlobalTaxonomy, GLOBAL_TAXONOMY_VALUES = build_global_taxonomy(ENGINE_PATH)


def closest_parent_category(raw_label: str, allowed_values: List[str]) -> str:
    token = (raw_label or "").strip().lower()
    if token in allowed_values:
        return token

    matches = get_close_matches(token, allowed_values, n=1, cutoff=0.45)
    if matches:
        return matches[0]

    compact = re.sub(r"[^a-z0-9]+", "", token)
    for value in allowed_values:
        if compact and compact in re.sub(r"[^a-z0-9]+", "", value):
            return value

    return "tshirt" if "tshirt" in allowed_values else allowed_values[0]


def build_gemini_response_schema(allowed_values: List[str]) -> Dict:
    return {
        "type": "object",
        "properties": {
            "name": {"type": "string", "enum": allowed_values},
            "color": {"type": "string"},
            "pattern": {"type": "string"},
            "fit": {"type": "string"},
            "occasion": {"type": "array", "items": {"type": "string"}},
            "weather": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["name", "color", "pattern", "occasion", "weather"],
        "additionalProperties": False,
    }


@dataclass
class ScrapeResult:
    name: str
    color: str
    pattern: str
    fit: str
    occasion: List[str]
    weather: List[str]


def analyze_with_gemini(client, model: str, image_bytes: bytes, mime_type: str = "image/jpeg") -> ScrapeResult:
    allowed_values = [member.value for member in GlobalTaxonomy]
    schema = build_gemini_response_schema(allowed_values)

    prompt = (
        "Analyze this clothing item and return JSON only. "
        "The field 'name' MUST be selected from the schema enum. "
        "If the exact item is unknown, choose the closest parent category from the enum list."
    )

    # Requires google-genai style client with response_schema support.
    response = client.models.generate_content(
        model=model,
        contents=[
            {
                "role": "user",
                "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": image_bytes}},
                    {"text": prompt},
                ],
            }
        ],
        config={
            "temperature": 0.1,
            "response_mime_type": "application/json",
            "response_schema": schema,
        },
    )

    payload = json.loads(response.text)
    payload["name"] = closest_parent_category(payload.get("name", ""), allowed_values)
    return ScrapeResult(**payload)


if __name__ == "__main__":
    print(f"GlobalTaxonomy members: {len(GlobalTaxonomy)}")
    values = [member.value for member in GlobalTaxonomy]
    print("First 20:", values[:20])
