// ============================================================
//  fashionEngine.js — Full Fashion Logic Engine
//  Based on: color theory, fashion styling rules, capsule
//  wardrobe principles, and seasonal/occasion dressing.
//  Use this with your CLIP pipeline or standalone.
// ============================================================

// ─────────────────────────────────────────────
// SECTION 1: COLOR DATA
// ─────────────────────────────────────────────

/**
 * Each color has:
 *  - family: broad group
 *  - temp: warm | cool | neutral
 *  - neutral: true if it pairs with almost anything
 *  - season: which seasons it belongs to
 *  - formality: casual | smart-casual | formal
 */
const COLOR_PROFILES = {
  // Neutrals
  white:       { family: "neutral", temp: "neutral", neutral: true,  season: ["spring","summer","winter"], formality: ["casual","smart-casual","formal"] },
  black:       { family: "neutral", temp: "neutral", neutral: true,  season: ["fall","winter"],             formality: ["casual","smart-casual","formal"] },
  gray:        { family: "neutral", temp: "cool",    neutral: true,  season: ["fall","winter","spring"],    formality: ["casual","smart-casual","formal"] },
  "light gray":{ family: "neutral", temp: "cool",    neutral: true,  season: ["spring","summer"],           formality: ["casual","smart-casual"] },
  beige:       { family: "neutral", temp: "warm",    neutral: true,  season: ["spring","summer","fall"],    formality: ["casual","smart-casual","formal"] },
  cream:       { family: "neutral", temp: "warm",    neutral: true,  season: ["spring","summer"],           formality: ["casual","smart-casual","formal"] },
  ivory:       { family: "neutral", temp: "warm",    neutral: true,  season: ["spring","summer"],           formality: ["smart-casual","formal"] },
  "off-white": { family: "neutral", temp: "warm",    neutral: true,  season: ["spring","summer"],           formality: ["casual","smart-casual","formal"] },
  camel:       { family: "neutral", temp: "warm",    neutral: true,  season: ["fall"],                      formality: ["casual","smart-casual","formal"] },
  tan:         { family: "neutral", temp: "warm",    neutral: true,  season: ["spring","fall"],             formality: ["casual","smart-casual"] },
  taupe:       { family: "neutral", temp: "warm",    neutral: true,  season: ["fall","winter"],             formality: ["casual","smart-casual","formal"] },
  "charcoal":  { family: "neutral", temp: "cool",    neutral: true,  season: ["fall","winter"],             formality: ["casual","smart-casual","formal"] },
  brown:       { family: "neutral", temp: "warm",    neutral: true,  season: ["fall","winter"],             formality: ["casual","smart-casual"] },
  "dark brown":{ family: "neutral", temp: "warm",    neutral: true,  season: ["fall","winter"],             formality: ["casual","smart-casual","formal"] },
  navy:        { family: "blue",    temp: "cool",    neutral: true,  season: ["fall","winter","spring"],    formality: ["casual","smart-casual","formal"] },

  // Blues
  blue:        { family: "blue", temp: "cool", neutral: false, season: ["spring","summer","fall"], formality: ["casual","smart-casual"] },
  "light blue":{ family: "blue", temp: "cool", neutral: false, season: ["spring","summer"],        formality: ["casual","smart-casual"] },
  "royal blue":{ family: "blue", temp: "cool", neutral: false, season: ["fall","winter"],          formality: ["smart-casual","formal"] },
  "sky blue":  { family: "blue", temp: "cool", neutral: false, season: ["spring","summer"],        formality: ["casual"] },
  cobalt:      { family: "blue", temp: "cool", neutral: false, season: ["spring","summer"],        formality: ["casual","smart-casual"] },
  denim:       { family: "blue", temp: "cool", neutral: true,  season: ["spring","summer","fall"], formality: ["casual","smart-casual"] },

  // Greens
  green:       { family: "green", temp: "cool", neutral: false, season: ["spring","summer"], formality: ["casual","smart-casual"] },
  olive:       { family: "green", temp: "warm", neutral: true,  season: ["fall","winter"],   formality: ["casual","smart-casual"] },
  khaki:       { family: "green", temp: "warm", neutral: true,  season: ["spring","fall"],   formality: ["casual","smart-casual"] },
  "forest green":{ family:"green",temp:"cool",  neutral: false, season: ["fall","winter"],   formality: ["casual","smart-casual"] },
  sage:        { family: "green", temp: "cool", neutral: false, season: ["spring","summer"], formality: ["casual","smart-casual"] },
  mint:        { family: "green", temp: "cool", neutral: false, season: ["spring","summer"], formality: ["casual"] },
  emerald:     { family: "green", temp: "cool", neutral: false, season: ["fall","winter"],   formality: ["smart-casual","formal"] },

  // Reds
  red:         { family: "red", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["casual","smart-casual","formal"] },
  "dark red":  { family: "red", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["smart-casual","formal"] },
  crimson:     { family: "red", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["formal"] },
  maroon:      { family: "red", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["smart-casual","formal"] },
  burgundy:    { family: "red", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["smart-casual","formal"] },
  wine:        { family: "red", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["smart-casual","formal"] },

  // Pinks
  pink:        { family: "pink", temp: "warm", neutral: false, season: ["spring","summer"], formality: ["casual","smart-casual"] },
  "hot pink":  { family: "pink", temp: "warm", neutral: false, season: ["summer"],          formality: ["casual"] },
  blush:       { family: "pink", temp: "warm", neutral: false, season: ["spring","summer"], formality: ["casual","smart-casual","formal"] },
  mauve:       { family: "pink", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["casual","smart-casual"] },
  rose:        { family: "pink", temp: "warm", neutral: false, season: ["spring","summer"], formality: ["casual","smart-casual","formal"] },

  // Yellows & Oranges
  yellow:      { family: "yellow", temp: "warm", neutral: false, season: ["spring","summer"], formality: ["casual"] },
  mustard:     { family: "yellow", temp: "warm", neutral: false, season: ["fall"],            formality: ["casual","smart-casual"] },
  gold:        { family: "yellow", temp: "warm", neutral: false, season: ["fall","winter"],   formality: ["smart-casual","formal"] },
  orange:      { family: "orange", temp: "warm", neutral: false, season: ["fall","summer"],   formality: ["casual"] },
  coral:       { family: "orange", temp: "warm", neutral: false, season: ["spring","summer"], formality: ["casual","smart-casual"] },
  peach:       { family: "orange", temp: "warm", neutral: false, season: ["spring","summer"], formality: ["casual","smart-casual"] },
  rust:        { family: "orange", temp: "warm", neutral: false, season: ["fall"],            formality: ["casual","smart-casual"] },
  terracotta:  { family: "orange", temp: "warm", neutral: false, season: ["fall"],            formality: ["casual","smart-casual"] },

  // Purples
  purple:      { family: "purple", temp: "cool", neutral: false, season: ["fall","winter"], formality: ["casual","smart-casual"] },
  lavender:    { family: "purple", temp: "cool", neutral: false, season: ["spring","summer"],formality: ["casual","smart-casual"] },
  violet:      { family: "purple", temp: "cool", neutral: false, season: ["spring","winter"],formality: ["casual","smart-casual","formal"] },
  plum:        { family: "purple", temp: "cool", neutral: false, season: ["fall","winter"],  formality: ["smart-casual","formal"] },
  lilac:       { family: "purple", temp: "cool", neutral: false, season: ["spring"],         formality: ["casual","smart-casual"] },
};

