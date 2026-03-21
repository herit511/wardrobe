// ============================================================
//  fashionEngine.js — v2 — Updated Fashion Logic Engine
//  Changes from v1:
//  - Season replaced with WEATHER: hot | mid | cold
//  - New occasions: casual, office, party, date night, gym, ethnic
//  - Weather-aware item filtering (no jackets on hot days)
//  - Smart accessories: only suggest when they genuinely elevate
//  - Outfit variety: top 3 results guaranteed to use different tops
//  - Accessories in wardrobe (watch, rings, chains) handled properly
// ============================================================

// ─────────────────────────────────────────────
// SECTION 1: COLOR DATA
// ─────────────────────────────────────────────

const COLOR_PROFILES = {
  white:          { family: "neutral", temp: "neutral", neutral: true  },
  black:          { family: "neutral", temp: "neutral", neutral: true  },
  gray:           { family: "neutral", temp: "cool",    neutral: true  },
  "light gray":   { family: "neutral", temp: "cool",    neutral: true  },
  beige:          { family: "neutral", temp: "warm",    neutral: true  },
  cream:          { family: "neutral", temp: "warm",    neutral: true  },
  ivory:          { family: "neutral", temp: "warm",    neutral: true  },
  "off-white":    { family: "neutral", temp: "warm",    neutral: true  },
  camel:          { family: "neutral", temp: "warm",    neutral: true  },
  tan:            { family: "neutral", temp: "warm",    neutral: true  },
  taupe:          { family: "neutral", temp: "warm",    neutral: true  },
  charcoal:       { family: "neutral", temp: "cool",    neutral: true  },
  brown:          { family: "neutral", temp: "warm",    neutral: true  },
  "dark brown":   { family: "neutral", temp: "warm",    neutral: true  },
  navy:           { family: "blue",    temp: "cool",    neutral: true  },
  blue:           { family: "blue",    temp: "cool",    neutral: false },
  "light blue":   { family: "blue",    temp: "cool",    neutral: false },
  "royal blue":   { family: "blue",    temp: "cool",    neutral: false },
  "sky blue":     { family: "blue",    temp: "cool",    neutral: false },
  cobalt:         { family: "blue",    temp: "cool",    neutral: false },
  denim:          { family: "blue",    temp: "cool",    neutral: true  },
  green:          { family: "green",   temp: "cool",    neutral: false },
  olive:          { family: "green",   temp: "warm",    neutral: true  },
  khaki:          { family: "green",   temp: "warm",    neutral: true  },
  "forest green": { family: "green",   temp: "cool",    neutral: false },
  sage:           { family: "green",   temp: "cool",    neutral: false },
  mint:           { family: "green",   temp: "cool",    neutral: false },
  emerald:        { family: "green",   temp: "cool",    neutral: false },
  red:            { family: "red",     temp: "warm",    neutral: false },
  "dark red":     { family: "red",     temp: "warm",    neutral: false },
  crimson:        { family: "red",     temp: "warm",    neutral: false },
  maroon:         { family: "red",     temp: "warm",    neutral: false },
  burgundy:       { family: "red",     temp: "warm",    neutral: false },
  wine:           { family: "red",     temp: "warm",    neutral: false },
  pink:           { family: "pink",    temp: "warm",    neutral: false },
  "hot pink":     { family: "pink",    temp: "warm",    neutral: false },
  blush:          { family: "pink",    temp: "warm",    neutral: false },
  mauve:          { family: "pink",    temp: "warm",    neutral: false },
  rose:           { family: "pink",    temp: "warm",    neutral: false },
  yellow:         { family: "yellow",  temp: "warm",    neutral: false },
  mustard:        { family: "yellow",  temp: "warm",    neutral: false },
  gold:           { family: "yellow",  temp: "warm",    neutral: false },
  orange:         { family: "orange",  temp: "warm",    neutral: false },
  coral:          { family: "orange",  temp: "warm",    neutral: false },
  peach:          { family: "orange",  temp: "warm",    neutral: false },
  rust:           { family: "orange",  temp: "warm",    neutral: false },
  terracotta:     { family: "orange",  temp: "warm",    neutral: false },
  purple:         { family: "purple",  temp: "cool",    neutral: false },
  lavender:       { family: "purple",  temp: "cool",    neutral: false },
  violet:         { family: "purple",  temp: "cool",    neutral: false },
  plum:           { family: "purple",  temp: "cool",    neutral: false },
  lilac:          { family: "purple",  temp: "cool",    neutral: false },
  silver:         { family: "neutral", temp: "cool",    neutral: true  },
  golden:         { family: "yellow",  temp: "warm",    neutral: false },
  "rose gold":    { family: "pink",    temp: "warm",    neutral: false },
};