// ─────────────────────────────────────────────
// SECTION 2: COLOR THEORY RULES
// ─────────────────────────────────────────────

/**
 * Classic color wheel relationships.
 * These define which color FAMILIES pair well together.
 */
const COLOR_HARMONY = {
  // Complementary (opposite on wheel) — high contrast, bold
  complementary: [
    ["blue",   "orange"],
    ["red",    "green"],
    ["yellow", "purple"],
    ["pink",   "green"],
    ["navy",   "orange"],
    ["navy",   "mustard"],
  ],

  // Analogous (neighbors on wheel) — harmonious, cohesive
  analogous: [
    ["blue",   "green"],
    ["blue",   "purple"],
    ["red",    "orange"],
    ["red",    "pink"],
    ["yellow", "orange"],
    ["yellow", "green"],
    ["purple", "pink"],
    ["orange", "yellow"],
    ["green",  "blue"],
  ],

  // Triadic (3 equidistant) — vibrant, balanced
  triadic: [
    ["red",    "yellow", "blue"],
    ["orange", "green",  "purple"],
    ["pink",   "teal",   "mustard"],
  ],

  // Monochromatic — same family, different shades (always works)
  monochromatic: [
    ["navy",   "blue",      "light blue"],
    ["black",  "charcoal",  "gray"],
    ["white",  "cream",     "ivory"],
    ["red",    "burgundy",  "maroon"],
    ["green",  "olive",     "forest green"],
    ["brown",  "camel",     "tan"],
  ],

  // Neutral + accent (most reliable everyday rule)
  neutralPlusAccent: true, // handled in logic below
};

/**
 * Universal color pairing rules from fashion stylists.
 * Explicit "always works" and "avoid" combos.
 */
const COLOR_RULES = {
  alwaysWorks: [
    ["navy",    "white"],
    ["navy",    "gray"],
    ["navy",    "beige"],
    ["navy",    "camel"],
    ["navy",    "burgundy"],
    ["navy",    "light blue"],
    ["black",   "white"],
    ["black",   "gray"],
    ["black",   "beige"],
    ["black",   "camel"],
    ["black",   "navy"],
    ["black",   "red"],
    ["black",   "pink"],
    ["gray",    "white"],
    ["gray",    "navy"],
    ["gray",    "blue"],
    ["gray",    "pink"],
    ["gray",    "burgundy"],
    ["white",   "beige"],
    ["white",   "tan"],
    ["white",   "camel"],
    ["white",   "blue"],
    ["white",   "olive"],
    ["beige",   "brown"],
    ["beige",   "camel"],
    ["beige",   "navy"],
    ["camel",   "white"],
    ["camel",   "black"],
    ["camel",   "burgundy"],
    ["olive",   "beige"],
    ["olive",   "white"],
    ["olive",   "camel"],
    ["olive",   "rust"],
    ["burgundy","camel"],
    ["burgundy","navy"],
    ["burgundy","gray"],
    ["mustard", "navy"],
    ["mustard", "gray"],
    ["mustard", "brown"],
    ["denim",   "white"],
    ["denim",   "gray"],
    ["denim",   "black"],
    ["denim",   "beige"],
    ["coral",   "navy"],
    ["coral",   "white"],
    ["coral",   "gray"],
    ["blush",   "gray"],
    ["blush",   "navy"],
    ["blush",   "camel"],
    ["rust",    "navy"],
    ["rust",    "cream"],
    ["rust",    "olive"],
    ["terracotta", "beige"],
    ["terracotta", "white"],
    ["terracotta", "navy"],
  ],

  // These combos are generally considered clashes
  avoid: [
    ["red",    "orange"],
    ["red",    "pink"],    // unless intentional maximalism
    ["brown",  "black"],   // unless monochromatic styling
    ["navy",   "black"],   // too similar, looks like a mistake
    ["green",  "red"],     // too Christmas unless done carefully
    ["purple", "orange"],
    ["yellow", "red"],     // fast-food effect
    ["pink",   "orange"],
    ["blue",   "brown"],   // usually clashes
  ],
};

// ─────────────────────────────────────────────
// SECTION 3: CLOTHING ITEM DATA
// ─────────────────────────────────────────────

/**
 * Formality levels: 1 = most casual, 5 = most formal
 * layer: can this be a layering piece?
 * bottom/top: is it a top or bottom?
 * category: for outfit building logic
 */
const CLOTHING_ITEMS = {
  // Tops
  "t-shirt":         { formality: 1, layer: false, role: "top",    category: "top",     fabric: ["cotton"],      patterns: ["solid","graphic","striped"] },
  "graphic tee":     { formality: 1, layer: false, role: "top",    category: "top",     fabric: ["cotton"],      patterns: ["graphic"] },
  "polo shirt":      { formality: 2, layer: false, role: "top",    category: "top",     fabric: ["cotton","pique"], patterns: ["solid","striped"] },
  "shirt":           { formality: 3, layer: false, role: "top",    category: "top",     fabric: ["cotton","linen","polyester"], patterns: ["solid","striped","checkered","floral"] },
  "dress shirt":     { formality: 4, layer: false, role: "top",    category: "top",     fabric: ["cotton","poplin"], patterns: ["solid","striped","checkered"] },
  "blouse":          { formality: 3, layer: false, role: "top",    category: "top",     fabric: ["silk","satin","chiffon"], patterns: ["solid","floral","printed"] },
  "tank top":        { formality: 1, layer: true,  role: "top",    category: "top",     fabric: ["cotton"],      patterns: ["solid"] },
  "crop top":        { formality: 1, layer: false, role: "top",    category: "top",     fabric: ["cotton","jersey"], patterns: ["solid","striped"] },
  "sweater":         { formality: 2, layer: false, role: "top",    category: "top",     fabric: ["wool","knit"],  patterns: ["solid","striped","cable"] },
  "turtleneck":      { formality: 3, layer: false, role: "top",    category: "top",     fabric: ["wool","cotton"], patterns: ["solid"] },
  "hoodie":          { formality: 1, layer: false, role: "top",    category: "top",     fabric: ["cotton","fleece"], patterns: ["solid","graphic"] },
  "sweatshirt":      { formality: 1, layer: false, role: "top",    category: "top",     fabric: ["cotton","fleece"], patterns: ["solid","graphic"] },

  // Bottoms
  "jeans":           { formality: 2, layer: false, role: "bottom", category: "bottom",  fabric: ["denim"],       patterns: ["solid"] },
  "slim jeans":      { formality: 2, layer: false, role: "bottom", category: "bottom",  fabric: ["denim"],       patterns: ["solid"] },
  "straight jeans":  { formality: 2, layer: false, role: "bottom", category: "bottom",  fabric: ["denim"],       patterns: ["solid"] },
  "wide leg jeans":  { formality: 2, layer: false, role: "bottom", category: "bottom",  fabric: ["denim"],       patterns: ["solid"] },
  "chinos":          { formality: 3, layer: false, role: "bottom", category: "bottom",  fabric: ["cotton","twill"], patterns: ["solid"] },
  "trousers":        { formality: 4, layer: false, role: "bottom", category: "bottom",  fabric: ["wool","polyester","cotton"], patterns: ["solid","pinstripe"] },
  "shorts":          { formality: 1, layer: false, role: "bottom", category: "bottom",  fabric: ["cotton","linen"], patterns: ["solid","plaid","printed"] },
  "cargo pants":     { formality: 1, layer: false, role: "bottom", category: "bottom",  fabric: ["cotton"],      patterns: ["solid","camo"] },
  "joggers":         { formality: 1, layer: false, role: "bottom", category: "bottom",  fabric: ["cotton","fleece"], patterns: ["solid"] },
  "sweatpants":      { formality: 1, layer: false, role: "bottom", category: "bottom",  fabric: ["cotton","fleece"], patterns: ["solid"] },
  "skirt":           { formality: 3, layer: false, role: "bottom", category: "bottom",  fabric: ["cotton","satin","wool"], patterns: ["solid","floral","plaid"] },
  "mini skirt":      { formality: 2, layer: false, role: "bottom", category: "bottom",  fabric: ["denim","cotton"], patterns: ["solid"] },
  "midi skirt":      { formality: 3, layer: false, role: "bottom", category: "bottom",  fabric: ["satin","cotton"], patterns: ["solid","floral"] },
  "maxi skirt":      { formality: 3, layer: false, role: "bottom", category: "bottom",  fabric: ["satin","chiffon"], patterns: ["solid","printed"] },
  "leggings":        { formality: 1, layer: false, role: "bottom", category: "bottom",  fabric: ["spandex","cotton"], patterns: ["solid"] },

  // Outerwear / Layers
  "jacket":          { formality: 2, layer: true,  role: "layer",  category: "outerwear", fabric: ["cotton","polyester"], patterns: ["solid"] },
  "blazer":          { formality: 4, layer: true,  role: "layer",  category: "outerwear", fabric: ["wool","polyester"], patterns: ["solid","pinstripe","checkered"] },
  "suit jacket":     { formality: 5, layer: true,  role: "layer",  category: "outerwear", fabric: ["wool"],             patterns: ["solid","pinstripe"] },
  "denim jacket":    { formality: 2, layer: true,  role: "layer",  category: "outerwear", fabric: ["denim"],            patterns: ["solid"] },
  "leather jacket":  { formality: 2, layer: true,  role: "layer",  category: "outerwear", fabric: ["leather","faux leather"], patterns: ["solid"] },
  "bomber jacket":   { formality: 2, layer: true,  role: "layer",  category: "outerwear", fabric: ["nylon","polyester"], patterns: ["solid"] },
  "trench coat":     { formality: 4, layer: true,  role: "layer",  category: "outerwear", fabric: ["cotton","polyester"], patterns: ["solid"] },
  "overcoat":        { formality: 4, layer: true,  role: "layer",  category: "outerwear", fabric: ["wool"],             patterns: ["solid","herringbone"] },
  "parka":           { formality: 1, layer: true,  role: "layer",  category: "outerwear", fabric: ["nylon","polyester"], patterns: ["solid"] },
  "cardigan":        { formality: 2, layer: true,  role: "layer",  category: "outerwear", fabric: ["wool","cotton"],    patterns: ["solid","striped"] },
  "vest":            { formality: 3, layer: true,  role: "layer",  category: "outerwear", fabric: ["wool","cotton"],    patterns: ["solid"] },

  // Shoes
  "sneakers":        { formality: 1, role: "shoes", category: "footwear", pairs: ["jeans","chinos","shorts","joggers","leggings"] },
  "white sneakers":  { formality: 2, role: "shoes", category: "footwear", pairs: ["jeans","chinos","shorts","trousers","skirt"] },
  "chunky sneakers": { formality: 1, role: "shoes", category: "footwear", pairs: ["jeans","shorts","leggings"] },
  "loafers":         { formality: 3, role: "shoes", category: "footwear", pairs: ["chinos","trousers","jeans","skirt"] },
  "oxford shoes":    { formality: 5, role: "shoes", category: "footwear", pairs: ["trousers","chinos"] },
  "derby shoes":     { formality: 4, role: "shoes", category: "footwear", pairs: ["trousers","chinos"] },
  "chelsea boots":   { formality: 3, role: "shoes", category: "footwear", pairs: ["jeans","chinos","trousers","skirt"] },
  "ankle boots":     { formality: 3, role: "shoes", category: "footwear", pairs: ["jeans","skirt","midi skirt","trousers"] },
  "boots":           { formality: 2, role: "shoes", category: "footwear", pairs: ["jeans","cargo pants","chinos"] },
  "sandals":         { formality: 1, role: "shoes", category: "footwear", pairs: ["shorts","skirt","maxi skirt","jeans"] },
  "slides":          { formality: 1, role: "shoes", category: "footwear", pairs: ["joggers","shorts","leggings"] },
  "heels":           { formality: 4, role: "shoes", category: "footwear", pairs: ["trousers","skirt","midi skirt","jeans"] },
  "block heels":     { formality: 3, role: "shoes", category: "footwear", pairs: ["jeans","skirt","trousers"] },
  "mules":           { formality: 3, role: "shoes", category: "footwear", pairs: ["jeans","trousers","skirt"] },
  "flip flops":      { formality: 1, role: "shoes", category: "footwear", pairs: ["shorts","jeans"] },

  // Accessories
  "belt":            { formality: 3, role: "accessory", category: "accessory", tip: "Match belt to shoes color" },
  "watch":           { formality: 3, role: "accessory", category: "accessory", tip: "Metal watch elevates smart-casual" },
  "cap":             { formality: 1, role: "accessory", category: "accessory", tip: "Pairs with streetwear and casual looks" },
  "beanie":          { formality: 1, role: "accessory", category: "accessory", tip: "Adds casual/streetwear edge" },
  "scarf":           { formality: 2, role: "accessory", category: "accessory", tip: "Can elevate or add texture to an outfit" },
  "sunglasses":      { formality: 1, role: "accessory", category: "accessory", tip: "Essential finishing touch" },
  "bag":             { formality: 3, role: "accessory", category: "accessory", tip: "Match bag formality to outfit formality" },
  "backpack":        { formality: 1, role: "accessory", category: "accessory", tip: "Casual/student contexts" },
  "tote bag":        { formality: 2, role: "accessory", category: "accessory", tip: "Versatile, smart-casual to casual" },
};