// ─────────────────────────────────────────────
// SECTION 2: COLOR HARMONY & RULES
// ─────────────────────────────────────────────

const COLOR_HARMONY = {
  complementary: [
    ["blue","orange"],["red","green"],["yellow","purple"],
    ["pink","green"],["navy","orange"],["navy","mustard"],
  ],
  analogous: [
    ["blue","green"],["blue","purple"],["red","orange"],
    ["red","pink"],["yellow","orange"],["yellow","green"],
    ["purple","pink"],["orange","yellow"],["green","blue"],
  ],
};

const COLOR_RULES = {
  alwaysWorks: [
    ["navy","white"],["navy","gray"],["navy","beige"],["navy","camel"],
    ["navy","burgundy"],["navy","light blue"],["navy","mustard"],
    ["black","white"],["black","gray"],["black","beige"],["black","camel"],
    ["black","navy"],["black","red"],["black","pink"],
    ["gray","white"],["gray","navy"],["gray","blue"],["gray","pink"],
    ["gray","burgundy"],["white","beige"],["white","tan"],["white","camel"],
    ["white","blue"],["white","olive"],["beige","brown"],["beige","camel"],
    ["beige","navy"],["camel","white"],["camel","black"],["camel","burgundy"],
    ["olive","beige"],["olive","white"],["olive","camel"],["olive","rust"],
    ["burgundy","camel"],["burgundy","navy"],["burgundy","gray"],
    ["mustard","navy"],["mustard","gray"],["mustard","brown"],
    ["denim","white"],["denim","gray"],["denim","black"],["denim","beige"],
    ["coral","navy"],["coral","white"],["blush","gray"],["blush","navy"],
    ["rust","navy"],["rust","cream"],["rust","olive"],
    ["terracotta","beige"],["terracotta","white"],["terracotta","navy"],
    ["charcoal","white"],["charcoal","navy"],["charcoal","burgundy"],
  ],
  avoid: [
    ["red","orange"],["red","pink"],["brown","black"],["navy","black"],
    ["green","red"],["purple","orange"],["yellow","red"],["pink","orange"],
    ["blue","brown"],
  ],
};

// ─────────────────────────────────────────────
// SECTION 3: WEATHER SYSTEM
// ─────────────────────────────────────────────

const WEATHER = {
  hot: {
    label: "Hot",
    bannedCategories: ["outerwear"],
    bannedItems: [
      "jacket","blazer","suit jacket","leather jacket","bomber jacket",
      "trench coat","overcoat","parka","cardigan","hoodie","sweatshirt",
      "sweater","turtleneck","vest","nehru jacket",
    ],
    preferredFabrics: ["linen","cotton","chambray","jersey"],
    colorBias: ["white","cream","beige","sky blue","mint","peach","coral","light blue","sage"],
    heavyColorPenalty: ["black","charcoal","dark brown","maroon","burgundy","wine","plum"],
    layerRequired: false,
    tip: "Light fabrics only. Avoid black — absorbs heat. White and pastels keep you cool.",
  },
  mid: {
    label: "Mild",
    bannedCategories: [],
    bannedItems: ["parka"],
    preferredFabrics: ["cotton","denim","light wool","jersey","linen"],
    colorBias: [],
    heavyColorPenalty: [],
    layerRequired: false,
    tip: "Most versatile weather. A light jacket gives you flexibility as temperature shifts.",
  },
  cold: {
    label: "Cold",
    bannedCategories: [],
    bannedItems: ["shorts","tank top","sandals","flip flops","slides"],
    preferredFabrics: ["wool","cashmere","flannel","leather","fleece","denim"],
    colorBias: ["navy","charcoal","black","burgundy","camel","dark red","forest green","plum"],
    heavyColorPenalty: [],
    layerRequired: true,
    tip: "Layer up — base layer + mid layer + outer layer is the formula. Texture makes cold-weather outfits interesting.",
  },
};

// ─────────────────────────────────────────────
// SECTION 4: CLOTHING ITEMS
// ─────────────────────────────────────────────