// ─────────────────────────────────────────────
// SECTION 4: PATTERN MIXING RULES
// ─────────────────────────────────────────────

/**
 * Fashion rule: never mix two bold patterns.
 * One pattern + one solid is the safe move.
 * Two patterns only if they differ in scale.
 *
 * Pattern formality: 1 = most casual, 5 = most formal
 */
const PATTERNS = {
  solid:       { formality: 3, bold: false, scale: "n/a" },
  striped:     { formality: 3, bold: false, scale: "medium" },
  "thin stripe":{ formality: 4, bold: false, scale: "small" },
  "wide stripe":{ formality: 2, bold: true,  scale: "large" },
  checkered:   { formality: 3, bold: false, scale: "medium" },
  plaid:       { formality: 2, bold: true,  scale: "large" },
  tartan:      { formality: 2, bold: true,  scale: "large" },
  floral:      { formality: 2, bold: true,  scale: "varies" },
  "small floral":{ formality:3, bold: false, scale: "small" },
  graphic:     { formality: 1, bold: true,  scale: "large" },
  camo:        { formality: 1, bold: true,  scale: "large" },
  animal:      { formality: 2, bold: true,  scale: "medium" },
  paisley:     { formality: 2, bold: true,  scale: "medium" },
  houndstooth: { formality: 4, bold: false, scale: "small" },
  herringbone: { formality: 4, bold: false, scale: "small" },
  pinstripe:   { formality: 5, bold: false, scale: "small" },
  polka:       { formality: 2, bold: false, scale: "small" },
  tie_dye:     { formality: 1, bold: true,  scale: "large" },
  geometric:   { formality: 2, bold: true,  scale: "medium" },
  abstract:    { formality: 2, bold: true,  scale: "large" },
};

/**
 * Check if two patterns can be mixed.
 * Returns { ok: bool, reason: string }
 */
function canMixPatterns(pattern1, pattern2) {
  if (pattern1 === "solid" || pattern2 === "solid") {
    return { ok: true, reason: "Solid + pattern is always safe." };
  }
  const p1 = PATTERNS[pattern1];
  const p2 = PATTERNS[pattern2];
  if (!p1 || !p2) return { ok: true, reason: "Unknown patterns — proceed with caution." };
  if (p1.bold && p2.bold) {
    return { ok: false, reason: `Two bold patterns (${pattern1} + ${pattern2}) clash. Use one solid item instead.` };
  }
  if (p1.scale !== p2.scale && p1.scale !== "n/a" && p2.scale !== "n/a") {
    return { ok: true, reason: `Different scales (${p1.scale} + ${p2.scale}) make this work.` };
  }
  if (p1.scale === p2.scale && !p1.bold && !p2.bold) {
    return { ok: false, reason: `Same scale patterns (${pattern1} + ${pattern2}) compete. Try different scales.` };
  }
  return { ok: true, reason: "Pattern combo is acceptable." };
}

// ─────────────────────────────────────────────
// SECTION 5: FORMALITY MATCHING
// ─────────────────────────────────────────────

/**
 * Items should be within 1 formality level of each other.
 * Mixing too-far-apart formality = outfit confusion.
 */
function checkFormalityMatch(item1Name, item2Name) {
  const i1 = CLOTHING_ITEMS[item1Name];
  const i2 = CLOTHING_ITEMS[item2Name];
  if (!i1 || !i2) return { ok: true, score: 5, note: "Item not in database." };
  const diff = Math.abs(i1.formality - i2.formality);
  if (diff === 0) return { ok: true,  score: 10, note: "Perfect formality match." };
  if (diff === 1) return { ok: true,  score: 8,  note: "Close formality levels — works well." };
  if (diff === 2) return { ok: true,  score: 5,  note: "Slight formality gap — intentional contrast can work (e.g. blazer + jeans)." };
  if (diff === 3) return { ok: false, score: 3,  note: `Big formality mismatch (${item1Name} vs ${item2Name}). Looks unintentional.` };
  return          { ok: false, score: 1,  note: `Extreme formality clash. Avoid.` };
}

/**
 * Known intentional formality contrasts that work.
 * These are classic "rules broken on purpose" combos.
 */
const INTENTIONAL_CONTRASTS = [
  { top: "blazer",      bottom: "jeans",    note: "Smart-casual classic. Elevates the jeans." },
  { top: "blazer",      bottom: "joggers",  note: "Contemporary fashion-forward look." },
  { top: "suit jacket", bottom: "jeans",    note: "Bold contrast — works in creative/fashion contexts." },
  { top: "dress shirt", bottom: "jeans",    note: "Tucked in = smart casual. Untucked = casual." },
  { top: "turtleneck",  bottom: "trousers", note: "Minimalist chic. Very clean." },
  { top: "hoodie",      bottom: "trousers", note: "Normcore/contemporary — very popular now." },
  { top: "t-shirt",     bottom: "trousers", note: "Works if trousers are tailored and tee is fitted." },
];