const CLOTHING_ITEMS = {
  // Tops
  "t-shirt":          { formality: 1, role: "top",      category: "top",      weatherOk: ["hot","mid"] },
  "graphic tee":      { formality: 1, role: "top",      category: "top",      weatherOk: ["hot","mid"] },
  "polo shirt":       { formality: 2, role: "top",      category: "top",      weatherOk: ["hot","mid"] },
  "shirt":            { formality: 3, role: "top",      category: "top",      weatherOk: ["hot","mid","cold"] },
  "dress shirt":      { formality: 4, role: "top",      category: "top",      weatherOk: ["hot","mid","cold"] },
  "blouse":           { formality: 3, role: "top",      category: "top",      weatherOk: ["hot","mid"] },
  "tank top":         { formality: 1, role: "top",      category: "top",      weatherOk: ["hot"] },
  "crop top":         { formality: 1, role: "top",      category: "top",      weatherOk: ["hot","mid"] },
  "sweater":          { formality: 2, role: "top",      category: "top",      weatherOk: ["mid","cold"] },
  "turtleneck":       { formality: 3, role: "top",      category: "top",      weatherOk: ["cold"] },
  "hoodie":           { formality: 1, role: "top",      category: "top",      weatherOk: ["mid","cold"] },
  "sweatshirt":       { formality: 1, role: "top",      category: "top",      weatherOk: ["mid","cold"] },
  "kurta":            { formality: 3, role: "top",      category: "top",      weatherOk: ["hot","mid","cold"] },
  "sherwani":         { formality: 5, role: "top",      category: "top",      weatherOk: ["mid","cold"] },

  // Bottoms
  "jeans":            { formality: 2, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },
  "slim jeans":       { formality: 2, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },
  "straight jeans":   { formality: 2, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },
  "wide leg jeans":   { formality: 2, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },
  "chinos":           { formality: 3, role: "bottom",   category: "bottom",   weatherOk: ["hot","mid","cold"] },
  "trousers":         { formality: 4, role: "bottom",   category: "bottom",   weatherOk: ["hot","mid","cold"] },
  "shorts":           { formality: 1, role: "bottom",   category: "bottom",   weatherOk: ["hot"] },
  "cargo pants":      { formality: 1, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },
  "joggers":          { formality: 1, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },
  "sweatpants":       { formality: 1, role: "bottom",   category: "bottom",   weatherOk: ["cold"] },
  "skirt":            { formality: 3, role: "bottom",   category: "bottom",   weatherOk: ["hot","mid"] },
  "mini skirt":       { formality: 2, role: "bottom",   category: "bottom",   weatherOk: ["hot","mid"] },
  "midi skirt":       { formality: 3, role: "bottom",   category: "bottom",   weatherOk: ["mid"] },
  "maxi skirt":       { formality: 3, role: "bottom",   category: "bottom",   weatherOk: ["hot","mid"] },
  "leggings":         { formality: 1, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },
  "dhoti":            { formality: 3, role: "bottom",   category: "bottom",   weatherOk: ["hot","mid"] },
  "churidar":         { formality: 4, role: "bottom",   category: "bottom",   weatherOk: ["mid","cold"] },

  // Outerwear / Layers
  "jacket":           { formality: 2, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "blazer":           { formality: 4, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "suit jacket":      { formality: 5, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "denim jacket":     { formality: 2, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "leather jacket":   { formality: 2, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "bomber jacket":    { formality: 2, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "trench coat":      { formality: 4, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "overcoat":         { formality: 4, role: "layer",    category: "outerwear",weatherOk: ["cold"] },
  "parka":            { formality: 1, role: "layer",    category: "outerwear",weatherOk: ["cold"] },
  "cardigan":         { formality: 2, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "vest":             { formality: 3, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },
  "nehru jacket":     { formality: 4, role: "layer",    category: "outerwear",weatherOk: ["mid","cold"] },

  // Shoes
  "sneakers":         { formality: 1, role: "shoes",    category: "footwear", weatherOk: ["hot","mid","cold"] },
  "white sneakers":   { formality: 2, role: "shoes",    category: "footwear", weatherOk: ["hot","mid","cold"] },
  "chunky sneakers":  { formality: 1, role: "shoes",    category: "footwear", weatherOk: ["hot","mid"] },
  "loafers":          { formality: 3, role: "shoes",    category: "footwear", weatherOk: ["hot","mid","cold"] },
  "oxford shoes":     { formality: 5, role: "shoes",    category: "footwear", weatherOk: ["mid","cold"] },
  "derby shoes":      { formality: 4, role: "shoes",    category: "footwear", weatherOk: ["mid","cold"] },
  "chelsea boots":    { formality: 3, role: "shoes",    category: "footwear", weatherOk: ["mid","cold"] },
  "ankle boots":      { formality: 3, role: "shoes",    category: "footwear", weatherOk: ["mid","cold"] },
  "boots":            { formality: 2, role: "shoes",    category: "footwear", weatherOk: ["mid","cold"] },
  "sandals":          { formality: 1, role: "shoes",    category: "footwear", weatherOk: ["hot","mid"] },
  "slides":           { formality: 1, role: "shoes",    category: "footwear", weatherOk: ["hot"] },
  "heels":            { formality: 4, role: "shoes",    category: "footwear", weatherOk: ["hot","mid"] },
  "block heels":      { formality: 3, role: "shoes",    category: "footwear", weatherOk: ["mid"] },
  "mules":            { formality: 3, role: "shoes",    category: "footwear", weatherOk: ["hot","mid"] },
  "flip flops":       { formality: 1, role: "shoes",    category: "footwear", weatherOk: ["hot"] },
  "kolhapuri":        { formality: 2, role: "shoes",    category: "footwear", weatherOk: ["hot","mid"] },
  "mojari":           { formality: 4, role: "shoes",    category: "footwear", weatherOk: ["mid","cold"] },

  // Accessories — NEVER included in outfit combinations
  // only passed through suggestAccessories()
  "belt":             { formality: 3, role: "accessory", category: "accessory" },
  "watch":            { formality: 3, role: "accessory", category: "accessory" },
  "ring":             { formality: 2, role: "accessory", category: "accessory" },
  "rings":            { formality: 2, role: "accessory", category: "accessory" },
  "chain":            { formality: 2, role: "accessory", category: "accessory" },
  "chains":           { formality: 2, role: "accessory", category: "accessory" },
  "necklace":         { formality: 3, role: "accessory", category: "accessory" },
  "bracelet":         { formality: 2, role: "accessory", category: "accessory" },
  "sunglasses":       { formality: 1, role: "accessory", category: "accessory" },
  "cap":              { formality: 1, role: "accessory", category: "accessory" },
  "beanie":           { formality: 1, role: "accessory", category: "accessory" },
  "scarf":            { formality: 2, role: "accessory", category: "accessory" },
  "bag":              { formality: 3, role: "accessory", category: "accessory" },
  "backpack":         { formality: 1, role: "accessory", category: "accessory" },
  "tote bag":         { formality: 2, role: "accessory", category: "accessory" },
  "dupatta":          { formality: 3, role: "accessory", category: "accessory" },
  "pagdi":            { formality: 4, role: "accessory", category: "accessory" },
};

// ─────────────────────────────────────────────
// SECTION 5: PATTERN RULES
// ─────────────────────────────────────────────

const PATTERNS = {
  solid:         { formality: 3, bold: false, scale: "n/a" },
  striped:       { formality: 3, bold: false, scale: "medium" },
  "thin stripe": { formality: 4, bold: false, scale: "small" },
  "wide stripe": { formality: 2, bold: true,  scale: "large" },
  checkered:     { formality: 3, bold: false, scale: "medium" },
  plaid:         { formality: 2, bold: true,  scale: "large" },
  floral:        { formality: 2, bold: true,  scale: "varies" },
  "small floral":{ formality: 3, bold: false, scale: "small" },
  graphic:       { formality: 1, bold: true,  scale: "large" },
  camo:          { formality: 1, bold: true,  scale: "large" },
  animal:        { formality: 2, bold: true,  scale: "medium" },
  houndstooth:   { formality: 4, bold: false, scale: "small" },
  herringbone:   { formality: 4, bold: false, scale: "small" },
  pinstripe:     { formality: 5, bold: false, scale: "small" },
  polka:         { formality: 2, bold: false, scale: "small" },
  geometric:     { formality: 2, bold: true,  scale: "medium" },
  abstract:      { formality: 2, bold: true,  scale: "large" },
  embroidered:   { formality: 4, bold: false, scale: "detail" },
  block_print:   { formality: 3, bold: false, scale: "medium" },
};

function canMixPatterns(pattern1, pattern2) {
  if (pattern1 === "solid" || pattern2 === "solid")
    return { ok: true, reason: "Solid + pattern always works." };
  const p1 = PATTERNS[pattern1], p2 = PATTERNS[pattern2];
  if (!p1 || !p2) return { ok: true, reason: "Unknown patterns — check manually." };
  if (p1.bold && p2.bold) return { ok: false, reason: `Two bold patterns clash. Use one solid piece.` };
  if (p1.scale !== p2.scale) return { ok: true, reason: `Different scales balance each other.` };
  return { ok: false, reason: `Same scale patterns compete. Try different scales.` };
}

// ─────────────────────────────────────────────
// SECTION 6: OCCASIONS
// ─────────────────────────────────────────────

const OCCASIONS = {
  casual: {
    label: "Casual",
    formalityRange: [1, 2],
    tip: "Comfort is king. Clean and simple beats overdone.",
    accessoryStyle: "minimal",
  },
  office: {
    label: "Office",
    formalityRange: [3, 5],
    tip: "Clean, pressed, fitted. One statement piece max. No logos or graphics.",
    accessoryStyle: "watch-only",
  },
  party: {
    label: "Party",
    formalityRange: [2, 4],
    tip: "Bolder colors and textures work here. Darker palette for evening. One statement piece.",
    accessoryStyle: "statement",
  },
  "date night": {
    label: "Date Night",
    formalityRange: [3, 4],
    tip: "Dressed up but not stiff. Dark tones, clean silhouette. Less is more.",
    accessoryStyle: "subtle",
  },
  gym: {
    label: "Gym",
    formalityRange: [1, 1],
    tip: "Function first. Matching set looks intentional. Avoid cotton for intense workouts.",
    accessoryStyle: "none",
  },
  ethnic: {
    label: "Ethnic / Traditional",
    formalityRange: [3, 5],
    tip: "Match embroidery tone across pieces. Footwear completes ethnic — mojari or kolhapuri over sneakers.",
    accessoryStyle: "ethnic",
  },
};

// ─────────────────────────────────────────────
// SECTION 7: FIT RULES
// ─────────────────────────────────────────────

const FIT_RULES = {
  fitTips: [
    "Tuck in your shirt to define the waist and add polish.",
    "Oversized tops work best with slim or straight-leg bottoms.",
    "Cropped tops pair best with high-waisted bottoms.",
    "Wide-leg trousers need a tucked or cropped top — never untucked and loose.",
    "A slim fit top with straight-leg pants is a clean, timeless silhouette.",
  ],
};

// ─────────────────────────────────────────────
// SECTION 8: INTENTIONAL CONTRASTS
// ─────────────────────────────────────────────

const INTENTIONAL_CONTRASTS = [
  { top: "blazer",      bottom: "jeans",    note: "Smart-casual classic." },
  { top: "blazer",      bottom: "joggers",  note: "Contemporary fashion-forward." },
  { top: "suit jacket", bottom: "jeans",    note: "Bold contrast — creative contexts." },
  { top: "dress shirt", bottom: "jeans",    note: "Tucked = smart casual. Untucked = casual." },
  { top: "turtleneck",  bottom: "trousers", note: "Minimalist chic." },
  { top: "hoodie",      bottom: "trousers", note: "Normcore — very popular right now." },
  { top: "t-shirt",     bottom: "trousers", note: "Works with fitted tee and tailored trousers." },
];

// ─────────────────────────────────────────────
// SECTION 9: SMART ACCESSORY LOGIC
// ─────────────────────────────────────────────

function suggestAccessories(outfitItems, availableAccessories = [], occasion, weather) {
  const suggestions = [];
  const style = OCCASIONS[occasion]?.accessoryStyle || "minimal";
  const owned = availableAccessories.map(a => (a.name || "").toLowerCase());

  // Gym: no accessories

  // Watch: office, date night, party
  if (["watch-only","statement","subtle"].includes(style) && owned.includes("watch")) {
    suggestions.push("Watch — elevates the overall formality");
  }

  // Chain: casual, party, date night with open collar only — never office
  if (!["watch-only","none","ethnic"].includes(style)) {
    const hasChain = owned.includes("chain") || owned.includes("chains");
    if (hasChain && hasOpenCollar) {
      suggestions.push("Chain — works with the open collar here. Keep it understated.");
    }
  }

  // Rings: party and date night only
  if (["statement","subtle"].includes(style)) {
    const hasRing = owned.includes("ring") || owned.includes("rings");
    if (hasRing) {
      suggestions.push("Ring(s) — 1 or 2 max. Keep metal tone consistent with any watch or chain.");
    }
  }

  // Ethnic accessories
  if (style === "ethnic") {
    if (owned.includes("dupatta"))  suggestions.push("Dupatta — drape style defines the ethnic look");
    if (owned.includes("pagdi"))    suggestions.push("Pagdi — for formal ethnic occasions");
    if (owned.includes("necklace")) suggestions.push("Necklace — gold or kundan suits ethnic best");
  }

  // Sunglasses: hot weather, casual or party
  if (weather === "hot" && ["casual","party"].includes(occasion) && owned.includes("sunglasses")) {
    suggestions.push("Sunglasses — essential finishing touch in the heat");
  }

  // Cap: hot + casual only
  if (weather === "hot" && occasion === "casual" && owned.includes("cap")) {
    suggestions.push("Cap — practical and adds a casual edge");
  }

  // Cold weather scarf
  if (weather === "cold" && owned.includes("scarf")) {
    suggestions.push("Scarf — adds texture and warmth, ties the cold-weather look together");
  }

  return suggestions;
}

// ─────────────────────────────────────────────
// SECTION 10: WEATHER FILTER
// ─────────────────────────────────────────────

function filterByWeather(items, weather) {
  const wd = WEATHER[weather];
  if (!wd) return items;
  return items.filter(item => {
    const ci = CLOTHING_ITEMS[item.name];
    if (!ci) return true;
    if (wd.bannedCategories.includes(ci.category)) return false;
    if (wd.bannedItems.includes(item.name)) return false;
    if (ci.weatherOk && !ci.weatherOk.includes(weather)) return false;
    return true;
  });
}

// ─────────────────────────────────────────────
// SECTION 11: COLOR SCORING
// ─────────────────────────────────────────────

function scoreColorPair(color1, color2) {
  const c1 = (color1 || "").toLowerCase().trim();
  const c2 = (color2 || "").toLowerCase().trim();
  if (!c1 || !c2) return { score: 5, level: "unknown", reason: "Color missing." };
  if (c1 === c2)  return { score: 7, level: "good",    reason: "Monochromatic — works with tonal variation." };

  const alwaysOk = COLOR_RULES.alwaysWorks.some(([a,b])=>(a===c1&&b===c2)||(a===c2&&b===c1));
  if (alwaysOk) return { score: 10, level: "excellent", reason: `${c1} + ${c2} is a timeless pairing.` };

  const avoid = COLOR_RULES.avoid.some(([a,b])=>(a===c1&&b===c2)||(a===c2&&b===c1));
  if (avoid) return { score: 2, level: "avoid", reason: `${c1} + ${c2} clashes. Swap one for a neutral.` };

  const p1 = COLOR_PROFILES[c1], p2 = COLOR_PROFILES[c2];
  if (p1?.neutral || p2?.neutral)
    return { score: 8, level: "great", reason: `${p1?.neutral?c1:c2} is a neutral — pairs broadly.` };
  if (!p1 || !p2) return { score: 5, level: "unknown", reason: "Color not in database — check manually." };

  const isComp = COLOR_HARMONY.complementary.some(
    ([a,b])=>(a===p1.family&&b===p2.family)||(a===p2.family&&b===p1.family)
  );
  if (isComp) return { score: 8, level: "great", reason: `Complementary colors — bold, high-contrast.` };

  const isAnal = COLOR_HARMONY.analogous.some(
    ([a,b])=>(a===p1.family&&b===p2.family)||(a===p2.family&&b===p1.family)
  );
  if (isAnal) return { score: 8, level: "great", reason: `Analogous colors — harmonious and cohesive.` };

  if (p1.temp === p2.temp) return { score: 6, level: "okay", reason: `Same temperature tone — generally cohesive.` };

  return { score: 4, level: "risky", reason: `Mixed warm/cool without clear harmony. Add a neutral to bridge.` };
}

// ─────────────────────────────────────────────
// SECTION 12: OUTFIT SCORING
// ─────────────────────────────────────────────

function checkFormalityMatch(name1, name2) {
  const i1 = CLOTHING_ITEMS[name1], i2 = CLOTHING_ITEMS[name2];
  if (!i1 || !i2) return { ok: true, score: 5, note: "Item not in database." };
  const diff = Math.abs(i1.formality - i2.formality);
  if (diff === 0) return { ok: true,  score: 10, note: "Perfect formality match." };
  if (diff === 1) return { ok: true,  score: 8,  note: "Close formality — works well." };
  if (diff === 2) return { ok: true,  score: 5,  note: "Slight gap — intentional contrast can work." };
  if (diff === 3) return { ok: false, score: 3,  note: `Formality mismatch (${name1} vs ${name2}).` };
  return              { ok: false, score: 1,  note: "Extreme formality clash. Avoid." };
}

function scoreOutfit(items, occasion = "casual", weather = "mid") {
  const breakdown = [];
  const tips = [];
  let totalScore = 0, checks = 0;

  // Color pairs
  const colorItems = items.filter(i => i.color);
  for (let i = 0; i < colorItems.length; i++) {
    for (let j = i + 1; j < colorItems.length; j++) {
      const r = scoreColorPair(colorItems[i].color, colorItems[j].color);
      breakdown.push({ check: "Color pairing", items: `${colorItems[i].color} + ${colorItems[j].color}`, ...r });
      totalScore += r.score; checks++;
    }
  }

  // Weather color penalty
  const wd = WEATHER[weather];
  if (wd?.heavyColorPenalty?.length > 0) {
    items.filter(i => i.color).forEach(item => {
      if (wd.heavyColorPenalty.includes(item.color)) {
        breakdown.push({ check: "Weather", items: item.color, score: 4, level: "caution",
          reason: `${item.color} absorbs heat — not ideal for hot weather.` });
        totalScore += 4; checks++;
      }
    });
  }

  // Formality pairs
  const wearable = items.filter(i => CLOTHING_ITEMS[i.name]);
  for (let i = 0; i < wearable.length; i++) {
    for (let j = i + 1; j < wearable.length; j++) {
      const isIntentional = INTENTIONAL_CONTRASTS.some(
        c=>(c.top===wearable[i].name&&c.bottom===wearable[j].name)||
           (c.top===wearable[j].name&&c.bottom===wearable[i].name)
      );
      if (isIntentional) {
        const contrast = INTENTIONAL_CONTRASTS.find(
          c=>(c.top===wearable[i].name&&c.bottom===wearable[j].name)||
             (c.top===wearable[j].name&&c.bottom===wearable[i].name)
        );
        breakdown.push({ check: "Formality", items: `${wearable[i].name} + ${wearable[j].name}`,
          score: 9, level: "great", reason: contrast.note });
        totalScore += 9; checks++; continue;
      }
      const r = checkFormalityMatch(wearable[i].name, wearable[j].name);
      breakdown.push({ check: "Formality", items: `${wearable[i].name} + ${wearable[j].name}`, ...r });
      totalScore += r.score; checks++;
    }
  }

  // Pattern check
  const patterned = items.filter(i => i.pattern && i.pattern !== "solid");
  for (let i = 0; i < patterned.length; i++) {
    for (let j = i + 1; j < patterned.length; j++) {
      const r = canMixPatterns(patterned[i].pattern, patterned[j].pattern);
      breakdown.push({ check: "Patterns", items: `${patterned[i].pattern} + ${patterned[j].pattern}`,
        score: r.ok ? 8 : 3, level: r.ok ? "good" : "avoid", reason: r.reason });
      totalScore += r.ok ? 8 : 3; checks++;
    }
  }

  tips.push(OCCASIONS[occasion]?.tip || "");
  tips.push(wd?.tip || "");
  tips.push(FIT_RULES.fitTips[Math.floor(Math.random() * FIT_RULES.fitTips.length)]);

  const avg = checks > 0 ? Math.round((totalScore / checks) * 10) / 10 : 5;
  return {
    totalScore: avg,
    grade: avg >= 8 ? "A" : avg >= 6 ? "B" : avg >= 4 ? "C" : "D",
    breakdown,
    tips: tips.filter(Boolean),
    outfitName: generateOutfitName(items, occasion),
  };
}

// ─────────────────────────────────────────────
// SECTION 13: SUGGESTION ENGINE (with variety)
// ─────────────────────────────────────────────

function suggestOutfits(wardrobe, occasion = "casual", weather = "mid") {
  // Split accessories out — they never go into combo generation
  const accessories  = wardrobe.filter(i => CLOTHING_ITEMS[i.name]?.role === "accessory");
  const clothingOnly = wardrobe.filter(i => CLOTHING_ITEMS[i.name]?.role !== "accessory");

  // Weather filter — removes jackets on hot days, shorts on cold days etc.
  const filtered = filterByWeather(clothingOnly, weather);

  const tops    = filtered.filter(i => CLOTHING_ITEMS[i.name]?.role === "top");
  const bottoms = filtered.filter(i => CLOTHING_ITEMS[i.name]?.role === "bottom");
  const layers  = filtered.filter(i => CLOTHING_ITEMS[i.name]?.role === "layer");
  const shoes   = filtered.filter(i => CLOTHING_ITEMS[i.name]?.category === "footwear");

  if (tops.length === 0 || bottoms.length === 0) return [];

  const allCombos = [];

  tops.forEach(top => {
    bottoms.forEach(bottom => {
      // Layer options: hot weather = never add layer; cold = try with and without
      const layerOptions = weather === "hot" ? [null] :
                           layers.length > 0 ? [null, ...layers] : [null];

      layerOptions.forEach(layer => {
        const base = layer ? [top, bottom, layer] : [top, bottom];

        // Find best shoe
        let bestShoe = null, bestShoeScore = -1;
        shoes.forEach(shoe => {
          const sc = scoreOutfit([...base, shoe], occasion, weather);
          if (sc.totalScore > bestShoeScore) { bestShoeScore = sc.totalScore; bestShoe = shoe; }
        });

        const finalItems = bestShoe ? [...base, bestShoe] : base;
        const finalScore = scoreOutfit(finalItems, occasion, weather);

        allCombos.push({
          items: finalItems,
          score: finalScore,
          accessories: suggestAccessories(finalItems, accessories, occasion, weather),
          _topKey: top.name, // for variety enforcement
        });
      });
    });
  });

  allCombos.sort((a, b) => b.score.totalScore - a.score.totalScore);

  // Enforce variety: each of top 3 must use a DIFFERENT top
  const result = [];
  const usedTops = new Set();

  for (const combo of allCombos) {
    if (!usedTops.has(combo._topKey)) {
      usedTops.add(combo._topKey);
      result.push(combo);
    }
    if (result.length >= 3) break;
  }

  // Fallback: if not enough diverse tops, fill remaining from sorted list
  if (result.length < 3) {
    for (const combo of allCombos) {
      if (!result.includes(combo)) result.push(combo);
      if (result.length >= 3) break;
    }
  }

  // Clean up internal key before returning
  return result.map(({ _topKey, ...rest }) => rest);
}

// ─────────────────────────────────────────────
// SECTION 14: HELPERS & CLIP INTEGRATION
// ─────────────────────────────────────────────

function generateOutfitName(items, occasion) {
  const map = {
    casual:       ["Laid-back look","Easy everyday","Relaxed fit","Off-duty cool"],
    office:       ["Boardroom ready","Sharp and clean","Power outfit","Professional edge"],
    party:        ["Night out energy","Bold evening","Stand-out style","Party ready"],
    "date night": ["Refined evening","Clean and confident","Subtle and sharp","Date night edge"],
    gym:          ["Active essentials","Workout mode","Athletic daily"],
    ethnic:       ["Traditional elegance","Cultural pride","Festive fit","Heritage look"],
  };
  const names = map[occasion] || ["Outfit suggestion"];
  return names[Math.floor(Math.random() * names.length)];
}

function parseCLIPLabel(clipLabel) {
  const label = (clipLabel || "").toLowerCase();
  const colorFound = Object.keys(COLOR_PROFILES).find(c => label.includes(c)) || null;
  const sorted = Object.keys(CLOTHING_ITEMS).sort((a,b) => b.length - a.length);
  const itemFound = sorted.find(item => label.includes(item)) || null;
  const patternFound = Object.keys(PATTERNS).find(p => label.includes(p)) || "solid";
  return { name: itemFound, color: colorFound, pattern: patternFound };
}

function suggestFromCLIP(clipLabels, occasion = "casual", weather = "mid") {
  const wardrobe = clipLabels.map(parseCLIPLabel).filter(i => i.name !== null);
  if (wardrobe.length === 0) return { error: "No recognizable clothing items found." };
  return suggestOutfits(wardrobe, occasion, weather);
}

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  COLOR_PROFILES, COLOR_HARMONY, COLOR_RULES,
  CLOTHING_ITEMS, PATTERNS, FIT_RULES,
  OCCASIONS, WEATHER,
  scoreColorPair, scoreOutfit, suggestOutfits,
  checkFormalityMatch, canMixPatterns,
  suggestAccessories, filterByWeather,
  parseCLIPLabel, suggestFromCLIP,
};

/*
// ── USAGE EXAMPLE ──────────────────────────────

const wardrobe = [
  { name: "t-shirt",        color: "white",   pattern: "solid" },
  { name: "shirt",          color: "sky blue", pattern: "solid" },
  { name: "polo shirt",     color: "navy",    pattern: "solid" },
  { name: "shorts",         color: "beige",   pattern: "solid" },
  { name: "chinos",         color: "khaki",   pattern: "solid" },
  { name: "white sneakers", color: "white",   pattern: "solid" },
  { name: "sandals",        color: "tan",     pattern: "solid" },
  // accessories — these go into suggestAccessories, not outfit combos
  { name: "watch",  color: "silver", pattern: "solid" },
  { name: "chain",  color: "silver", pattern: "solid" },
  { name: "rings",  color: "gold",   pattern: "solid" },
  // this jacket will be REMOVED by filterByWeather on hot days:
  { name: "jacket", color: "brown",  pattern: "solid" },
];

// HOT DAY, CASUAL — jacket won't appear, accessories only where relevant
const outfits = suggestOutfits(wardrobe, "casual", "hot");
outfits.forEach((o, i) => {
  console.log(`\nOutfit ${i+1}: ${o.score.outfitName} — ${o.score.totalScore}/10 (${o.score.grade})`);
  console.log("Items:", o.items.map(x => `${x.color} ${x.name}`).join(", "));
  console.log("Accessories:", o.accessories.join(" | ") || "none suggested");
});

// COLD DAY, OFFICE — jacket appears, no chain suggestion
const officeOutfits = suggestOutfits(wardrobe, "office", "cold");
*/