// ─────────────────────────────────────────────
// SECTION 6: FIT & SILHOUETTE RULES
// ─────────────────────────────────────────────

/**
 * Golden rule: balance volume.
 * Loose top = slim bottom. Slim top = can go either way.
 * Never loose top + loose bottom (shapeless).
 */
const FIT_RULES = {
  fits: {
    oversized: { pairedWith: ["slim", "skinny", "fitted"],   avoid: ["oversized","wide leg","baggy"] },
    loose:     { pairedWith: ["slim", "fitted", "straight"], avoid: ["loose","baggy","oversized"] },
    fitted:    { pairedWith: ["slim","straight","wide leg","baggy"], avoid: [] },
    slim:      { pairedWith: ["any"], avoid: [] },
    cropped:   { pairedWith: ["high waist", "wide leg", "maxi", "straight"], avoid: ["low rise"] },
    tucked:    { pairedWith: ["any"], note: "Tucking in creates waist definition — always adds polish." },
  },

  silhouettes: {
    "oversized top + slim bottom":  { score: 9, name: "Relaxed chic" },
    "fitted top + wide leg bottom": { score: 9, name: "Balanced volume" },
    "fitted top + slim bottom":     { score: 8, name: "Classic streamlined" },
    "cropped top + high waist":     { score: 9, name: "Elongates legs" },
    "tucked shirt + straight leg":  { score: 9, name: "Clean smart casual" },
    "oversized top + wide leg":     { score: 4, name: "Too much volume — avoid unless intentional" },
    "fitted top + fitted bottom":   { score: 8, name: "Sleek and tailored" },
  },

  fitTips: [
    "Tuck in your shirt to define the waist and add polish.",
    "Pair oversized tops with slim or straight-leg bottoms to balance volume.",
    "Cropped tops pair best with high-waisted bottoms to avoid exposing too much torso.",
    "Wide-leg trousers look best with a tucked top or cropped top to avoid appearing short.",
    "Slim jeans with a chunky knit on top is a classic balanced silhouette.",
  ],
};

// ─────────────────────────────────────────────
// SECTION 7: OCCASION RULES
// ─────────────────────────────────────────────

const OCCASIONS = {
  casual: {
    label: "Everyday / Casual",
    formalityRange: [1, 2],
    topExamples:    ["t-shirt", "polo shirt", "hoodie", "sweatshirt", "sweater"],
    bottomExamples: ["jeans", "shorts", "joggers", "chinos"],
    layerExamples:  ["denim jacket", "bomber jacket", "cardigan"],
    shoeExamples:   ["sneakers", "white sneakers", "sandals", "slides"],
    tip: "Prioritize comfort and personal style. Minimal rules apply.",
  },
  "smart-casual": {
    label: "Smart Casual",
    formalityRange: [2, 3],
    topExamples:    ["shirt", "polo shirt", "blouse", "turtleneck", "sweater"],
    bottomExamples: ["chinos", "jeans", "skirt", "trousers"],
    layerExamples:  ["blazer", "cardigan", "leather jacket", "trench coat"],
    shoeExamples:   ["white sneakers", "loafers", "chelsea boots", "ankle boots"],
    tip: "One elevated piece lifts the whole outfit. A blazer over a simple tee works.",
  },
  formal: {
    label: "Formal / Business",
    formalityRange: [4, 5],
    topExamples:    ["dress shirt", "blouse"],
    bottomExamples: ["trousers", "skirt"],
    layerExamples:  ["blazer", "suit jacket", "trench coat", "overcoat"],
    shoeExamples:   ["oxford shoes", "derby shoes", "heels", "loafers"],
    tip: "Stick to solid colors or subtle patterns. Fit is everything — tailoring matters.",
  },
  party: {
    label: "Party / Night Out",
    formalityRange: [2, 4],
    topExamples:    ["blouse", "shirt", "crop top"],
    bottomExamples: ["jeans", "trousers", "skirt", "midi skirt"],
    layerExamples:  ["blazer", "leather jacket"],
    shoeExamples:   ["heels", "chelsea boots", "loafers", "chunky sneakers"],
    tip: "Go bolder with color and texture. Metallics, satin, and deep colors work well.",
  },
  college: {
    label: "College / Campus",
    formalityRange: [1, 2],
    topExamples:    ["t-shirt", "graphic tee", "hoodie", "polo shirt", "sweatshirt"],
    bottomExamples: ["jeans", "chinos", "shorts", "cargo pants", "joggers"],
    layerExamples:  ["denim jacket", "bomber jacket", "cardigan"],
    shoeExamples:   ["sneakers", "white sneakers", "chunky sneakers"],
    tip: "Comfort + a bit of style. White sneakers + jeans + any top = safe default.",
  },
  beach: {
    label: "Beach / Outdoor",
    formalityRange: [1, 1],
    topExamples:    ["t-shirt", "tank top", "crop top"],
    bottomExamples: ["shorts", "skirt", "maxi skirt"],
    layerExamples:  [],
    shoeExamples:   ["sandals", "flip flops", "slides"],
    tip: "Light fabrics, bright or neutral colors. Linen is your best friend.",
  },
  interview: {
    label: "Job Interview",
    formalityRange: [3, 5],
    topExamples:    ["dress shirt", "shirt", "blouse", "turtleneck"],
    bottomExamples: ["trousers", "chinos", "skirt"],
    layerExamples:  ["blazer", "suit jacket"],
    shoeExamples:   ["oxford shoes", "derby shoes", "loafers", "heels"],
    tip: "Err on the side of overdressed. Clean, pressed, fitted. No logos or graphics.",
  },
  gym: {
    label: "Gym / Athletic",
    formalityRange: [1, 1],
    topExamples:    ["t-shirt", "tank top", "crop top"],
    bottomExamples: ["leggings", "shorts", "sweatpants", "joggers"],
    layerExamples:  ["hoodie", "jacket"],
    shoeExamples:   ["sneakers"],
    tip: "Function first. Moisture-wicking fabrics. Matching sets look intentional.",
  },
};

// ─────────────────────────────────────────────
// SECTION 8: SEASONAL RULES
// ─────────────────────────────────────────────

const SEASONS = {
  spring: {
    colors:   ["beige","cream","sage","lavender","blush","light blue","mint","peach","coral","white","yellow"],
    fabrics:  ["cotton","linen","light wool","jersey"],
    layers:   ["light jacket","cardigan","denim jacket","trench coat"],
    tip: "Light pastels and neutrals. Layer with a light jacket — mornings and evenings are cool.",
  },
  summer: {
    colors:   ["white","coral","yellow","sky blue","hot pink","mint","peach","light blue","beige","olive"],
    fabrics:  ["linen","cotton","jersey","chambray"],
    layers:   [],
    tip: "Breathable fabrics, light colors. Avoid black in direct sun. Linen > cotton for heat.",
  },
  fall: {
    colors:   ["rust","mustard","olive","camel","brown","burgundy","navy","dark red","forest green","orange","terracotta"],
    fabrics:  ["wool","flannel","corduroy","denim","leather"],
    layers:   ["leather jacket","bomber jacket","overcoat","denim jacket","cardigan","blazer"],
    tip: "Earth tones and rich shades. Layering is the key aesthetic move of fall.",
  },
  winter: {
    colors:   ["black","navy","charcoal","burgundy","dark red","plum","camel","gray","white","forest green"],
    fabrics:  ["wool","cashmere","fleece","leather","velvet"],
    layers:   ["overcoat","parka","trench coat","turtleneck","heavy cardigan"],
    tip: "Dark, rich tones with texture contrasts. A camel overcoat is the most versatile winter piece.",
  },
};

// ─────────────────────────────────────────────
// SECTION 9: THE CORE SCORING ENGINE
// ─────────────────────────────────────────────

/**
 * Score a color pairing.
 * Returns a score from 0–10 and a reason string.
 *
 * @param {string} color1 - e.g. "navy"
 * @param {string} color2 - e.g. "white"
 * @returns {{ score: number, level: string, reason: string }}
 */
function scoreColorPair(color1, color2) {
  const c1 = color1.toLowerCase().trim();
  const c2 = color2.toLowerCase().trim();
  if (c1 === c2) return { score: 7, level: "good", reason: "Monochromatic — same color, different shades. Works well if there's tonal variation." };

  // Check explicit always-works list
  const alwaysOk = COLOR_RULES.alwaysWorks.some(
    ([a, b]) => (a === c1 && b === c2) || (a === c2 && b === c1)
  );
  if (alwaysOk) return { score: 10, level: "excellent", reason: `${c1} + ${c2} is a timeless, reliable pairing.` };

  // Check avoid list
  const shouldAvoid = COLOR_RULES.avoid.some(
    ([a, b]) => (a === c1 && b === c2) || (a === c2 && b === c1)
  );
  if (shouldAvoid) return { score: 2, level: "avoid", reason: `${c1} + ${c2} tends to clash. Consider replacing one with a neutral.` };

  const p1 = COLOR_PROFILES[c1];
  const p2 = COLOR_PROFILES[c2];

  // If either is a neutral, it generally works
  if (p1?.neutral || p2?.neutral) {
    return { score: 8, level: "great", reason: `${p1?.neutral ? c1 : c2} is a neutral — pairs with most things.` };
  }

  if (!p1 || !p2) return { score: 5, level: "unknown", reason: "Color not in database — check manually." };

  // Check color harmony
  const isComplementary = COLOR_HARMONY.complementary.some(
    ([a, b]) => (a === p1.family && b === p2.family) || (a === p2.family && b === p1.family)
  );
  if (isComplementary) return { score: 8, level: "great", reason: `Complementary colors (${p1.family} + ${p2.family}) — bold, high-contrast pairing.` };

  const isAnalogous = COLOR_HARMONY.analogous.some(
    ([a, b]) => (a === p1.family && b === p2.family) || (a === p2.family && b === p1.family)
  );
  if (isAnalogous) return { score: 8, level: "great", reason: `Analogous colors (${p1.family} + ${p2.family}) — harmonious, cohesive pairing.` };

  // Same temperature usually works
  if (p1.temp === p2.temp) return { score: 6, level: "okay", reason: `Both colors are ${p1.temp} tone — generally cohesive.` };

  return { score: 4, level: "risky", reason: `Mixed warm/cool tones without clear harmony. Use a neutral to bridge.` };
}

/**
 * Score a full outfit (array of items with color and type).
 *
 * @param {Array<{name: string, color: string, pattern?: string}>} items
 * @param {string} occasion - key from OCCASIONS
 * @param {string} season   - key from SEASONS
 * @returns {{ totalScore: number, breakdown: object[], tips: string[], outfitName: string }}
 */
function scoreOutfit(items, occasion = "casual", season = "spring") {
  const breakdown = [];
  const tips = [];
  let totalScore = 0;
  let checks = 0;

  // 1. Score all color pairs
  const colorItems = items.filter(i => i.color);
  for (let i = 0; i < colorItems.length; i++) {
    for (let j = i + 1; j < colorItems.length; j++) {
      const result = scoreColorPair(colorItems[i].color, colorItems[j].color);
      breakdown.push({
        check: "Color pairing",
        items: `${colorItems[i].color} (${colorItems[i].name}) + ${colorItems[j].color} (${colorItems[j].name})`,
        ...result,
      });
      totalScore += result.score;
      checks++;
    }
  }

  // 2. Score formality pairings
  const wearableItems = items.filter(i => CLOTHING_ITEMS[i.name]);
  for (let i = 0; i < wearableItems.length; i++) {
    for (let j = i + 1; j < wearableItems.length; j++) {
      const result = checkFormalityMatch(wearableItems[i].name, wearableItems[j].name);
      if (result.score < 8) {
        const isIntentional = INTENTIONAL_CONTRASTS.some(
          c => (c.top === wearableItems[i].name && c.bottom === wearableItems[j].name) ||
               (c.top === wearableItems[j].name && c.bottom === wearableItems[i].name)
        );
        if (isIntentional) {
          const contrast = INTENTIONAL_CONTRASTS.find(
            c => (c.top === wearableItems[i].name && c.bottom === wearableItems[j].name) ||
                 (c.top === wearableItems[j].name && c.bottom === wearableItems[i].name)
          );
          breakdown.push({ check: "Formality", items: `${wearableItems[i].name} + ${wearableItems[j].name}`, score: 9, level: "great", reason: `Intentional contrast: ${contrast.note}` });
          totalScore += 9; checks++;
          continue;
        }
      }
      breakdown.push({ check: "Formality", items: `${wearableItems[i].name} + ${wearableItems[j].name}`, ...result });
      totalScore += result.score; checks++;
    }
  }

  // 3. Pattern check
  const patterned = items.filter(i => i.pattern && i.pattern !== "solid");
  if (patterned.length >= 2) {
    for (let i = 0; i < patterned.length; i++) {
      for (let j = i + 1; j < patterned.length; j++) {
        const result = canMixPatterns(patterned[i].pattern, patterned[j].pattern);
        breakdown.push({
          check: "Pattern mixing",
          items: `${patterned[i].pattern} (${patterned[i].name}) + ${patterned[j].pattern} (${patterned[j].name})`,
          score: result.ok ? 8 : 3,
          level: result.ok ? "good" : "avoid",
          reason: result.reason,
        });
        totalScore += result.ok ? 8 : 3; checks++;
      }
    }
  }

  // 4. Season check
  const seasonData = SEASONS[season];
  if (seasonData) {
    items.filter(i => i.color).forEach(item => {
      if (!seasonData.colors.includes(item.color)) {
        tips.push(`${item.color} is less typical for ${season}. Consider ${seasonData.colors.slice(0,3).join(", ")} instead.`);
      }
    });
    tips.push(`${season} tip: ${seasonData.tip}`);
  }

  // 5. Occasion check
  const occasionData = OCCASIONS[occasion];
  if (occasionData) {
    tips.push(`${occasionData.label} tip: ${occasionData.tip}`);
    items.filter(i => CLOTHING_ITEMS[i.name]).forEach(item => {
      const ci = CLOTHING_ITEMS[item.name];
      if (ci && (ci.formality < occasionData.formalityRange[0] - 1 || ci.formality > occasionData.formalityRange[1] + 1)) {
        tips.push(`${item.name} may not suit a ${occasionData.label} context. Consider swapping.`);
      }
    });
  }

  // 6. Fit tip
  tips.push(FIT_RULES.fitTips[Math.floor(Math.random() * FIT_RULES.fitTips.length)]);

  const avgScore = checks > 0 ? Math.round((totalScore / checks) * 10) / 10 : 5;

  return {
    totalScore: avgScore,
    grade: avgScore >= 8 ? "A" : avgScore >= 6 ? "B" : avgScore >= 4 ? "C" : "D",
    breakdown,
    tips,
    outfitName: generateOutfitName(items, occasion),
  };
}

// ─────────────────────────────────────────────
// SECTION 10: OUTFIT SUGGESTION ENGINE
// ─────────────────────────────────────────────

/**
 * Given a set of clothing items, suggest the best outfit combos.
 *
 * @param {Array<{name: string, color: string, pattern?: string}>} wardrobe
 * @param {string} occasion
 * @param {string} season
 * @returns {Array<{ items: object[], score: object, accessories: string[], explanation: string }>}
 */
function suggestOutfits(wardrobe, occasion = "casual", season = "spring") {
  const tops    = wardrobe.filter(i => CLOTHING_ITEMS[i.name]?.role === "top");
  const bottoms = wardrobe.filter(i => CLOTHING_ITEMS[i.name]?.role === "bottom");
  const layers  = wardrobe.filter(i => CLOTHING_ITEMS[i.name]?.role === "layer");
  const shoes   = wardrobe.filter(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
  const combos  = [];

  tops.forEach(top => {
    bottoms.forEach(bottom => {
      const baseCombo = [top, bottom];
      const baseScore = scoreOutfit(baseCombo, occasion, season);

      // Try with each layer
      const layerCombos = layers.length > 0
        ? layers.map(layer => ({ items: [top, bottom, layer], score: scoreOutfit([top, bottom, layer], occasion, season) }))
        : [{ items: baseCombo, score: baseScore }];

      layerCombos.forEach(({ items, score }) => {
        // Add best shoe
        let bestShoe = null;
        let bestShoeScore = -1;
        shoes.forEach(shoe => {
          const sc = scoreOutfit([...items, shoe], occasion, season);
          if (sc.totalScore > bestShoeScore) { bestShoeScore = sc.totalScore; bestShoe = shoe; }
        });

        const finalItems = bestShoe ? [...items, bestShoe] : items;
        const finalScore = bestShoe ? scoreOutfit(finalItems, occasion, season) : score;

        combos.push({
          items: finalItems,
          score: finalScore,
          accessories: suggestAccessories(finalItems, occasion),
          explanation: buildExplanation(finalItems, finalScore),
        });
      });
    });
  });

  // Sort by score descending, return top 3
  combos.sort((a, b) => b.score.totalScore - a.score.totalScore);
  return combos.slice(0, 3);
}

/**
 * Suggest accessories to complete the outfit.
 */
function suggestAccessories(items, occasion) {
  const suggestions = [];
  const occasionData = OCCASIONS[occasion];

  // Belt rule: if wearing trousers or chinos, suggest belt matching shoes
  const hasBottomWithBelt = items.some(i => ["trousers","chinos","jeans"].includes(i.name));
  const shoe = items.find(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
  if (hasBottomWithBelt && shoe) {
    suggestions.push(`Belt in ${shoe.color || "neutral"} to match your ${shoe.name}`);
  }

  if (occasion === "college" || occasion === "casual") {
    suggestions.push("A cap or beanie can add personality");
    suggestions.push("Backpack or tote bag to complete the casual look");
  }
  if (["smart-casual","formal","interview"].includes(occasion)) {
    suggestions.push("A watch elevates the formality of the outfit");
    if (occasion === "interview") suggestions.push("Minimal jewelry — nothing distracting");
  }
  if (occasion === "party") {
    suggestions.push("Statement watch or bracelet");
    suggestions.push("A small crossbody or clutch bag");
  }

  return suggestions;
}

/**
 * Generate a creative outfit name based on its components.
 */
function generateOutfitName(items, occasion) {
  const colors = items.filter(i => i.color).map(i => i.color);
  const types  = items.filter(i => i.name).map(i => i.name);

  const nameMap = {
    casual:       ["Laid-back look", "Easy everyday", "Relaxed fit", "Off-duty style"],
    "smart-casual":["Effortless polish", "Smart weekend", "Clean casual", "Elevated basics"],
    formal:       ["Sharp and clean", "Power outfit", "Boardroom ready", "Polished professional"],
    college:      ["Campus classic", "Study day fit", "Low-key cool", "Lecture look"],
    party:        ["Night out energy", "Bold evening look", "Party ready", "Stand-out style"],
    beach:        ["Beach day easy", "Sun-ready", "Coastal casual"],
    interview:    ["First impression", "Confident and clean", "Interview ready"],
    gym:          ["Active essentials", "Workout mode", "Athletic daily"],
  };

  const names = nameMap[occasion] || ["Outfit suggestion"];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Build a human-readable explanation for the outfit.
 */
function buildExplanation(items, score) {
  const goodChecks = score.breakdown.filter(b => b.score >= 7);
  const badChecks  = score.breakdown.filter(b => b.score < 5);

  let text = `Score: ${score.totalScore}/10 (${score.grade}). `;

  if (goodChecks.length > 0) {
    text += `Works because: ${goodChecks[0].reason} `;
  }
  if (badChecks.length > 0) {
    text += `Watch out: ${badChecks[0].reason} `;
  }

  return text.trim();
}

// ─────────────────────────────────────────────
// SECTION 11: CAPSULE WARDROBE BUILDER
// ─────────────────────────────────────────────

/**
 * The capsule wardrobe — a minimal set of items that
 * mix and match into maximum outfits.
 * Based on the "10-item wardrobe" and Parisian wardrobe principles.
 */
const CAPSULE_WARDROBE = {
  essentials: [
    { name: "white t-shirt",        why: "Pairs with everything. The most versatile piece in any wardrobe." },
    { name: "navy or black jeans",  why: "The neutral bottom. Goes from casual to smart casual." },
    { name: "white shirt",          why: "Elevates any outfit. Wear open over tee or tucked in." },
    { name: "neutral chinos",       why: "Beige or gray chinos cover smart casual and casual in one." },
    { name: "classic white sneakers",why: "White sneakers work with 80% of casual and smart-casual outfits." },
    { name: "black leather shoes",  why: "One formal shoe covers interviews, events, formal days." },
    { name: "dark wash jeans",      why: "More formal than medium wash. The most versatile denim." },
    { name: "neutral sweater",      why: "Camel, gray, or navy. Layering piece that adds warmth and texture." },
    { name: "blazer (navy or gray)",why: "The single item that elevates everything. Jeans + blazer = always works." },
    { name: "trench coat or overcoat", why: "One great outer layer pulls every outfit together." },
  ],
  strategy: [
    "Buy neutrals first. Color and prints on top of a neutral foundation.",
    "Invest in fit. A cheap item that fits perfectly beats an expensive item that doesn't.",
    "The 30-wear test: before buying, ask if you'll wear it 30 times.",
    "One great shoe per category. Sneakers, formal, and boots covers most scenarios.",
    "Quality fabric lasts longer and looks better over time. Wool, cotton, denim over polyester.",
  ],
};

// ─────────────────────────────────────────────
// SECTION 12: CLIP INTEGRATION HELPER
// ─────────────────────────────────────────────

/**
 * Map CLIP output (which gives text labels) to the clothing
 * items and colors in this engine.
 *
 * CLIP gives you: e.g. "a blue denim jacket"
 * This parses that into { name: "denim jacket", color: "blue" }
 *
 * @param {string} clipLabel - raw label from CLIP model
 * @returns {{ name: string|null, color: string|null, pattern: string|null }}
 */
function parseCLIPLabel(clipLabel) {
  const label = clipLabel.toLowerCase();

  // Find color
  const colorFound = Object.keys(COLOR_PROFILES).find(c => label.includes(c)) || null;

  // Find clothing item (longest match wins to avoid "shirt" matching "dress shirt")
  const itemsSortedByLength = Object.keys(CLOTHING_ITEMS).sort((a, b) => b.length - a.length);
  const itemFound = itemsSortedByLength.find(item => label.includes(item)) || null;

  // Find pattern
  const patternFound = Object.keys(PATTERNS).find(p => label.includes(p)) || "solid";

  return { name: itemFound, color: colorFound, pattern: patternFound };
}

/**
 * Full pipeline: takes an array of CLIP labels, builds a wardrobe,
 * and suggests outfits.
 *
 * @param {string[]} clipLabels - e.g. ["a white t-shirt", "blue slim jeans", "white sneakers"]
 * @param {string} occasion
 * @param {string} season
 * @returns outfit suggestions
 */
function suggestFromCLIP(clipLabels, occasion = "casual", season = "spring") {
  const wardrobe = clipLabels
    .map(parseCLIPLabel)
    .filter(item => item.name !== null);

  if (wardrobe.length === 0) {
    return { error: "No recognizable clothing items found in CLIP labels." };
  }

  return suggestOutfits(wardrobe, occasion, season);
}

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  // Data
  COLOR_PROFILES,
  COLOR_HARMONY,
  COLOR_RULES,
  CLOTHING_ITEMS,
  PATTERNS,
  FIT_RULES,
  OCCASIONS,
  SEASONS,
  CAPSULE_WARDROBE,

  // Core functions
  scoreColorPair,
  scoreOutfit,
  suggestOutfits,
  checkFormalityMatch,
  canMixPatterns,
  suggestAccessories,
  parseCLIPLabel,
  suggestFromCLIP,
};

// ─────────────────────────────────────────────
// USAGE EXAMPLE (comment out in production)
// ─────────────────────────────────────────────

/*
// 1. Direct usage with known items:
const myOutfit = [
  { name: "blazer",  color: "navy",  pattern: "solid" },
  { name: "jeans",   color: "denim", pattern: "solid" },
  { name: "shirt",   color: "white", pattern: "solid" },
  { name: "loafers", color: "brown", pattern: "solid" },
];
const result = scoreOutfit(myOutfit, "smart-casual", "fall");
console.log(result);

// 2. With CLIP labels from HuggingFace:
const clipOutputs = [
  "a navy blue blazer",
  "white dress shirt",
  "dark wash slim jeans",
  "brown leather loafers",
];
const suggestions = suggestFromCLIP(clipOutputs, "smart-casual", "fall");
suggestions.forEach((s, i) => {
  console.log(`Outfit ${i+1}: ${s.score.outfitName}`);
  console.log(`Score: ${s.score.totalScore}/10`);
  console.log(`Items: ${s.items.map(i => `${i.color} ${i.name}`).join(", ")}`);
  console.log(`Tips: ${s.score.tips.join(" | ")}`);
  console.log(`Accessories: ${s.accessories.join(", ")}`);
});

// 3. Score a single color pair:
console.log(scoreColorPair("navy", "mustard"));
// { score: 10, level: "excellent", reason: "navy + mustard is a timeless, reliable pairing." }

// 4. Check pattern mixing:
console.log(canMixPatterns("striped", "plaid"));
// { ok: false, reason: "..." }
*/
