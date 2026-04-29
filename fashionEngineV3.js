// ============================================================

const { OCCASION_VIBES: STYLING_OCCASION_VIBES } = require('./fashionStylingEngine');
//  fashionEngine.js — v3 — Professional Fashion Logic Engine
//  Built for startup-grade outfit intelligence.
//
//  Sections:
//   1.  Color Profiles
//   2.  Color Harmony & Rules
//   3.  Personal Color Analysis (Skin Tone + Undertone)
//   4.  Body Type & Proportion System
//   5.  Weather System
//   6.  Clothing Items (expanded)
//   7.  Fabric & Texture Rules
//   8.  Pattern Rules
//   9.  Occasions & Dress Codes
//  10.  Style Archetypes
//  11.  Layering Hierarchy
//  12.  Shoe Pairing Matrix
//  13.  Accessory & Metal Tone Rules
//  14.  Intentional Contrasts
//  15.  Indian / Cultural Fashion Context
//  16.  Scoring Engine
//  17.  Outfit Suggestion Engine (variety-enforced)
//  18.  Wardrobe Gap Analysis
//  19.  Capsule Versatility Scorer
//  20.  CLIP / Gemini Integration Helpers
// ============================================================


// SECTION 1: COLOR PROFILES

/**
 * Every color in the system.
 * family: color wheel family
 * temp: warm | cool | neutral
 * neutral: pairs with almost anything
 * lightness: light | mid | dark (affects contrast scoring)
 * saturation: low | mid | high
 */
const COLOR_PROFILES = {
  cream:          { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  ivory:          { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  "off-white":    { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  eggshell:       { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },

  // Grays
  "light gray":   { family:"neutral", temp:"cool",    neutral:true,  lightness:"light", saturation:"low"  },
  gray:           { family:"neutral", temp:"cool",    neutral:true,  lightness:"mid",   saturation:"low"  },
  "slate gray":   { family:"neutral", temp:"cool",    neutral:true,  lightness:"mid",   saturation:"low"  },
  charcoal:       { family:"neutral", temp:"cool",    neutral:true,  lightness:"dark",  saturation:"low"  },

  // Blacks
  black:          { family:"neutral", temp:"neutral", neutral:true,  lightness:"dark",  saturation:"low"  },
  "off-black":    { family:"neutral", temp:"neutral", neutral:true,  lightness:"dark",  saturation:"low"  },

  // Browns & Tans
  tan:            { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  beige:          { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  "light beige":  { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  khaki:          { family:"green",   temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  camel:          { family:"neutral", temp:"warm",    neutral:true,  lightness:"mid",   saturation:"low"  },
  taupe:          { family:"neutral", temp:"warm",    neutral:true,  lightness:"mid",   saturation:"low"  },
  brown:          { family:"neutral", temp:"warm",    neutral:true,  lightness:"mid",   saturation:"low"  },
  "dark brown":   { family:"neutral", temp:"warm",    neutral:true,  lightness:"dark",  saturation:"low"  },
  chocolate:      { family:"neutral", temp:"warm",    neutral:true,  lightness:"dark",  saturation:"low"  },
  "warm beige":   { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },

  // Navy (treated as neutral in fashion)
  navy:           { family:"blue",    temp:"cool",    neutral:true,  lightness:"dark",  saturation:"mid"  },
  "dark navy":    { family:"blue",    temp:"cool",    neutral:true,  lightness:"dark",  saturation:"mid"  },

  // Blues
  "light blue":   { family:"blue",    temp:"cool",    neutral:false, lightness:"light", saturation:"mid"  },
  "sky blue":     { family:"blue",    temp:"cool",    neutral:false, lightness:"light", saturation:"mid"  },
  "powder blue":  { family:"blue",    temp:"cool",    neutral:false, lightness:"light", saturation:"low"  },
  blue:           { family:"blue",    temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  cobalt:         { family:"blue",    temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  "royal blue":   { family:"blue",    temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  "steel blue":   { family:"blue",    temp:"cool",    neutral:false, lightness:"mid",   saturation:"mid"  },
  denim:          { family:"blue",    temp:"cool",    neutral:true,  lightness:"mid",   saturation:"mid"  },
  "dark denim":   { family:"blue",    temp:"cool",    neutral:true,  lightness:"dark",  saturation:"mid"  },
  teal:           { family:"blue",    temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  "dark teal":    { family:"blue",    temp:"cool",    neutral:false, lightness:"dark",  saturation:"high" },
  cerulean:       { family:"blue",    temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },

  // Greens
  mint:           { family:"green",   temp:"cool",    neutral:false, lightness:"light", saturation:"mid"  },
  sage:           { family:"green",   temp:"cool",    neutral:false, lightness:"light", saturation:"low"  },
  "light green":  { family:"green",   temp:"cool",    neutral:false, lightness:"light", saturation:"mid"  },
  "lime green":   { family:"green",   temp:"warm",    neutral:false, lightness:"light", saturation:"high" },
  green:          { family:"green",   temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  olive:          { family:"green",   temp:"warm",    neutral:true,  lightness:"mid",   saturation:"low"  },
  "army green":   { family:"green",   temp:"warm",    neutral:true,  lightness:"mid",   saturation:"low"  },
  "forest green": { family:"green",   temp:"cool",    neutral:false, lightness:"dark",  saturation:"mid"  },
  emerald:        { family:"green",   temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  "hunter green": { family:"green",   temp:"cool",    neutral:false, lightness:"dark",  saturation:"mid"  },
  "bottle green": { family:"green",   temp:"cool",    neutral:false, lightness:"dark",  saturation:"mid"  },

  // Reds
  "light red":    { family:"red",     temp:"warm",    neutral:false, lightness:"light", saturation:"high" },
  pink:           { family:"pink",    temp:"warm",    neutral:false, lightness:"light", saturation:"mid"  },
  blush:          { family:"pink",    temp:"warm",    neutral:false, lightness:"light", saturation:"low"  },
  "baby pink":    { family:"pink",    temp:"warm",    neutral:false, lightness:"light", saturation:"low"  },
  rose:           { family:"pink",    temp:"warm",    neutral:false, lightness:"light", saturation:"mid"  },
  "dusty rose":   { family:"pink",    temp:"warm",    neutral:false, lightness:"light", saturation:"low"  },
  "hot pink":     { family:"pink",    temp:"warm",    neutral:false, lightness:"mid",   saturation:"high" },
  fuchsia:        { family:"pink",    temp:"warm",    neutral:false, lightness:"mid",   saturation:"high" },
  coral:          { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"high" },
  red:            { family:"red",     temp:"warm",    neutral:false, lightness:"mid",   saturation:"high" },
  crimson:        { family:"red",     temp:"warm",    neutral:false, lightness:"dark",  saturation:"high" },
  "dark red":     { family:"red",     temp:"warm",    neutral:false, lightness:"dark",  saturation:"high" },
  maroon:         { family:"red",     temp:"warm",    neutral:false, lightness:"dark",  saturation:"mid"  },
  burgundy:       { family:"red",     temp:"warm",    neutral:false, lightness:"dark",  saturation:"mid"  },
  wine:           { family:"red",     temp:"warm",    neutral:false, lightness:"dark",  saturation:"mid"  },
  mauve:          { family:"pink",    temp:"warm",    neutral:false, lightness:"mid",   saturation:"low"  },

  // Oranges & Yellows
  peach:          { family:"orange",  temp:"warm",    neutral:false, lightness:"light", saturation:"mid"  },
  apricot:        { family:"orange",  temp:"warm",    neutral:false, lightness:"light", saturation:"mid"  },
  yellow:         { family:"yellow",  temp:"warm",    neutral:false, lightness:"light", saturation:"high" },
  "pale yellow":  { family:"yellow",  temp:"warm",    neutral:false, lightness:"light", saturation:"low"  },
  cream:          { family:"neutral", temp:"warm",    neutral:true,  lightness:"light", saturation:"low"  },
  "lemon yellow": { family:"yellow",  temp:"warm",    neutral:false, lightness:"light", saturation:"high" },
  mustard:        { family:"yellow",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"mid"  },
  gold:           { family:"yellow",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"mid"  },
  amber:          { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"high" },
  orange:         { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"high" },
  "burnt orange": { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"mid"  },
  rust:           { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"mid"  },
  terracotta:     { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"mid"  },
  "burnt sienna": { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"mid"  },

  // Purples
  lavender:       { family:"purple",  temp:"cool",    neutral:false, lightness:"light", saturation:"low"  },
  lilac:          { family:"purple",  temp:"cool",    neutral:false, lightness:"light", saturation:"low"  },
  "pale purple":  { family:"purple",  temp:"cool",    neutral:false, lightness:"light", saturation:"low"  },
  "periwinkle":   { family:"purple",  temp:"cool",    neutral:false, lightness:"light", saturation:"mid"  },
  purple:         { family:"purple",  temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  violet:         { family:"purple",  temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  "royal purple": { family:"purple",  temp:"cool",    neutral:false, lightness:"mid",   saturation:"high" },
  plum:           { family:"purple",  temp:"cool",    neutral:false, lightness:"dark",  saturation:"mid"  },
  eggplant:       { family:"purple",  temp:"cool",    neutral:false, lightness:"dark",  saturation:"mid"  },
  indigo:         { family:"purple",  temp:"cool",    neutral:false, lightness:"dark",  saturation:"high" },

  // Metallics
  silver:         { family:"neutral", temp:"cool",    neutral:true,  lightness:"light", saturation:"low"  },
  "rose gold":    { family:"pink",    temp:"warm",    neutral:false, lightness:"light", saturation:"low"  },
  golden:         { family:"yellow",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"low"  },
  bronze:         { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"low"  },
  copper:         { family:"orange",  temp:"warm",    neutral:false, lightness:"mid",   saturation:"mid"  },
};


// ─────────────────────────────────────────────
// SECTION 2: COLOR HARMONY & RULES
// ─────────────────────────────────────────────

const COLOR_HARMONY = {
  complementary: [
    ["blue","orange"],["red","green"],["yellow","purple"],
    ["pink","green"],["navy","orange"],["navy","mustard"],
    ["teal","coral"],["blue","rust"],["purple","yellow"],
    ["emerald","burgundy"],["cobalt","amber"],
  ],
  analogous: [
    ["blue","green"],["blue","purple"],["red","orange"],["red","pink"],
    ["yellow","orange"],["yellow","green"],["purple","pink"],
    ["teal","green"],["teal","blue"],["coral","orange"],
    ["burgundy","maroon"],["navy","teal"],
  ],
  splitComplementary: [
    // One color + two colors adjacent to its complement — less tension than pure complementary
    ["blue","coral","peach"],["red","teal","mint"],
    ["yellow","violet","indigo"],["orange","blue","teal"],
  ],
  triadic: [
    ["red","yellow","blue"],["orange","green","purple"],
    ["pink","teal","mustard"],["rust","sage","periwinkle"],
  ],
  tetradic: [
    // Four colors — two complementary pairs. Very bold.
    ["red","green","blue","orange"],["purple","yellow","teal","coral"],
  ],
};

const COLOR_RULES = {
  alwaysWorks: [
    // Navy pairs
    ["navy","white"],["navy","gray"],["navy","beige"],["navy","camel"],
    ["navy","burgundy"],["navy","light blue"],["navy","mustard"],
    ["navy","cream"],["navy","tan"],["navy","charcoal"],["navy","coral"],
    ["navy","rust"],["navy","olive"],["navy","red"],["navy","gold"],
    // Black pairs
    ["black","white"],["black","gray"],["black","beige"],["black","camel"],
    ["black","navy"],["black","red"],["black","pink"],["black","gold"],
    ["black","silver"],["black","burgundy"],["black","cream"],
    ["black","olive"],["black","mustard"],["black","teal"],["black","cobalt"],
    // Gray pairs
    ["gray","white"],["gray","navy"],["gray","blue"],["gray","pink"],
    ["gray","burgundy"],["gray","mustard"],["gray","teal"],["gray","lavender"],
    ["gray","red"],["gray","coral"],["gray","olive"],
    // White pairs
    ["white","beige"],["white","tan"],["white","camel"],["white","blue"],
    ["white","olive"],["white","coral"],["white","teal"],["white","burgundy"],
    ["white","red"],["white","navy"],["white","mustard"],["white","sage"],
    ["white","terracotta"],["white","emerald"],
    // Beige/camel/tan pairs
    ["beige","brown"],["beige","camel"],["beige","navy"],["beige","teal"],
    ["beige","olive"],["beige","rust"],["beige","terracotta"],
    ["camel","white"],["camel","black"],["camel","burgundy"],["camel","navy"],
    ["camel","teal"],["camel","rust"],["camel","brown"],
    // Earth tone cluster
    ["olive","beige"],["olive","white"],["olive","camel"],["olive","rust"],
    ["olive","mustard"],["olive","brown"],["olive","terracotta"],
    ["rust","cream"],["rust","navy"],["rust","teal"],["rust","olive"],
    ["rust","charcoal"],["rust","brown"],
    ["terracotta","beige"],["terracotta","white"],["terracotta","navy"],
    ["terracotta","teal"],["terracotta","olive"],
    // Classic pairs
    ["burgundy","camel"],["burgundy","navy"],["burgundy","gray"],
    ["burgundy","cream"],["burgundy","olive"],["burgundy","gold"],
    ["mustard","navy"],["mustard","gray"],["mustard","brown"],
    ["mustard","charcoal"],["mustard","teal"],["mustard","burgundy"],
    // Denim (treated as neutral)
    ["denim","white"],["denim","gray"],["denim","black"],["denim","beige"],
    ["denim","camel"],["denim","red"],["denim","pink"],["denim","olive"],
    // Pastels
    ["blush","gray"],["blush","navy"],["blush","camel"],["blush","sage"],
    ["lavender","gray"],["lavender","white"],["lavender","navy"],
    ["sage","white"],["sage","beige"],["sage","camel"],["sage","navy"],
    ["mint","white"],["mint","navy"],["mint","coral"],
    // Charcoal
    ["charcoal","white"],["charcoal","navy"],["charcoal","burgundy"],
    ["charcoal","camel"],["charcoal","mustard"],["charcoal","teal"],
    // Teal
    ["teal","white"],["teal","navy"],["teal","coral"],["teal","mustard"],
    ["teal","camel"],["teal","charcoal"],["teal","rust"],
  ],
  avoid: [
    ["red","orange"],["red","pink"],       // too close, no contrast
    ["brown","black"],                      // looks like a mistake
    ["navy","black"],                       // too similar, unintentional
    ["green","red"],                        // too Christmas
    ["purple","orange"],                    // harsh
    ["yellow","red"],                       // fast-food effect
    ["pink","orange"],                      // clashes
    ["blue","brown"],                       // muddy
    ["lime green","red"],                   // harsh
    ["lime green","pink"],                  // clashes
    ["yellow","white"],                     // disappears
    ["beige","cream"],                      // too similar, looks faded
    ["tan","beige"],                        // same — no contrast
  ],
  // Prints should mostly go with solids from its own color family
  printWithSolidRule: "When wearing a patterned item, the solid should pick up one color from the pattern.",
};


// ─────────────────────────────────────────────
// SECTION 3: PERSONAL COLOR ANALYSIS
// ─────────────────────────────────────────────

/**
 * Personal Color Analysis (PCA) — the 4-season system extended to 12 types.
 * This tells you which colors suit YOUR specific complexion, not just
 * which colors go together in the abstract.
 *
 * Usage: pass user's skinTone and undertone into getRecommendedColors()
 *
 * undertone: warm | cool | neutral
 * depth: fair | light | medium | tan | deep | rich
 */
const PERSONAL_COLOR_SEASONS = {
  // SPRING types — warm undertone, lighter/brighter depth
  "light spring":    {
    undertone: "warm", depth: ["fair","light"],
    bestColors: ["peach","coral","warm beige","camel","ivory","light blue","mint","sage","yellow","rose","gold"],
    avoidColors: ["black","navy","charcoal","burgundy","plum","silver"],
    tip: "Light, warm, clear colors. Pastels with warmth — peachy pinks over cool pinks.",
  },
  "true spring":     {
    undertone: "warm", depth: ["light","medium"],
    bestColors: ["coral","peach","orange","yellow","camel","warm beige","teal","green","red","blue"],
    avoidColors: ["black","silver","dusty rose","lavender","plum"],
    tip: "Clear, warm, fresh colors. You can wear bright warm tones beautifully.",
  },
  "bright spring":   {
    undertone: "warm", depth: ["light","medium"],
    bestColors: ["coral","hot pink","yellow","cobalt","emerald","red","white","camel","turquoise"],
    avoidColors: ["dusty rose","olive","taupe","charcoal","muted tones"],
    tip: "High-contrast, clear, vibrant colors. You suit bright and fresh over muted.",
  },

  // SUMMER types — cool undertone, softer/muted
  "light summer":    {
    undertone: "cool", depth: ["fair","light"],
    bestColors: ["powder blue","lavender","blush","rose","sage","dusty rose","periwinkle","mauve","gray","ivory"],
    avoidColors: ["orange","camel","yellow","olive","rust","bright red"],
    tip: "Soft, cool, light colors. Muted pastels rather than vivid ones.",
  },
  "true summer":     {
    undertone: "cool", depth: ["light","medium"],
    bestColors: ["powder blue","lavender","mauve","dusty rose","teal","slate gray","navy","sage","periwinkle"],
    avoidColors: ["orange","camel","mustard","rust","warm browns","bright yellow"],
    tip: "Cool, muted, medium-depth colors. Avoid anything warm or vivid.",
  },
  "soft summer":     {
    undertone: "neutral", depth: ["medium","tan"],
    bestColors: ["mauve","dusty rose","sage","teal","slate gray","navy","taupe","lavender","muted teal"],
    avoidColors: ["bright orange","yellow","hot pink","lime green","vivid colors"],
    tip: "Muted, soft, blended colors. Avoid high contrast and vivid saturated colors.",
  },

  // AUTUMN types — warm undertone, deeper/muted
  "soft autumn":     {
    undertone: "warm", depth: ["medium","tan"],
    bestColors: ["olive","camel","rust","terracotta","sage","brown","warm beige","mustard","teal"],
    avoidColors: ["black","silver","navy","bright pink","cool colors"],
    tip: "Muted, warm, earthy colors. Earth tones are your power palette.",
  },
  "true autumn":     {
    undertone: "warm", depth: ["medium","tan","deep"],
    bestColors: ["rust","terracotta","olive","camel","brown","mustard","burgundy","forest green","warm beige","gold"],
    avoidColors: ["silver","navy","cool pink","lavender","gray"],
    tip: "Rich, warm, earthy tones. Autumn's full palette — spice colors are your best.",
  },
  "deep autumn":     {
    undertone: "warm", depth: ["deep","rich"],
    bestColors: ["dark brown","burgundy","forest green","rust","olive","camel","gold","warm beige","terracotta"],
    avoidColors: ["silver","navy","pastels","cool tones","light gray"],
    tip: "Deep, warm, rich colors. Dark earthy tones with gold accents are perfect.",
  },

  // WINTER types — cool undertone, deeper/more contrast
  "dark winter":     {
    undertone: "cool", depth: ["deep","rich"],
    bestColors: ["black","navy","charcoal","burgundy","emerald","royal blue","plum","silver","white","teal"],
    avoidColors: ["camel","orange","warm brown","mustard","gold"],
    tip: "Deep, cool, high-contrast colors. Your best looks are dramatic and rich.",
  },
  "true winter":     {
    undertone: "cool", depth: ["medium","deep"],
    bestColors: ["black","white","navy","red","royal blue","emerald","plum","silver","hot pink","cobalt"],
    avoidColors: ["camel","peach","warm brown","mustard","olive","rust"],
    tip: "Cool, clear, high-contrast colors. You suit black-and-white better than anyone.",
  },
  "bright winter":   {
    undertone: "cool", depth: ["medium","deep"],
    bestColors: ["cobalt","hot pink","emerald","black","white","royal purple","teal","royal blue","red"],
    avoidColors: ["camel","dusty rose","sage","muted colors","warm browns"],
    tip: "Clear, cool, vivid colors. High contrast and bright — you wear bold color fearlessly.",
  },
};

/**
 * Map a user's undertone + skin depth to their likely color season.
 * This is a heuristic — professional PCA is done in person under natural light.
 *
 * @param {"warm"|"cool"|"neutral"} undertone
 * @param {"fair"|"light"|"medium"|"tan"|"deep"|"rich"} depth
 * @returns {string} season key
 */
function detectColorSeason(undertone, depth) {
  if (undertone === "warm") {
    if (["fair","light"].includes(depth))          return "light spring";
    if (depth === "medium")                         return "true autumn";
    if (["deep","rich","tan"].includes(depth))      return "deep autumn";
  }
  if (undertone === "cool") {
    if (["fair","light"].includes(depth))          return "light summer";
    if (depth === "medium")                         return "true winter";
    if (["deep","rich"].includes(depth))            return "dark winter";
  }
  if (undertone === "neutral") {
    if (["fair","light"].includes(depth))          return "soft summer";
    if (depth === "medium")                         return "soft autumn";
    if (["deep","rich","tan"].includes(depth))      return "true autumn";
  }
  return "true spring"; // default fallback
}

/**
 * Given a color, check if it suits the user's season.
 * Returns a score penalty/bonus.
 */
function scoreColorForSeason(color, season) {
  const profile = PERSONAL_COLOR_SEASONS[season];
  if (!profile) return 0;
  if (profile.bestColors.includes(color))  return +2;
  if (profile.avoidColors.includes(color)) return -3;
  return 0;
}


// ─────────────────────────────────────────────
// SECTION 4: BODY TYPE & PROPORTION SYSTEM
// ─────────────────────────────────────────────

/**
 * Body types and which silhouettes, cuts, and proportions
 * work best for each.
 *
 * This is about PROPORTION, not size.
 * The goal is always to create a balanced silhouette.
 */
const BODY_TYPES = {
  // Classic types
  hourglass: {
    description: "Balanced shoulders and hips, defined waist",
    goal: "Highlight the waist",
    bestSilhouettes: ["fitted","wrap","belted","tailored"],
    avoidSilhouettes: ["boxy","oversized","shapeless"],
    bestCuts: {
      tops:    ["fitted tee","wrap blouse","tucked shirt","bodysuit"],
      bottoms: ["high-waist jeans","pencil skirt","straight leg","flare jeans"],
      dresses: ["wrap dress","bodycon","fit-and-flare"],
      layers:  ["belted blazer","fitted jacket","longline trench"],
    },
    tip: "Your proportions are already balanced — fitted pieces highlight this naturally. Always define the waist.",
  },
  pear: {
    description: "Narrower shoulders, wider hips",
    goal: "Balance lower half with visual weight on top",
    bestSilhouettes: ["A-line","wide shoulder","structured top"],
    avoidSilhouettes: ["tapered at hip","skinny jeans alone","tight bottoms"],
    bestCuts: {
      tops:    ["boat neck","off-shoulder","structured blazer","puff sleeve","horizontal stripe"],
      bottoms: ["A-line skirt","flare jeans","wide-leg trousers","dark wash jeans"],
      dresses: ["A-line","fit-and-flare","empire waist"],
      layers:  ["cropped jacket","structured blazer","bolero"],
    },
    tip: "Draw eyes upward with details, structure, and color on top. Flare or A-line on bottom balances hips.",
  },
  apple: {
    description: "Fuller midsection, slimmer legs",
    goal: "Define waist or skim the midsection",
    bestSilhouettes: ["empire waist","V-neck","wrap","longline"],
    avoidSilhouettes: ["cropped tops","tight-waisted","wide belts"],
    bestCuts: {
      tops:    ["V-neck tee","empire blouse","wrap top","tunic"],
      bottoms: ["straight leg","slim fit trousers","dark wash jeans"],
      dresses: ["empire waist","wrap dress","A-line"],
      layers:  ["open blazer","longline cardigan","duster coat"],
    },
    tip: "V-necks create vertical line. Open-front layers elongate. Avoid anything that cinches tightly at the widest point.",
  },
  rectangle: {
    description: "Shoulders and hips roughly equal, less defined waist",
    goal: "Create curves and waist definition",
    bestSilhouettes: ["belted","ruffled","layered","defined waist"],
    avoidSilhouettes: ["straight column","shapeless shifts"],
    bestCuts: {
      tops:    ["crop top","peplum","ruffle detail","tied front","tucked-in shirt"],
      bottoms: ["high-waist","flared","pleated trousers","wide leg"],
      dresses: ["belted dress","wrap dress","peplum"],
      layers:  ["belted coat","structured blazer","cropped jacket"],
    },
    tip: "Create the illusion of curves with belting, ruffles, and volume. High-waist bottoms are your best friend.",
  },
  "inverted triangle": {
    description: "Broader shoulders, narrower hips",
    goal: "Balance top with volume on bottom",
    bestSilhouettes: ["A-line","wide leg","flared","V-neck"],
    avoidSilhouettes: ["boat neck","cap sleeves","horizontal stripe on shoulders"],
    bestCuts: {
      tops:    ["V-neck","halter","scoop neck","wrap top","soft shoulder"],
      bottoms: ["wide leg trousers","pleated pants","A-line skirt","flared jeans","cargo pants"],
      dresses: ["A-line","fit-and-flare","wrap"],
      layers:  ["longline blazer","duster","open-front cardigan"],
    },
    tip: "Add volume below the waist to balance broad shoulders. V-necks narrow the appearance of shoulders.",
  },
  // Height-based considerations
  petite: {
    description: "Under 5'4\" / 163cm",
    goal: "Elongate the silhouette",
    tips: [
      "Monochromatic outfits (one color top to bottom) elongate visually.",
      "High-waist bottoms lengthen legs.",
      "Avoid ankle-strap shoes — they cut the leg.",
      "Avoid oversized or cropped below the natural waist.",
      "Vertical stripes and long lapels elongate.",
      "Avoid large prints — they overwhelm a smaller frame.",
    ],
    printScale: "small",
  },
  tall: {
    description: "Over 5'9\" / 175cm",
    goal: "Proportional balance — you can wear almost anything",
    tips: [
      "Horizontal stripes and bold prints work well.",
      "High-waist isn't necessary — you have the height.",
      "Maxi lengths, longline coats, and wide legs all work on you.",
    ],
    printScale: "large",
  },
  average: {
    description: "5'4\"–5'8\" / 163–172cm",
    goal: "Versatile — most cuts work",
    tips: [
      "No major restrictions. Experiment with proportion freely.",
      "High-waist bottoms are universally flattering.",
    ],
    printScale: "medium",
  },
};

/**
 * Check if a clothing item suits a given body type.
 * Returns a score modifier.
 */
function scoreItemForBodyType(itemName, bodyType) {
  if (!bodyType || !BODY_TYPES[bodyType]) return 0;
  // Simplified scoring — in production, expand per item
  const bt = BODY_TYPES[bodyType];
  const avoid = bt.avoidSilhouettes || [];
  // Check if item name contains any avoid keywords
  const hasAvoidedFeature = avoid.some(s => itemName.toLowerCase().includes(s.toLowerCase()));
  if (hasAvoidedFeature) return -2;
  return 0;
}


// ─────────────────────────────────────────────
// SECTION 5: WEATHER SYSTEM
// ─────────────────────────────────────────────

const WEATHER = {
  hot: {
    label: "Hot (30°C+)",
    bannedCategories: ["outerwear"],
    bannedItems: [
      "jacket","blazer","suit jacket","leather jacket","bomber jacket",
      "trench coat","overcoat","parka","cardigan","hoodie","sweatshirt",
      "sweater","turtleneck","vest","nehru jacket","sherwani",
    ],
    preferredFabrics: ["linen","cotton","chambray","jersey","rayon","bamboo"],
    colorBias: ["white","cream","beige","sky blue","mint","peach","coral","light blue","sage","ivory"],
    heavyColorPenalty: ["black","charcoal","dark brown","maroon","burgundy","wine","plum","dark navy"],
    layerRequired: false,
    tip: "Light fabrics only. White and light colors reflect heat. Avoid dark colors — they absorb heat significantly.",
  },
  mid: {
    label: "Mild (15–29°C)",
    bannedCategories: [],
    bannedItems: ["parka","sweatpants"],
    preferredFabrics: ["cotton","denim","light wool","jersey","linen","chino"],
    colorBias: [],
    heavyColorPenalty: [],
    layerRequired: false,
    tip: "Most versatile weather. A light layer gives you flexibility as temperature shifts throughout the day.",
  },
  cold: {
    label: "Cold (below 15°C)",
    bannedCategories: [],
    bannedItems: ["shorts","tank top","sandals","flip flops","slides","crop top"],
    preferredFabrics: ["wool","cashmere","flannel","leather","fleece","denim","velvet","corduroy"],
    colorBias: ["navy","charcoal","black","burgundy","camel","dark red","forest green","plum","wine"],
    heavyColorPenalty: [],
    layerRequired: true,
    tip: "Layer intelligently: thermal base + mid layer + outer layer. Texture contrast makes cold-weather outfits visually rich.",
  },
};


// ─────────────────────────────────────────────
// SECTION 6: CLOTHING ITEMS (comprehensive)
// ─────────────────────────────────────────────

/**
 * formality: 1 (most casual) → 5 (most formal)
 * role: top | bottom | layer | shoes | accessory | full (dress/jumpsuit)
 * weatherOk: ["hot","mid","cold"]
 * fabricWeight: light | medium | heavy
 */
const CLOTHING_ITEMS = {
  // ── TOPS ──────────────────────────────
  "t-shirt":            { formality:1, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","gym","party"] },
  "graphic tee":        { formality:1, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","gym"] },
  "oversized tee":      { formality:1, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","gym"] },
  "polo shirt":         { formality:2, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night"] },
  "henley":             { formality:2, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "shirt":              { formality:3, role:"top",      category:"top",      weatherOk:["hot","mid","cold"],fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "linen shirt":        { formality:2, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","date night"] },
  "flannel shirt":      { formality:2, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "dress shirt":        { formality:4, role:"top",      category:"top",      weatherOk:["hot","mid","cold"],fabricWeight:"light",  occasionOk:["office","business formal","wedding guest","date night","party"] },
  "oxford shirt":       { formality:3, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "blouse":             { formality:3, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "silk blouse":        { formality:4, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["office","business formal","date night","party","wedding guest"] },
  "tank top":           { formality:1, role:"top",      category:"top",      weatherOk:["hot"],             fabricWeight:"light",  occasionOk:["casual","gym","party"] },
  "crop top":           { formality:1, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","gym","party"] },
  "bodysuit":           { formality:2, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","date night"] },
  "sweater":            { formality:2, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","office","party","date night"] },
  "chunky knit":        { formality:1, role:"top",      category:"top",      weatherOk:["cold"],            fabricWeight:"heavy",  occasionOk:["casual","party","gym"] },
  "ribbed knit":        { formality:2, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "turtleneck":         { formality:3, role:"top",      category:"top",      weatherOk:["cold"],            fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "mock neck":          { formality:2, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "hoodie":             { formality:1, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","gym","party"] },
  "zip hoodie":         { formality:1, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","gym","party"] },
  "sweatshirt":         { formality:1, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","gym","party"] },
  "peplum top":         { formality:3, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "wrap top":           { formality:3, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  // Indian tops
  "kurta":              { formality:3, role:"top",      category:"top",      weatherOk:["hot","mid","cold"],fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "kurti":              { formality:3, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "sherwani":           { formality:5, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "bandhgala":          { formality:5, role:"top",      category:"top",      weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "pathani suit top":   { formality:3, role:"top",      category:"top",      weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },

  // ── BOTTOMS ────────────────────────────
  "jeans":              { formality:2, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "slim jeans":         { formality:2, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "straight jeans":     { formality:2, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "wide leg jeans":     { formality:2, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "bootcut jeans":      { formality:2, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "flare jeans":        { formality:2, role:"bottom",   category:"bottom",   weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "ripped jeans":       { formality:1, role:"bottom",   category:"bottom",   weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","party","gym"] },
  "chinos":             { formality:3, role:"bottom",   category:"bottom",   weatherOk:["hot","mid","cold"],fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "linen trousers":     { formality:3, role:"bottom",   category:"bottom",   weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "trousers":           { formality:4, role:"bottom",   category:"bottom",   weatherOk:["hot","mid","cold"],fabricWeight:"medium", occasionOk:["office","business formal","date night","party","wedding guest","casual"] },
  "wide leg trousers":  { formality:4, role:"bottom",   category:"bottom",   weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["office","party","date night","wedding guest","casual"] },
  "dress trousers":     { formality:5, role:"bottom",   category:"bottom",   weatherOk:["hot","mid","cold"],      fabricWeight:"medium", occasionOk:["office","business formal","wedding guest","date night"] },
  "pleated trousers":   { formality:4, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["office","business formal","date night","party","wedding guest"] },
  "shorts":             { formality:1, role:"bottom",   category:"bottom",   weatherOk:["hot"],             fabricWeight:"light",  occasionOk:["casual","gym"] },
  "cargo shorts":       { formality:1, role:"bottom",   category:"bottom",   weatherOk:["hot"],             fabricWeight:"light",  occasionOk:["casual","gym"] },
  "cargo pants":        { formality:1, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party"] },
  "joggers":            { formality:1, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","gym"] },
  "sweatpants":         { formality:1, role:"bottom",   category:"bottom",   weatherOk:["cold"],            fabricWeight:"heavy",  occasionOk:["casual","gym"] },
  "track pants":        { formality:1, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","gym"] },
  "skirt":              { formality:3, role:"bottom",   category:"bottom",   weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "mini skirt":         { formality:2, role:"bottom",   category:"bottom",   weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","date night"] },
  "midi skirt":         { formality:3, role:"bottom",   category:"bottom",   weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "maxi skirt":         { formality:3, role:"bottom",   category:"bottom",   weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "pencil skirt":       { formality:4, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["office","business formal","date night","party"] },
  "pleated skirt":      { formality:3, role:"bottom",   category:"bottom",   weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "leggings":           { formality:1, role:"bottom",   category:"bottom",   weatherOk:["mid","cold"],      fabricWeight:"light",  occasionOk:["casual","gym"] },
  "thermal leggings":   { formality:1, role:"bottom",   category:"bottom",   weatherOk:["cold"],            fabricWeight:"medium", occasionOk:["gym","casual"] },
  // Indian bottoms
  "dhoti":              { formality:3, role:"bottom",   category:"bottom",   weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "churidar":           { formality:4, role:"bottom",   category:"bottom",   weatherOk:["hot","mid","cold"],      fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "salwar":             { formality:3, role:"bottom",   category:"bottom",   weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },

  // ── FULL OUTFITS ────────────────────────
  "dress":              { formality:3, role:"full",     category:"full",     weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "mini dress":         { formality:2, role:"full",     category:"full",     weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","date night"] },
  "midi dress":         { formality:3, role:"full",     category:"full",     weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "maxi dress":         { formality:3, role:"full",     category:"full",     weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "formal dress":       { formality:5, role:"full",     category:"full",     weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["business formal","wedding guest","date night","party"] },
  "jumpsuit":           { formality:3, role:"full",     category:"full",     weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "formal jumpsuit":    { formality:4, role:"full",     category:"full",     weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["office","business formal","date night","party","wedding guest"] },
  "co-ord set":         { formality:2, role:"full",     category:"full",     weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","date night"] },
  "suit":               { formality:5, role:"full",     category:"full",     weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["business formal","wedding guest","office"] },

  // ── OUTERWEAR / LAYERS ──────────────────
  "jacket":             { formality:2, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "blazer":             { formality:4, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["office","business formal","date night","party","wedding guest","casual"] },
  "oversized blazer":   { formality:3, role:"layer",    category:"outerwear",weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "suit jacket":        { formality:5, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["office","business formal","wedding guest"] },
  "denim jacket":       { formality:2, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "leather jacket":     { formality:2, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["casual","party","date night"] },
  "faux leather jacket":{ formality:2, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "bomber jacket":      { formality:2, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","party","date night"] },
  "varsity jacket":     { formality:1, role:"layer",    category:"outerwear",weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","party","gym"] },
  "windbreaker":        { formality:1, role:"layer",    category:"outerwear",weatherOk:["mid"],             fabricWeight:"light",  occasionOk:["casual","gym","party"] },
  "trench coat":        { formality:4, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["office","business formal","date night","party","wedding guest"] },
  "overcoat":           { formality:4, role:"layer",    category:"outerwear",weatherOk:["cold"],            fabricWeight:"heavy",  occasionOk:["office","business formal","date night","party","wedding guest"] },
  "wool coat":          { formality:4, role:"layer",    category:"outerwear",weatherOk:["cold"],            fabricWeight:"heavy",  occasionOk:["office","business formal","date night","party","wedding guest"] },
  "parka":              { formality:1, role:"layer",    category:"outerwear",weatherOk:["cold"],            fabricWeight:"heavy",  occasionOk:["casual","gym","party"] },
  "puffer jacket":      { formality:1, role:"layer",    category:"outerwear",weatherOk:["cold"],            fabricWeight:"heavy",  occasionOk:["casual","gym","party"] },
  "cardigan":           { formality:2, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","office","party","date night"] },
  "longline cardigan":  { formality:2, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","office","party","date night"] },
  "vest":               { formality:3, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "denim vest":         { formality:1, role:"layer",    category:"outerwear",weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","party","gym"] },
  // Indian outerwear
  "nehru jacket":       { formality:4, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "bandhgala jacket":   { formality:5, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "achkan":             { formality:5, role:"layer",    category:"outerwear",weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },

  // ── SHOES ───────────────────────────────
  "sneakers":           { formality:1, role:"shoes",    category:"footwear", weatherOk:["hot","mid","cold"],fabricWeight:"medium", occasionOk:["casual","gym","party","date night"] },
  "white sneakers":     { formality:2, role:"shoes",    category:"footwear", weatherOk:["hot","mid","cold"],fabricWeight:"medium", occasionOk:["casual","gym","party","date night"] },
  "chunky sneakers":    { formality:1, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"heavy",  occasionOk:["casual","gym","party","date night"] },
  "low top sneakers":   { formality:2, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","gym","party","date night"] },
  "high top sneakers":  { formality:1, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","gym","party","date night"] },
  "loafers":            { formality:3, role:"shoes",    category:"footwear", weatherOk:["hot","mid","cold"],fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "penny loafers":      { formality:3, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "oxford shoes":       { formality:5, role:"shoes",    category:"footwear", weatherOk:["hot","mid","cold"],      fabricWeight:"heavy",  occasionOk:["office","business formal","wedding guest","date night"] },
  "derby shoes":        { formality:4, role:"shoes",    category:"footwear", weatherOk:["hot","mid","cold"],      fabricWeight:"heavy",  occasionOk:["office","business formal","wedding guest","date night"] },
  "brogues":            { formality:3, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "monk straps":        { formality:4, role:"shoes",    category:"footwear", weatherOk:["hot","mid","cold"],      fabricWeight:"heavy",  occasionOk:["office","business formal","wedding guest","date night"] },
  "chelsea boots":      { formality:3, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "ankle boots":        { formality:3, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "combat boots":       { formality:1, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["casual","party","gym"] },
  "boots":              { formality:2, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"heavy",  occasionOk:["casual","party","date night"] },
  "knee-high boots":    { formality:3, role:"shoes",    category:"footwear", weatherOk:["cold"],            fabricWeight:"heavy",  occasionOk:["casual","office","party","date night","wedding guest"] },
  "sandals":            { formality:1, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party"] },
  "leather sandals":    { formality:2, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["casual","party","date night"] },
  "slides":             { formality:1, role:"shoes",    category:"footwear", weatherOk:["hot"],             fabricWeight:"light",  occasionOk:["casual"] },
  "heels":              { formality:4, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"medium", occasionOk:["office","business formal","date night","party","wedding guest"] },
  "stilettos":          { formality:5, role:"shoes",    category:"footwear", weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["business formal","wedding guest","date night","party"] },
  "block heels":        { formality:3, role:"shoes",    category:"footwear", weatherOk:["mid"],             fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "kitten heels":       { formality:4, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["office","business formal","date night","party","wedding guest"] },
  "mules":              { formality:3, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"medium", occasionOk:["casual","office","party","date night","wedding guest"] },
  "espadrilles":        { formality:2, role:"shoes",    category:"footwear", weatherOk:["hot"],             fabricWeight:"light",  occasionOk:["casual","party","date night"] },
  "flip flops":         { formality:1, role:"shoes",    category:"footwear", weatherOk:["hot"],             fabricWeight:"light",  occasionOk:["casual"] },
  "running shoes":      { formality:1, role:"shoes",    category:"footwear", weatherOk:["hot","mid","cold"],fabricWeight:"medium", occasionOk:["casual","gym"] },
  // Indian shoes
  "kolhapuri":          { formality:2, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "mojari":             { formality:4, role:"shoes",    category:"footwear", weatherOk:["mid","cold"],      fabricWeight:"medium", occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "jutti":              { formality:3, role:"shoes",    category:"footwear", weatherOk:["hot","mid"],       fabricWeight:"light",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },

  // ── ACCESSORIES ─────────────────────────
  // Never forced — only suggested via suggestAccessories()
  "belt":               { formality:3, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","office","business formal","party","date night","wedding guest"] },
  "leather belt":       { formality:3, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","office","business formal","party","date night","wedding guest"] },
  "watch":              { formality:3, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","office","business formal","party","date night","wedding guest","gym"] },
  "silver watch":       { formality:3, role:"accessory", category:"accessory", metalTone:"silver",occasionOk:["casual","office","business formal","party","date night","wedding guest"] },
  "gold watch":         { formality:3, role:"accessory", category:"accessory", metalTone:"gold",  occasionOk:["casual","office","business formal","party","date night","wedding guest"] },
  "ring":               { formality:2, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","party","date night","wedding guest","office"] },
  "rings":              { formality:2, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","party","date night","wedding guest","office"] },
  "silver ring":        { formality:2, role:"accessory", category:"accessory", metalTone:"silver",occasionOk:["casual","party","date night","wedding guest","office"] },
  "gold ring":          { formality:2, role:"accessory", category:"accessory", metalTone:"gold",  occasionOk:["casual","party","date night","wedding guest","office"] },
  "chain":              { formality:2, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","party","date night"] },
  "chains":             { formality:2, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","party","date night"] },
  "silver chain":       { formality:2, role:"accessory", category:"accessory", metalTone:"silver",occasionOk:["casual","party","date night"] },
  "gold chain":         { formality:2, role:"accessory", category:"accessory", metalTone:"gold",  occasionOk:["casual","party","date night","ethnic","wedding guest"] },
  "necklace":           { formality:3, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","office","party","date night","wedding guest"] },
  "bracelet":           { formality:2, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","party","date night"] },
  "earrings":           { formality:3, role:"accessory", category:"accessory", metalTone:"mixed", occasionOk:["casual","office","party","date night","wedding guest","ethnic","festival"] },
  "sunglasses":         { formality:1, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","party","gym"] },
  "cap":                { formality:1, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","gym","party"] },
  "beanie":             { formality:1, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","gym","party"] },
  "hat":                { formality:2, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","party","date night"] },
  "scarf":              { formality:2, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","office","party","date night"] },
  "pocket square":      { formality:4, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["office","business formal","date night","party","wedding guest"] },
  "tie":                { formality:5, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["business formal","wedding guest","office"] },
  "bow tie":            { formality:5, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["business formal","wedding guest"] },
  "bag":                { formality:3, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","office","party","date night","wedding guest"] },
  "tote bag":           { formality:2, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","office","party","date night"] },
  "backpack":           { formality:1, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","gym","party"] },
  "clutch":             { formality:4, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["office","business formal","date night","party","wedding guest"] },
  "crossbody bag":      { formality:2, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","party","date night"] },
  "leather bag":        { formality:3, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["casual","office","party","date night","wedding guest"] },
  // Indian accessories
  "dupatta":            { formality:3, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "stole":              { formality:3, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "pagdi":              { formality:4, role:"accessory", category:"accessory", metalTone:null,    occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "maang tikka":        { formality:4, role:"accessory", category:"accessory", metalTone:"gold",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
  "mathapatti":         { formality:5, role:"accessory", category:"accessory", metalTone:"gold",  occasionOk:["ethnic","pooja / puja","festival","wedding guest"] },
};

const GYM_OCCASION_OVERRIDES = {
  "t-shirt": ["casual", "gym", "party"],
  "hoodie": ["casual", "gym", "party"],
  "zip hoodie": ["casual", "gym", "party"],
  "sweatshirt": ["casual", "gym"],
  "tank top": ["casual", "gym"],
  "crop top": ["casual", "gym", "party"],
  "shorts": ["casual", "gym", "beach"],
  "cargo shorts": ["casual", "gym", "beach"],
  "joggers": ["casual", "gym"],
  "track pants": ["casual", "gym"],
  "sweatpants": ["gym", "casual"],
  "leggings": ["gym", "casual"],
  "thermal leggings": ["gym", "casual"],
  "sneakers": ["casual", "gym", "party", "date night"],
  "white sneakers": ["casual", "gym", "party", "date night"],
  "chunky sneakers": ["casual", "gym", "party", "date night"],
  "low top sneakers": ["casual", "gym", "party", "date night"],
  "high top sneakers": ["casual", "gym", "party", "date night"],
  "running shoes": ["gym", "casual"],
  "slides": ["gym", "casual", "beach"],
};

const OFFICE_BANNED_ITEMS = new Set([
  "graphic tee", "hoodie", "zip hoodie", "sweatshirt",
  "chunky knit", "chunky sneakers", "combat boots",
  "flip flops", "cargo pants", "ripped jeans",
  "varsity jacket", "puffer jacket", "parka",
  "shorts", "cargo shorts", "joggers", "sweatpants",
  "leggings", "track pants", "running shoes", "slides",
]);

const ETHNIC_ONLY_OCCASIONS = ["ethnic", "pooja / puja", "festival", "wedding guest"];
const ETHNIC_ONLY_ITEMS = new Set([
  "kurta", "kurti", "sherwani", "bandhgala",
  "pathani suit top", "dhoti", "churidar", "salwar",
  "kolhapuri", "mojari", "jutti", "nehru jacket",
  "bandhgala jacket", "achkan", "dupatta", "stole",
  "pagdi", "maang tikka", "mathapatti",
]);

const FORMAL_ITEM_OVERRIDES = {
  "dress shirt": ["office", "business formal", "wedding guest", "date night", "party"],
  "dress trousers": ["office", "business formal", "wedding guest", "date night"],
  "pleated trousers": ["office", "business formal", "date night", "party"],
  "oxford shoes": ["office", "business formal", "wedding guest", "date night"],
  "derby shoes": ["office", "business formal", "wedding guest", "date night"],
  "monk straps": ["office", "business formal", "wedding guest", "date night"],
  "suit jacket": ["office", "business formal", "wedding guest"],
  "blazer": ["office", "business formal", "date night", "party", "wedding guest", "smart-casual"],
};

const CASUAL_ONLY_OCCASIONS = ["casual", "party", "date night"];
const CASUAL_ONLY_ITEMS = new Set([
  "jeans", "slim jeans", "straight jeans", "wide leg jeans",
  "bootcut jeans", "flare jeans", "ripped jeans",
  "hoodie", "sweatshirt", "graphic tee", "oversized tee",
  "bomber jacket", "denim jacket", "varsity jacket",
  "sneakers", "chunky sneakers", "combat boots",
]);

const FORMALITY_OCCASION_MAP = {
  1: ["casual", "gym", "party"],
  2: ["casual", "party", "date night"],
  3: ["casual", "office", "party", "date night", "wedding guest"],
  4: ["office", "business formal", "date night", "party", "wedding guest"],
  5: ["business formal", "wedding guest"],
};

function getOccasionOkByRules(itemName, itemMeta) {
  if (GYM_OCCASION_OVERRIDES[itemName]) {
    return [...GYM_OCCASION_OVERRIDES[itemName]];
  }

  if (ETHNIC_ONLY_ITEMS.has(itemName)) {
    return [...ETHNIC_ONLY_OCCASIONS];
  }

  if (FORMAL_ITEM_OVERRIDES[itemName]) {
    return [...FORMAL_ITEM_OVERRIDES[itemName]];
  }

  if (CASUAL_ONLY_ITEMS.has(itemName)) {
    return [...CASUAL_ONLY_OCCASIONS];
  }

  const base = FORMALITY_OCCASION_MAP[itemMeta.formality] || FORMALITY_OCCASION_MAP[2];
  const filtered = OFFICE_BANNED_ITEMS.has(itemName)
    ? base.filter((occ) => occ !== "office" && occ !== "business formal")
    : base;

  return [...filtered];
}

Object.keys(CLOTHING_ITEMS).forEach((itemName) => {
  CLOTHING_ITEMS[itemName].occasionOk = getOccasionOkByRules(itemName, CLOTHING_ITEMS[itemName]);
});


// ─────────────────────────────────────────────
// SECTION 7: FABRIC & TEXTURE RULES
// ─────────────────────────────────────────────

/**
 * Two fabrics can clash by texture even if colors are fine.
 * Key rules:
 * - Don't mix two shiny/formal fabrics (looks overdone)
 * - Don't mix two heavy fabrics (looks bulky)
 * - Rough + smooth = interesting texture contrast (good)
 * - Formal fabric (silk, satin) + casual fabric (denim) = intentional contrast
 */
const FABRICS = {
  // Light / casual
  cotton:     { weight:"light",  sheen:"matte",  formality:1, temp:["hot","mid"]        },
  linen:      { weight:"light",  sheen:"matte",  formality:1, temp:["hot"]              },
  jersey:     { weight:"light",  sheen:"matte",  formality:1, temp:["hot","mid"]        },
  chambray:   { weight:"light",  sheen:"matte",  formality:2, temp:["hot","mid"]        },
  rayon:      { weight:"light",  sheen:"slight", formality:2, temp:["hot","mid"]        },
  // Mid weight
  denim:      { weight:"medium", sheen:"matte",  formality:2, temp:["mid","cold"]       },
  chino:      { weight:"medium", sheen:"matte",  formality:3, temp:["mid","cold"]       },
  knit:       { weight:"medium", sheen:"matte",  formality:2, temp:["mid","cold"]       },
  polyester:  { weight:"medium", sheen:"slight", formality:2, temp:["hot","mid","cold"] },
  // Formal / dressy
  silk:       { weight:"light",  sheen:"high",   formality:4, temp:["hot","mid"]        },
  satin:      { weight:"light",  sheen:"high",   formality:4, temp:["mid","cold"]       },
  chiffon:    { weight:"light",  sheen:"slight", formality:3, temp:["hot","mid"]        },
  velvet:     { weight:"heavy",  sheen:"slight", formality:4, temp:["cold"]             },
  // Heavy
  wool:       { weight:"heavy",  sheen:"matte",  formality:4, temp:["cold"]             },
  cashmere:   { weight:"heavy",  sheen:"slight", formality:3, temp:["cold"]             },
  flannel:    { weight:"heavy",  sheen:"matte",  formality:2, temp:["cold"]             },
  leather:    { weight:"heavy",  sheen:"slight", formality:2, temp:["cold"]             },
  corduroy:   { weight:"heavy",  sheen:"matte",  formality:2, temp:["cold"]             },
  fleece:     { weight:"heavy",  sheen:"matte",  formality:1, temp:["cold"]             },
};

const TEXTURE_RULES = {
  goodCombos: [
    // rough + smooth = interesting
    { fabrics:["denim","silk"],       note:"Denim + silk — casual-luxe contrast, very intentional." },
    { fabrics:["wool","cotton"],      note:"Wool layer over cotton base — classic cold-weather." },
    { fabrics:["leather","knit"],     note:"Leather jacket + knit — texture contrast works well." },
    { fabrics:["linen","cotton"],     note:"Both matte, both casual — cohesive summer look." },
    { fabrics:["velvet","satin"],     note:"Two sheen fabrics but velvet absorbs light — works for evening." },
    { fabrics:["corduroy","cotton"],  note:"Textured + plain — classic smart-casual contrast." },
    { fabrics:["chiffon","denim"],    note:"Airy + structured — effortless contrast." },
  ],
  avoid: [
    { fabrics:["silk","satin"],       note:"Two high-sheen fabrics — looks overdone or costume-like." },
    { fabrics:["fleece","silk"],      note:"Wildly mismatched weight and formality." },
    { fabrics:["velvet","linen"],     note:"Heavy formal + casual light — formality and weight clash." },
  ],
  rules: [
    "Match texture weight — heavy with heavy, light with light, or contrast intentionally.",
    "One shiny piece per outfit max. Two shiny items fight for attention.",
    "Matte textures are more versatile and easier to combine.",
    "Texture contrast (rough + smooth) adds visual interest without color conflict.",
  ],
};


// ─────────────────────────────────────────────
// SECTION 8: PATTERN RULES
// ─────────────────────────────────────────────

const PATTERNS = {
  solid:          { formality:3, bold:false, scale:"n/a"    },
  striped:        { formality:3, bold:false, scale:"medium"  },
  "thin stripe":  { formality:4, bold:false, scale:"small"   },
  "wide stripe":  { formality:2, bold:true,  scale:"large"   },
  checkered:      { formality:3, bold:false, scale:"medium"  },
  plaid:          { formality:2, bold:true,  scale:"large"   },
  tartan:         { formality:2, bold:true,  scale:"large"   },
  floral:         { formality:2, bold:true,  scale:"varies"  },
  "small floral": { formality:3, bold:false, scale:"small"   },
  "ditsy floral": { formality:3, bold:false, scale:"small"   },
  graphic:        { formality:1, bold:true,  scale:"large"   },
  camo:           { formality:1, bold:true,  scale:"large"   },
  animal:         { formality:2, bold:true,  scale:"medium"  },
  "animal print": { formality:2, bold:true,  scale:"medium"  },
  houndstooth:    { formality:4, bold:false, scale:"small"   },
  herringbone:    { formality:4, bold:false, scale:"small"   },
  pinstripe:      { formality:5, bold:false, scale:"small"   },
  "polka dot":    { formality:2, bold:false, scale:"small"   },
  geometric:      { formality:2, bold:true,  scale:"medium"  },
  abstract:       { formality:2, bold:true,  scale:"large"   },
  tie_dye:        { formality:1, bold:true,  scale:"large"   },
  paisley:        { formality:2, bold:true,  scale:"medium"  },
  // Ethnic patterns
  embroidered:    { formality:4, bold:false, scale:"detail"  },
  block_print:    { formality:3, bold:false, scale:"medium"  },
  ikat:           { formality:3, bold:true,  scale:"medium"  },
  bandhani:       { formality:3, bold:true,  scale:"small"   },
  kalamkari:      { formality:3, bold:true,  scale:"large"   },
  ajrakh:         { formality:3, bold:true,  scale:"medium"  },
};

/**
 * Pattern mixing rules:
 * 1. One pattern + one solid = always safe
 * 2. Two patterns ok ONLY if: different scales + different types
 * 3. Two bold patterns = almost always wrong
 * 4. One pattern at a time rule: safest approach for most occasions
 */
function canMixPatterns(pattern1, pattern2) {
  if (!pattern1 || !pattern2) return { ok:true, score:8, reason:"Single pattern — clean look." };
  if (pattern1 === "solid" || pattern2 === "solid")
    return { ok:true, score:9, reason:"Solid + pattern is always safe. The solid grounds the look." };
  const p1 = PATTERNS[pattern1], p2 = PATTERNS[pattern2];
  if (!p1 || !p2) return { ok:true, score:6, reason:"Unknown patterns — check manually." };
  if (p1.bold && p2.bold)
    return { ok:false, score:2, reason:`Two bold patterns (${pattern1} + ${pattern2}) clash. Use one solid piece.` };
  if (p1.scale === p2.scale && p1.scale !== "n/a")
    return { ok:false, score:3, reason:`Same scale patterns (${pattern1} + ${pattern2}) compete. Different scales work better.` };
  if (!p1.bold && !p2.bold && p1.scale !== p2.scale)
    return { ok:true, score:7, reason:`Two subtle patterns at different scales — works if colors are compatible.` };
  return { ok:true, score:6, reason:"Pattern combination is acceptable with the right colors." };
}


// ─────────────────────────────────────────────
// SECTION 9: OCCASIONS & DRESS CODES
// ─────────────────────────────────────────────

/**
 * Complete dress code hierarchy (western) + Indian occasions.
 *
 * dresscode: maps to broader western standard
 * formalityRange: [min, max] from CLOTHING_ITEMS formality scale
 * accessoryStyle: minimal | watch-only | statement | subtle | none | ethnic | formal
 */
const OCCASIONS = {
  // ── Western / Universal ──
  casual: {
    label: "Casual",
    dresscode: "casual",
    formalityRange: [1, 2],
    tip: "Comfort-first. Clean and intentional beats perfectly matched. Let personality show.",
    accessoryStyle: "minimal",
    keyRules: [
      "Fits should be intentional — even casual looks clean when well-fitted.",
      "One interesting element (color, texture, detail) elevates a casual outfit.",
      "White sneakers are the most versatile casual shoe — works with 80% of casual fits.",
    ],
  },
  office: {
    label: "Office / Business Casual",
    dresscode: "business casual",
    formalityRange: [3, 4],
    tip: "Clean, pressed, fitted. No logos or graphics. One elevated piece max.",
    accessoryStyle: "watch-only",
    keyRules: [
      "Business casual = polished but not a suit. Blazer + chinos is the gold standard.",
      "Shoes must be formal or smart — no chunky sneakers or sports shoes.",
      "Avoid casual fabrics (hoodies, joggers, graphic tees) entirely.",
    ],
  },
  "business formal": {
    label: "Business Formal",
    dresscode: "business formal",
    formalityRange: [4, 5],
    tip: "Suit or equivalent. Neutral tones. Tailoring is everything.",
    accessoryStyle: "watch-only",
    keyRules: [
      "Full suit or blazer + dress trousers.",
      "Formal shoes only — oxford, derby, monk strap.",
      "One pattern max and only if subtle (pinstripe, thin check).",
    ],
  },
  party: {
    label: "Party",
    dresscode: "smart casual to semi-formal",
    formalityRange: [2, 4],
    tip: "Bolder color and texture. Darker palette for evening. One statement piece.",
    accessoryStyle: "statement",
    keyRules: [
      "Evening parties: dark tones, richer fabrics (satin, leather).",
      "Day parties: brighter colors, more casual silhouettes are fine.",
      "One statement — bold color OR interesting texture OR statement accessory. Not all three.",
    ],
  },
  "date night": {
    label: "Date Night",
    dresscode: "smart casual",
    formalityRange: [3, 4],
    tip: "Dressed up but effortless. Subtle and intentional beats loud. Fit is the statement.",
    accessoryStyle: "subtle",
    keyRules: [
      "Monochromatic dark looks (navy-to-navy, all-black, charcoal) read as confident.",
      "Avoid anything you'd wear to work — elevate at least one piece.",
      "A well-fitted shirt + dark chinos + clean shoes is a universally successful formula.",
    ],
  },
  gym: {
    label: "Gym / Athletic",
    dresscode: "athletic",
    formalityRange: [1, 1],
    tip: "Function first. Matching set looks intentional. Moisture-wicking over cotton for performance.",
    accessoryStyle: "none",
    keyRules: [
      "Matching top + bottom in the same color looks polished even in athletic wear.",
      "Avoid cotton for intense workouts — it holds sweat and chafes.",
      "Running shoes for gym, specific sport shoes for courts.",
    ],
  },
  "wedding guest": {
    label: "Wedding Guest",
    dresscode: "semi-formal to formal",
    formalityRange: [4, 5],
    tip: "Never white (western), never all-black (unless specified). Err overdressed over underdressed.",
    accessoryStyle: "statement",
    keyRules: [
      "Western wedding: semi-formal minimum. Suit or blazer + trousers.",
      "Indian wedding: festive ethnic wear is expected. Coordinate with the wedding color palette.",
      "Avoid white entirely at western weddings.",
    ],
  },
  ethnic: {
    label: "Ethnic / Traditional",
    dresscode: "traditional",
    formalityRange: [3, 5],
    tip: "Match embroidery tone. Footwear completes ethnic — jutti or mojari over sneakers always.",
    accessoryStyle: "ethnic",
    keyRules: [
      "Coordinate embroidery or print color with accessories.",
      "Kurta + churidar or chinos = smart ethnic.",
      "Full sherwani or bandhgala = formal ethnic — for weddings, pujas, Diwali.",
      "Indo-western (kurta + jeans + sneakers) is a valid casual ethnic combination.",
    ],
  },
  // ── Indian-specific occasions ──
  "pooja / puja": {
    label: "Puja / Religious",
    dresscode: "traditional",
    formalityRange: [3, 4],
    tip: "Conservative, covered, and respectful. Traditional preferred but smart ethnic is acceptable.",
    accessoryStyle: "ethnic",
    keyRules: [
      "Avoid western casual (jeans + t-shirt) — not appropriate for most religious contexts.",
      "Kurta + churidar or dhoti is always appropriate.",
      "No footwear inside temple — keep footwear simple and easy to remove.",
    ],
  },
  festival: {
    label: "Festival (Diwali / Holi / Navratri etc.)",
    dresscode: "festive ethnic",
    formalityRange: [3, 5],
    tip: "Bold, celebratory colors. Festival-specific color traditions matter.",
    accessoryStyle: "ethnic",
    keyRules: [
      "Diwali: rich, jewel tones — burgundy, emerald, gold, royal blue, deep red.",
      "Holi: white base so color shows. Wear clothes you don't mind ruining.",
      "Navratri: each day has a specific color — check the schedule.",
      "Eid: whites, pastels, and rich fabrics — kurta or sherwani.",
    ],
  },
};


// ─────────────────────────────────────────────
// SECTION 9B: OCCASION → VIBE MAPPING
// ─────────────────────────────────────────────

/**
 * Each occasion maps to target vibes from the styling engine.
 * Vibes CONTROL generation — they influence item and color selection,
 * not just narration. Each vibe carries preferred colors and items
 * that get priority during combination generation.
 */
const OCCASION_VIBES = Object.fromEntries(
  Object.entries(STYLING_OCCASION_VIBES || {}).map(([occasion, vibes]) => [
    String(occasion || '').toLowerCase().trim(),
    Array.isArray(vibes) ? vibes.map(v => String(v || '').toLowerCase().trim()) : [],
  ])
);

/**
 * Vibe preferences — what each vibe needs in terms of colors and items.
 * This is a bridge between the styling engine's personality system
 * and the core engine's generation logic.
 */
const VIBE_PREFERENCES = {
  "urban edge": {
    preferColors:  ["black", "white", "red", "charcoal", "cobalt"],
    preferItems:   ["leather jacket", "jeans", "hoodie", "graphic tee", "blazer", "combat boots", "ankle boots"],
    avoidColors:   ["beige", "cream", "pastel"],
  },
  "dark romanticism": {
    preferColors:  ["burgundy", "navy", "black", "plum", "wine", "charcoal", "dark red"],
    preferItems:   ["blazer", "trousers", "turtleneck", "overcoat", "chelsea boots", "dress shirt"],
    avoidColors:   ["white", "beige", "cream", "sky blue"],
  },
  "date night precision": {
    preferColors:  ["navy", "charcoal", "black", "white", "burgundy"],
    preferItems:   ["shirt", "trousers", "turtleneck", "blazer", "slim jeans", "chelsea boots", "loafers"],
    avoidColors:   [],
  },
  "clean confidence": {
    preferColors:  ["white", "navy", "black", "gray", "charcoal"],
    preferItems:   ["shirt", "trousers", "turtleneck", "white sneakers", "straight jeans", "blazer"],
    avoidColors:   [],
  },
  "quiet authority": {
    preferColors:  ["navy", "beige", "charcoal", "white", "camel"],
    preferItems:   ["shirt", "chinos", "dress shirt", "trousers", "blazer", "loafers", "oxford shoes"],
    avoidColors:   ["red", "orange", "hot pink"],
  },
  "effortless cool": {
    preferColors:  ["white", "denim", "gray", "navy", "beige", "olive"],
    preferItems:   ["t-shirt", "jeans", "shirt", "white sneakers", "linen shirt", "chinos"],
    avoidColors:   [],
  },
  "off-duty creative": {
    preferColors:  ["black", "olive", "gray", "navy", "charcoal"],
    preferItems:   ["wide leg jeans", "t-shirt", "cargo pants", "oversized tee", "chunky sneakers"],
    avoidColors:   [],
  },
  "athletic edge": {
    preferColors:  ["black", "gray", "white", "navy"],
    preferItems:   ["t-shirt", "joggers", "shorts", "sneakers", "running shoes", "hoodie", "track pants"],
    avoidColors:   [],
  },
  "cultural power": {
    preferColors:  ["white", "gold", "mustard", "navy", "burgundy", "maroon"],
    preferItems:   ["kurta", "churidar", "sherwani", "bandhgala", "dhoti", "nehru jacket", "mojari", "jutti", "kolhapuri"],
    avoidColors:   [],
  },
  "festive fire": {
    preferColors:  ["burgundy", "emerald", "royal blue", "gold", "deep red", "maroon", "purple"],
    preferItems:   ["sherwani", "kurta", "bandhgala", "nehru jacket", "churidar", "mojari"],
    avoidColors:   ["white", "beige", "gray"],
  },
  "stealth wealth": {
    preferColors:  ["camel", "cream", "white", "gray", "navy", "charcoal"],
    preferItems:   ["overcoat", "trousers", "trench coat", "chinos", "cashmere sweater", "loafers", "chelsea boots"],
    avoidColors:   ["red", "hot pink", "orange"],
  },
  "summer protagonist": {
    preferColors:  ["white", "beige", "sky blue", "coral", "mint"],
    preferItems:   ["shirt", "shorts", "t-shirt", "linen shirt", "chinos", "sandals", "espadrilles"],
    avoidColors:   ["black", "charcoal"],
  },
  "golden hour": {
    preferColors:  ["camel", "rust", "mustard", "olive", "terracotta", "beige", "brown", "cream"],
    preferItems:   ["sweater", "chinos", "cardigan", "trousers", "boots", "chelsea boots"],
    avoidColors:   [],
  },
};

/**
 * Get vibe preferences for scoring and filtering.
 * Returns the preference object for a given vibe key.
 */
function getVibePreferences(vibeKey) {
  return VIBE_PREFERENCES[vibeKey] || null;
}


// ─────────────────────────────────────────────
// SECTION 9C: OUTFIT TEMPLATES
// ─────────────────────────────────────────────

/**
 * Base outfit structures per occasion.
 * Used to enforce diversity — different outfits in a batch
 * should use DIFFERENT templates where possible.
 *
 * Each template is [topRole, bottomRole, shoeFormality, layerRequired]
 */
const OUTFIT_TEMPLATES = {
  casual: [
    { id: "casual_relaxed",  top: ["t-shirt","graphic tee","oversized tee"],  bottom: ["jeans","slim jeans","straight jeans","shorts"],  shoeFormality: [1,2], layerOk: false },
    { id: "casual_smart",    top: ["shirt","linen shirt","polo shirt"],       bottom: ["chinos","linen trousers","wide leg jeans"],      shoeFormality: [2,3], layerOk: true },
    { id: "casual_street",   top: ["hoodie","sweatshirt","oversized tee"],    bottom: ["joggers","cargo pants","track pants","wide leg jeans"], shoeFormality: [1,2], layerOk: false },
    { id: "casual_summer",   top: ["linen shirt","tank top","t-shirt"],       bottom: ["shorts","linen trousers","cargo shorts"],         shoeFormality: [1,2], layerOk: false },
  ],
  office: [
    { id: "office_sharp",    top: ["dress shirt","shirt"],                    bottom: ["trousers","dress trousers","pleated trousers"],  shoeFormality: [3,5], layerOk: true },
    { id: "office_smart",    top: ["shirt","oxford shirt","blouse"],          bottom: ["chinos","linen trousers","wide leg trousers"],    shoeFormality: [3,4], layerOk: true },
    { id: "office_minimal",  top: ["turtleneck","sweater","mock neck"],       bottom: ["trousers","chinos","wide leg trousers"],         shoeFormality: [3,4], layerOk: false },
    { id: "office_summer",   top: ["linen shirt","silk blouse","polo shirt"], bottom: ["linen trousers","chinos","wide leg trousers"],    shoeFormality: [3,4], layerOk: true },
  ],
  "business formal": [
    { id: "bf_classic",      top: ["dress shirt"],                            bottom: ["dress trousers","trousers"],                    shoeFormality: [4,5], layerOk: true },
    { id: "bf_layered",      top: ["dress shirt","silk blouse"],              bottom: ["pleated trousers","dress trousers"],             shoeFormality: [4,5], layerOk: true },
  ],
  party: [
    { id: "party_dark",      top: ["shirt","dress shirt","turtleneck"],       bottom: ["slim jeans","jeans","trousers"],                shoeFormality: [2,4], layerOk: true },
    { id: "party_edge",      top: ["graphic tee","t-shirt","bodysuit"],       bottom: ["jeans","slim jeans","cargo pants","wide leg jeans"], shoeFormality: [1,3], layerOk: true },
    { id: "party_elevated",  top: ["blouse","silk blouse","wrap top"],        bottom: ["trousers","pencil skirt","wide leg trousers"],   shoeFormality: [3,5], layerOk: true },
    { id: "party_summer",    top: ["silk blouse","linen shirt","crop top"],   bottom: ["wide leg trousers","mini skirt","shorts"],        shoeFormality: [2,4], layerOk: false },
  ],
  "date night": [
    { id: "date_refined",    top: ["shirt","dress shirt"],                    bottom: ["trousers","slim jeans","wide leg trousers"],      shoeFormality: [3,4], layerOk: true },
    { id: "date_dark",       top: ["turtleneck","mock neck","henley"],        bottom: ["jeans","slim jeans","trousers"],                 shoeFormality: [2,4], layerOk: true },
    { id: "date_smart",      top: ["sweater","ribbed knit","flannel shirt"],  bottom: ["chinos","jeans","wide leg jeans"],              shoeFormality: [2,3], layerOk: true },
    { id: "date_summer",     top: ["linen shirt","silk blouse","wrap top"],   bottom: ["linen trousers","wide leg trousers","skirt"],     shoeFormality: [2,4], layerOk: false },
  ],
  gym: [
    { id: "gym_basic",       top: ["t-shirt","graphic tee","tank top"],       bottom: ["shorts","joggers"],                             shoeFormality: [1,1], layerOk: false },
    { id: "gym_cold",        top: ["hoodie","sweatshirt","zip hoodie"],       bottom: ["joggers","track pants","leggings"],              shoeFormality: [1,1], layerOk: false },
  ],
  "wedding guest": [
    { id: "wed_ethnic",      top: ["kurta","sherwani","bandhgala"],           bottom: ["churidar","dhoti","salwar"],                    shoeFormality: [2,5], layerOk: true },
    { id: "wed_western",     top: ["dress shirt","shirt"],                    bottom: ["trousers","dress trousers"],                    shoeFormality: [3,5], layerOk: true },  // must have blazer/layer
    { id: "wed_indo",        top: ["kurta","shirt"],                          bottom: ["chinos","trousers"],                            shoeFormality: [2,4], layerOk: true },  // needs nehru jacket
  ],
  ethnic: [
    { id: "ethnic_classic",  top: ["kurta","kurti"],                          bottom: ["churidar","dhoti","salwar"],                    shoeFormality: [2,4], layerOk: true },
    { id: "ethnic_formal",   top: ["sherwani","bandhgala"],                   bottom: ["churidar"],                                     shoeFormality: [3,5], layerOk: true },
  ],
  "pooja / puja": [
    { id: "puja_simple",     top: ["kurta","kurti","pathani suit top"],       bottom: ["churidar","dhoti","salwar"],                    shoeFormality: [2,3], layerOk: false },
  ],
  festival: [
    { id: "fest_grand",      top: ["sherwani","bandhgala"],                   bottom: ["churidar"],                                     shoeFormality: [3,5], layerOk: true },
    { id: "fest_vibrant",    top: ["kurta","kurti"],                          bottom: ["churidar","dhoti","salwar"],                    shoeFormality: [2,4], layerOk: true },
  ],
};


// ─────────────────────────────────────────────
// SECTION 9D: CULTURAL OCCASION RULES
// ─────────────────────────────────────────────

/**
 * Differentiate ethnic / puja / festival — currently identical, now distinct.
 * These rules are enforced during FILTERING, not just scoring.
 */
const CULTURAL_OCCASION_RULES = {
  ethnic: {
    description: "Clean traditional looks — balanced formality",
    colorBias: [],  // no specific bias — versatile
    colorAvoid: [],
    requireRichElement: false,
    requireSimple: false,
    preferredFormality: [3, 5],
  },
  "pooja / puja": {
    description: "Simple, minimal, light colors — conservative and respectful",
    colorBias: ["white", "cream", "ivory", "yellow", "light blue", "beige", "gold", "orange"],
    colorAvoid: ["black", "red", "hot pink", "neon"],
    requireRichElement: false,
    requireSimple: true,  // prefer simple items, avoid heavy embroidery
    preferredFormality: [3, 4],
  },
  festival: {
    description: "Vibrant, celebratory — rich elements required",
    colorBias: ["burgundy", "emerald", "royal blue", "gold", "deep red", "maroon", "purple", "teal"],
    colorAvoid: ["white", "beige", "gray"],  // too plain for festival
    requireRichElement: true,  // at least one bold color or elevated item
    requireSimple: false,
    preferredFormality: [3, 5],
  },
};


// ─────────────────────────────────────────────
// SECTION 9E: GYM ALLOWED ITEMS (WHITELIST)
// ─────────────────────────────────────────────

const GYM_ALLOWED = {
  tops:    ["t-shirt", "graphic tee", "oversized tee", "tank top", "crop top", "hoodie", "zip hoodie", "sweatshirt"],
  bottoms: ["shorts", "cargo shorts", "joggers", "track pants", "sweatpants", "leggings", "thermal leggings"],
  shoes:   ["sneakers", "white sneakers", "chunky sneakers", "low top sneakers", "high top sneakers", "running shoes"],
};


// ─────────────────────────────────────────────
// SECTION 10: STYLE ARCHETYPES
// ─────────────────────────────────────────────

/**
 * Style archetypes — a user's overall aesthetic identity.
 * Used to personalize suggestions beyond just occasion.
 * A user can have a primary + secondary archetype.
 */
const STYLE_ARCHETYPES = {
  minimalist: {
    label: "Minimalist",
    palette: ["black","white","gray","navy","camel","beige","cream"],
    keyPieces: ["tailored trousers","white shirt","black turtleneck","straight jeans","clean sneakers","trench coat"],
    avoidItems: ["graphic tee","camo","animal print","tie_dye","cargo pants","chunky sneakers"],
    patterns: ["solid","thin stripe","pinstripe"],
    tip: "Fewer, better pieces. Invest in fit. Neutral palette. Nothing superfluous.",
  },
  streetwear: {
    label: "Streetwear",
    palette: ["black","white","gray","olive","red","cobalt","rust","cream"],
    keyPieces: ["graphic tee","hoodie","cargo pants","chunky sneakers","bomber jacket","wide leg jeans","cap"],
    avoidItems: ["blazer","oxford shoes","dress shirt","pencil skirt"],
    patterns: ["graphic","camo","wide stripe","geometric"],
    tip: "Proportion play is key — oversized on top or bottom, never both.",
  },
  classic: {
    label: "Classic / Preppy",
    palette: ["navy","white","camel","burgundy","gray","forest green","red"],
    keyPieces: ["oxford shirt","polo shirt","chinos","blazer","loafers","chelsea boots","straight jeans"],
    avoidItems: ["cargo pants","graphic tee","chunky sneakers","tie_dye","camo"],
    patterns: ["thin stripe","checkered","houndstooth","solid","plaid"],
    tip: "Timeless over trendy. Quality over quantity. Fit is everything.",
  },
  smart_casual: {
    label: "Smart Casual",
    palette: ["navy","white","gray","beige","olive","burgundy","camel"],
    keyPieces: ["shirt","slim jeans","chinos","white sneakers","loafers","blazer","cardigan"],
    avoidItems: ["sweatpants","graphic tee","cargo pants","flip flops"],
    patterns: ["solid","thin stripe","small floral","checkered"],
    tip: "One elevated piece per outfit. Clean and intentional without trying too hard.",
  },
  bohemian: {
    label: "Bohemian / Boho",
    palette: ["terracotta","rust","cream","olive","mustard","brown","sage"],
    keyPieces: ["maxi skirt","wrap blouse","wide leg jeans","sandals","cardigan","linen shirt"],
    avoidItems: ["blazer","dress shirt","pencil skirt","oxford shoes"],
    patterns: ["floral","paisley","geometric","ikat","block_print","tie_dye"],
    tip: "Layering, earthy tones, natural fabrics. Mix vintage and handcrafted elements.",
  },
  edgy: {
    label: "Edgy / Alternative",
    palette: ["black","charcoal","red","cobalt","burgundy","white","silver"],
    keyPieces: ["leather jacket","combat boots","ripped jeans","graphic tee","ankle boots","black jeans"],
    avoidItems: ["pastel colors","floral","loafers","polo shirt"],
    patterns: ["graphic","plaid","animal print","geometric","abstract"],
    tip: "Contrast is your tool — dark palette with one strong accent.",
  },
  athleisure: {
    label: "Athleisure",
    palette: ["black","gray","white","navy","olive","cobalt","coral"],
    keyPieces: ["joggers","leggings","hoodie","chunky sneakers","bomber jacket","track pants"],
    avoidItems: ["blazer","dress shirt","heels","loafers","trousers"],
    patterns: ["solid","geometric","wide stripe"],
    tip: "The key is performance fabrics in elevated cuts. Keeps sportswear looking intentional.",
  },
  indo_western: {
    label: "Indo-Western",
    palette: ["white","navy","black","beige","mustard","rust","teal","emerald"],
    keyPieces: ["kurta","jeans","chinos","nehru jacket","white sneakers","kolhapuri","loafers"],
    avoidItems: ["hoodie","graphic tee","sweatpants"],
    patterns: ["block_print","embroidered","ikat","solid","thin stripe"],
    tip: "Balance the ethnic and western elements — one dominates, one accents.",
  },
};

/**
 * Score an outfit against a user's style archetype.
 */
function scoreOutfitForArchetype(items, archetype) {
  if (!archetype || !STYLE_ARCHETYPES[archetype]) return { score:0, notes:[] };
  const arch = STYLE_ARCHETYPES[archetype];
  const notes = [];
  let score = 0;

  items.forEach(item => {
    if (arch.avoidItems.includes(item.name)) {
      score -= 2;
      notes.push(`${item.name} doesn't suit ${arch.label} style.`);
    }
    if (arch.keyPieces.some(kp => item.name.includes(kp) || kp.includes(item.name))) {
      score += 2;
    }
    if (item.color && arch.palette.includes(item.color)) {
      score += 1;
    }
    if (item.pattern && arch.patterns.includes(item.pattern)) {
      score += 1;
    }
  });

  return { score, notes };
}


// ─────────────────────────────────────────────
// SECTION 11: LAYERING HIERARCHY
// ─────────────────────────────────────────────

/**
 * Layering has a strict order and logic.
 * Base → Mid → Outer
 * Each layer should be slightly longer or larger than the one inside it.
 */
const LAYERING_RULES = {
  hierarchy: [
    { level:1, name:"Base",  examples:["t-shirt","tank top","bodysuit","thermal"],   note:"Closest to body. Light, fitted." },
    { level:2, name:"Mid",   examples:["shirt","sweater","hoodie","cardigan","vest"],note:"Over base. Can be worn alone in mild weather." },
    { level:3, name:"Outer", examples:["jacket","blazer","coat","trench","parka"],   note:"Outermost. Structured or protective." },
  ],
  rules: [
    "Each layer should be slightly larger than the one beneath it.",
    "Avoid bulk at the waist — tuck base layers if adding a mid and outer.",
    "A t-shirt under a shirt (base + mid) works when the shirt is open.",
    "Turtleneck under blazer = mid bypassed into formal — contemporary and sharp.",
    "Color tip: the most visible layer (outer or mid) should carry the outfit's color story.",
    "Don't layer items of the same weight — contrast weights add visual dimension.",
    "In hot weather: zero layers. In mild: 1–2 layers. In cold: base + mid + outer.",
  ],
  collarStacking: {
    "crew neck + crew neck": { ok:false, note:"Two crew necks layer bulkily at the collar." },
    "crew neck + v-neck":    { ok:true,  note:"V-neck over crew neck — the crew peeks through cleanly." },
    "turtleneck + blazer":   { ok:true,  note:"Classic contemporary layering." },
    "shirt collar + sweater":{ ok:true,  note:"Collar over sweater adds a preppy smart-casual touch." },
    "hoodie + jacket":       { ok:true,  note:"Streetwear/casual — hood should tuck under jacket." },
  },
};


// ─────────────────────────────────────────────
// SECTION 12: SHOE PAIRING MATRIX
// ─────────────────────────────────────────────

/**
 * Complete shoe pairing matrix.
 * Maps each bottom type to the shoes that work best with it.
 * Based on formality compatibility + aesthetic match.
 */
const SHOE_PAIRING = {
  // Bottoms
  "jeans":              { best:["white sneakers","chelsea boots","loafers","ankle boots","sneakers"],
                          avoid:["stilettos","oxford shoes","flip flops"],
                          note:"Jeans are incredibly versatile — from sneakers to chelsea boots." },
  "slim jeans":         { best:["white sneakers","loafers","chelsea boots","ankle boots"],
                          avoid:["chunky sneakers","flip flops"],         note:"Slim jeans work with streamlined shoes." },
  "straight jeans":     { best:["white sneakers","chunky sneakers","loafers","boots","chelsea boots"],
                          avoid:["stilettos","flip flops"],               note:"The most versatile jean cut." },
  "wide leg jeans":     { best:["heels","block heels","mules","ankle boots","loafers"],
                          avoid:["flat sandals","chunky sneakers"],       note:"Wide leg needs height or a clean sole to not look sloppy at the hem." },
  "chinos":             { best:["white sneakers","loafers","brogues","derby shoes","chelsea boots"],
                          avoid:["chunky sneakers","flip flops","combat boots"],
                          note:"Chinos bridge casual and smart — shoes define which side you lean." },
  "trousers":           { best:["oxford shoes","derby shoes","loafers","monk straps","chelsea boots","heels"],
                          avoid:["chunky sneakers","sandals","flip flops","running shoes"],
                          note:"Trousers need a shoe with structure and formality." },
  "dress trousers":     { best:["oxford shoes","derby shoes","monk straps","stilettos"],
                          avoid:["sneakers","sandals","boots","casual shoes"],
                          note:"Dress trousers demand formal shoes — no exceptions." },
  "shorts":             { best:["sandals","sneakers","espadrilles","slides","low top sneakers"],
                          avoid:["boots","heels","oxford shoes","dress shoes"],
                          note:"Shorts are casual — keep shoes casual too." },
  "cargo pants":        { best:["chunky sneakers","boots","combat boots","sneakers"],
                          avoid:["loafers","oxford shoes","heels","dress shoes"],
                          note:"Cargo pants are utilitarian — match with substantial shoes." },
  "joggers":            { best:["sneakers","chunky sneakers","slides"],
                          avoid:["loafers","oxford shoes","heels","dress shoes","sandals"],
                          note:"Joggers are casual/athletic — only casual shoes work." },
  "skirt":              { best:["sandals","heels","mules","ankle boots","sneakers","loafers"],
                          avoid:["flip flops","combat boots"],             note:"Skirts are versatile." },
  "mini skirt":         { best:["chunky sneakers","ankle boots","heels","mules"],
                          avoid:["flat sandals","oxford shoes"],           note:"Mini skirt works with contrast — chunky sole OR elevated heel." },
  "midi skirt":         { best:["heels","mules","ankle boots","loafers","sandals"],
                          avoid:["chunky sneakers","combat boots","flip flops"],
                          note:"Midi length can shorten legs — avoid flat chunky shoes." },
  "maxi skirt":         { best:["heels","sandals","mules","espadrilles"],
                          avoid:["chunky sneakers","boots"],               note:"Maxi + flat shoe can drag on ground — heels or sandals lift the hemline." },
  "leggings":           { best:["sneakers","ankle boots","slides","chunky sneakers"],
                          avoid:["heels","oxford shoes","loafers"],        note:"Leggings are athletic/casual — matching shoes." },
  // Indian bottoms
  "churidar":           { best:["mojari","jutti","loafers","oxford shoes"],
                          avoid:["sneakers","sandals","flip flops"],       note:"Churidar demands a refined shoe." },
  "dhoti":              { best:["kolhapuri","jutti","sandals"],
                          avoid:["sneakers","boots","heels"],              note:"Dhoti is traditional — traditional footwear completes it." },
};

/**
 * Score a shoe + bottom combination.
 */
function scoreShoeBottomPair(shoeName, bottomName) {
  const pairing = SHOE_PAIRING[bottomName];
  if (!pairing) return { score:5, note:"Bottom not in pairing matrix." };
  if (pairing.best.includes(shoeName)) return { score:10, note:pairing.note };
  if (pairing.avoid.includes(shoeName)) return { score:1,  note:`${shoeName} doesn't work with ${bottomName}. ${pairing.note}` };
  return { score:6, note:"Acceptable combination." };
}


// ─────────────────────────────────────────────
// SECTION 13: ACCESSORY & METAL TONE RULES
// ─────────────────────────────────────────────

/**
 * Metal tone consistency:
 * Silver and gold CAN be mixed intentionally (mixed metal trend),
 * but for clean looks, keep all metals the same tone.
 *
 * Rules:
 * - Silver: suits cool undertones, blue/gray/white/black outfits
 * - Gold: suits warm undertones, earth tones, white, black, navy
 * - Rose gold: suits warm undertones, blush, white, dusty rose, camel
 * - Mixing silver + gold: only if one clearly dominates
 */
const METAL_TONE_RULES = {
  silver: {
    suitedPalette: ["black","white","gray","navy","blue","teal","lavender","charcoal","silver"],
    undertone: "cool",
    note: "Silver looks best with cool-toned outfits and cool skin undertones.",
  },
  gold: {
    suitedPalette: ["black","white","navy","camel","beige","olive","burgundy","terracotta","rust","emerald","mustard"],
    undertone: "warm",
    note: "Gold is warm and rich — pairs beautifully with earth tones and classic neutrals.",
  },
  "rose gold": {
    suitedPalette: ["blush","white","cream","dusty rose","mauve","camel","beige","gray"],
    undertone: "warm",
    note: "Rose gold is delicate and feminine — suits soft, warm palettes.",
  },
  bronze: {
    suitedPalette: ["camel","tan","beige","olive","terracotta","brown","rust"],
    undertone: "warm",
    note: "Bronze is earthy — best with deep warm tones.",
  },
};

function suggestAccessories(outfitItems, availableAccessories = [], occasion, weather) {
  const suggestions = [];
  const style = OCCASIONS[occasion]?.accessoryStyle || "minimal";
  const owned = availableAccessories.map(a => (a.name || "").toLowerCase());
  if (style === "none") return [];

  const hasOpenCollar = outfitItems.some(i =>
    ["t-shirt","shirt","polo shirt","kurta","crop top","blouse","linen shirt","oxford shirt","henley"].includes(i.name)
  );
  const hasFormalBottom = outfitItems.some(i =>
    ["trousers","dress trousers","pleated trousers","chinos"].includes(i.name)
  );
  const shoe = outfitItems.find(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
  const topColors = outfitItems.filter(i => i.color).map(i => i.color);
  const isWarmPalette = topColors.some(c => COLOR_PROFILES[c]?.temp === "warm");
  const dominantMetal = isWarmPalette ? "gold" : "silver";

  // Belt
  if (hasFormalBottom && owned.some(a => a.includes("belt"))) {
    suggestions.push(`${shoe?.color || "Neutral"}-toned belt — match to shoe color`);
  }

  // Watch
  if (["watch-only","statement","subtle"].includes(style)) {
    const hasGoldWatch  = owned.includes("gold watch");
    const hasSilverWatch= owned.includes("silver watch");
    const hasWatch      = owned.includes("watch") || hasGoldWatch || hasSilverWatch;
    if (hasWatch) {
      const watchMetal = hasGoldWatch ? "gold" : hasSilverWatch ? "silver" : dominantMetal;
      suggestions.push(`${watchMetal === "gold" ? "Gold" : "Silver"} watch — elevates formality`);
    }
  }

  // Chain — only with open collar, not office
  if (!["watch-only","none","ethnic"].includes(style)) {
    const hasChain = owned.some(a => a.includes("chain"));
    if (hasChain && hasOpenCollar) {
      suggestions.push(`${dominantMetal === "gold" ? "Gold" : "Silver"} chain — works with open collar. Keep understated.`);
    }
  }

  // Rings — party and date night only
  if (["statement","subtle"].includes(style)) {
    const hasRing = owned.some(a => a.includes("ring") || a.includes("rings"));
    if (hasRing) {
      suggestions.push(`Ring(s) — max 2, same metal tone as other accessories (${dominantMetal})`);
    }
  }

  // Ethnic
  if (style === "ethnic") {
    if (owned.includes("dupatta") || owned.includes("stole"))
      suggestions.push("Dupatta/stole — drape completes the ethnic look");
    if (owned.includes("maang tikka") || owned.includes("mathapatti"))
      suggestions.push("Traditional headpiece — gold for formal ethnic events");
    if (owned.includes("pagdi"))
      suggestions.push("Pagdi — for formal ethnic events (weddings, festivals)");
    const hasNecklace = owned.some(a => a.includes("necklace"));
    if (hasNecklace) suggestions.push("Necklace — gold or kundan for ethnic contexts");
  }

  // Tie / pocket square for formal
  if (style === "formal" || occasion === "business formal") {
    if (owned.includes("tie")) suggestions.push("Tie — must match or complement shirt and suit");
    if (owned.includes("pocket square")) suggestions.push("Pocket square — fold simply for business, more creatively for events");
  }

  // Sunglasses
  if (weather === "hot" && ["casual","party","date night"].includes(occasion) && owned.includes("sunglasses")) {
    suggestions.push("Sunglasses — essential finishing touch outdoors");
  }

  // Cap / Beanie
  if (weather === "hot" && occasion === "casual" && owned.includes("cap"))
    suggestions.push("Cap — practical and adds casual edge");
  if (weather === "cold" && owned.includes("beanie"))
    suggestions.push("Beanie — casual cold-weather finishing touch");

  // Scarf
  if (weather === "cold" && owned.includes("scarf"))
    suggestions.push("Scarf — adds texture and warmth; ties the cold-weather look together");

  // Bag
  if (owned.includes("tote bag") && ["casual","office"].includes(occasion))
    suggestions.push("Tote bag — versatile and practical for this occasion");
  if (owned.includes("clutch") && ["party","date night","wedding guest"].includes(occasion))
    suggestions.push("Clutch — keeps the look streamlined for evening");

  return suggestions;
}


// ─────────────────────────────────────────────
// SECTION 14: INTENTIONAL CONTRASTS
// ─────────────────────────────────────────────

const INTENTIONAL_CONTRASTS = [
  { top:"blazer",       bottom:"jeans",         note:"Smart-casual classic. The gold standard." },
  { top:"blazer",       bottom:"joggers",        note:"Contemporary — works for creative/fashion contexts." },
  { top:"suit jacket",  bottom:"jeans",          note:"High contrast — bold, fashion-forward." },
  { top:"dress shirt",  bottom:"jeans",          note:"Tucked = smart casual. Untucked with open collar = relaxed." },
  { top:"turtleneck",   bottom:"trousers",       note:"Minimalist chic — one of the cleanest looks." },
  { top:"hoodie",       bottom:"trousers",       note:"Normcore — very contemporary and widely worn." },
  { top:"t-shirt",      bottom:"trousers",       note:"Requires fitted tee and well-tailored trousers." },
  { top:"turtleneck",   bottom:"jeans",          note:"Sleek and sophisticated — monochromatic version is best." },
  { top:"sweater",      bottom:"trousers",       note:"Elevated casual — tucked-in gives polish." },
  { top:"leather jacket",bottom:"formal dress",  note:"Fashion-forward contrast — edgy meets refined." },
  { top:"oversized blazer",bottom:"leggings",    note:"Contemporary power dressing." },
  { top:"nehru jacket", bottom:"jeans",          note:"Indo-western classic." },
  { top:"kurta",        bottom:"jeans",          note:"Indo-western staple — casual ethnic fusion." },
  { top:"kurta",        bottom:"chinos",         note:"Smart indo-western." },
];


// ─────────────────────────────────────────────
// SECTION 15: INDIAN / CULTURAL FASHION CONTEXT
// ─────────────────────────────────────────────

/**
 * Indian fashion has its own complete system:
 * - Festival-specific color traditions
 * - Regional dress variations
 * - Fabric significance
 * - Jewelry rules for ethnic wear
 */
const INDIAN_FASHION = {
  festivalColors: {
    diwali:   { preferred:["deep red","burgundy","emerald","royal blue","gold","purple","maroon"],
                avoid:["white","black"], note:"Jewel tones and rich fabrics — silk, brocade, velvet." },
    holi:     { preferred:["white","light colors"], avoid:["dark colors"],
                note:"Wear white — it shows the colors. Avoid anything you can't ruin." },
    navratri: { days:{
      1:"gray", 2:"orange", 3:"white", 4:"red", 5:"royal blue",
      6:"yellow", 7:"green", 8:"peacock blue", 9:"purple",
    }, note:"Each day has a specific color. Chaniya choli or kurta." },
    eid:      { preferred:["white","cream","gold","pastel blue","mint","rose"],
                avoid:["black"], note:"Whites and pastels for Eid. Kurta or sherwani essential." },
    ganesh_chaturthi: { preferred:["yellow","green","orange"], note:"Auspicious colors." },
    karva_chauth:     { preferred:["red","orange","maroon","pink"], note:"Traditional married woman's festival." },
  },
  fabricSignificance: {
    silk:    "Auspicious fabric — worn for weddings and religious occasions.",
    khadi:   "Patriotic significance — handspun, worn for national events.",
    bandhani:"Traditional Rajasthani/Gujarati tie-dye — festive and regional.",
    ikat:    "Handwoven — significant in Odisha, AP, Telangana.",
    kantha:  "Bengali embroidery — casual to semi-formal ethnic wear.",
    phulkari:"Punjabi embroidered fabric — wedding and festive use.",
    zari:    "Gold thread work — worn for formal occasions and weddings.",
    banarasi:"Banaras silk with zari — one of the most formal Indian fabrics.",
  },
  indoWestern: {
    rules: [
      "Kurta + slim jeans + clean sneakers = casual indo-western.",
      "Kurta + chinos + kolhapuri = smart indo-western.",
      "Nehru jacket + shirt + trousers = formal indo-western.",
      "Don't mix heavy embroidery with heavily patterned western pieces.",
      "When going indo-western, one piece dominates (usually the ethnic piece), the other supports.",
    ],
    colorRule: "When mixing ethnic and western, the western piece should be a neutral that lets the ethnic piece speak.",
  },
  weddingRules: {
    groom:   ["Sherwani or bandhgala is standard. Color depends on ceremony.","Mojari or jutti complete the look."],
    guest:   ["Avoid white (widow's color traditionally).","Avoid black unless it's a modern/urban wedding.","Festive ethnic or indo-western is always safe."],
    baraat:  ["Groom's side traditionally matches in color or theme.","Sehra (floral headpiece) with sherwani."],
    reception:["More modern — western formal or indo-western is fine for guests."],
  },
};


// ─────────────────────────────────────────────
// SECTION 16: SCORING ENGINE
// ─────────────────────────────────────────────

function scoreColorPair(color1, color2, occasion) {
  const c1 = (color1||"").toLowerCase().trim();
  const c2 = (color2||"").toLowerCase().trim();
  if (!c1||!c2)  return { score:5, level:"unknown", reason:"Color data missing." };
  if (c1===c2)   return { score:7, level:"good",    reason:"Monochromatic — works with tonal variation." };

  // ── Gym-specific strict color rules ──
  if (occasion === "gym") {
    const darkClashes = [["navy","black"],["green","black"],["dark brown","black"],["charcoal","navy"]];
    const isClash = darkClashes.some(([a,b])=>(a===c1&&b===c2)||(a===c2&&b===c1));
    if (isClash) return { score:2, level:"avoid", reason:`${c1} + ${c2} clashes in gym context — prefer matching sets or neutral base.` };
    // Gym bonus for matching sets or neutral+neutral
    const p1g = COLOR_PROFILES[c1], p2g = COLOR_PROFILES[c2];
    if (p1g?.neutral && p2g?.neutral) return { score:9, level:"great", reason:"Neutral gym combo — clean and intentional." };
  }

  const alwaysOk = COLOR_RULES.alwaysWorks.some(([a,b])=>(a===c1&&b===c2)||(a===c2&&b===c1));
  if (alwaysOk)  return { score:10, level:"excellent", reason:`${c1} + ${c2} is a proven, timeless pairing.` };

  const avoid = COLOR_RULES.avoid.some(([a,b])=>(a===c1&&b===c2)||(a===c2&&b===c1));
  if (avoid)     return { score:2,  level:"avoid",     reason:`${c1} + ${c2} tends to clash. Swap one for a neutral.` };

  const p1 = COLOR_PROFILES[c1], p2 = COLOR_PROFILES[c2];
  if (p1?.neutral||p2?.neutral)
    return { score:8, level:"great",   reason:`${p1?.neutral?c1:c2} is a neutral — it pairs broadly.` };
  if (!p1||!p2)
    return { score:5, level:"unknown", reason:"Color not in database — assess manually." };

  const isComp = COLOR_HARMONY.complementary.some(
    ([a,b])=>(a===p1.family&&b===p2.family)||(a===p2.family&&b===p1.family)
  );
  if (isComp) return { score:8, level:"great", reason:`Complementary families (${p1.family}/${p2.family}) — bold, high-contrast pair.` };

  const isAnal = COLOR_HARMONY.analogous.some(
    ([a,b])=>(a===p1.family&&b===p2.family)||(a===p2.family&&b===p1.family)
  );
  if (isAnal) return { score:8, level:"great", reason:`Analogous families (${p1.family}/${p2.family}) — harmonious and cohesive.` };

  if (p1.temp===p2.temp && p1.temp!=="neutral")
    return { score:6, level:"okay", reason:`Both ${p1.temp} toned — generally cohesive, but add a neutral to anchor.` };

  return { score:4, level:"risky", reason:`Mixed warm/cool without clear harmony. Add a neutral to bridge.` };
}

function checkFormalityMatch(name1, name2) {
  const i1 = CLOTHING_ITEMS[name1], i2 = CLOTHING_ITEMS[name2];
  if (!i1||!i2) return { ok:true, score:5, note:"Item not in database." };
  const diff = Math.abs(i1.formality - i2.formality);
  if (diff===0) return { ok:true,  score:10, note:"Perfect formality match." };
  if (diff===1) return { ok:true,  score:8,  note:"Close formality — works well." };
  if (diff===2) return { ok:true,  score:5,  note:"Moderate formality gap — intentional contrast can work." };
  if (diff===3) return { ok:false, score:3,  note:`Large formality mismatch (${name1} vs ${name2}).` };
  return              { ok:false, score:1,  note:"Extreme formality clash — avoid." };
}

/**
 * Main outfit scorer.
 * Takes an array of items + context, returns a full score with breakdown.
 *
 * @param {Array<{name,color,pattern?,fit?,fabric?}>} items
 * @param {string} occasion
 * @param {string} weather - "hot"|"mid"|"cold"
 * @param {object} userProfile - { season?, bodyType?, archetype?, undertone?, skinDepth? }
 * @returns {{ totalScore, grade, breakdown, tips, outfitName }}
 */
function scoreOutfit(items, occasion="casual", weather="mid", userProfile={}) {
  const breakdown = [];
  const tips = [];
  let totalScore = 0, checks = 0;

  // ── 1. Color pairs ──
  const colorItems = items.filter(i=>i.color);
  for (let i=0; i<colorItems.length; i++) {
    for (let j=i+1; j<colorItems.length; j++) {
      const r = scoreColorPair(colorItems[i].color, colorItems[j].color, occasion);
      breakdown.push({ check:"Color", items:`${colorItems[i].color} + ${colorItems[j].color}`, ...r });
      totalScore+=r.score; checks++;
    }
  }

  // ── 2. Personal color season ──
  if (userProfile.undertone && userProfile.skinDepth) {
    const season = detectColorSeason(userProfile.undertone, userProfile.skinDepth);
    items.filter(i=>i.color).forEach(item=>{
      const adj = scoreColorForSeason(item.color, season);
      if (adj !== 0) {
        breakdown.push({
          check:"Personal color",
          items:item.color,
          score: 5 + adj,
          level: adj > 0 ? "great" : "caution",
          reason: adj > 0
            ? `${item.color} suits your ${season} color season.`
            : `${item.color} is on the avoid list for your ${season} season — consider alternatives.`,
        });
        totalScore += (5+adj); checks++;
      }
    });
  }

  // ── 3. Weather color penalty ──
  const wd = WEATHER[weather];
  if (wd?.heavyColorPenalty?.length>0) {
    items.filter(i=>i.color).forEach(item=>{
      if (wd.heavyColorPenalty.includes(item.color)) {
        breakdown.push({ check:"Weather",items:item.color, score:4, level:"caution",
          reason:`${item.color} absorbs heat — not ideal for hot weather.` });
        totalScore+=4; checks++;
      }
    });
  }

  // ── 4. Formality pairs ──
  const wearable = items.filter(i=>CLOTHING_ITEMS[i.name]);
  for (let i=0; i<wearable.length; i++) {
    for (let j=i+1; j<wearable.length; j++) {
      const isIntentional = INTENTIONAL_CONTRASTS.some(
        c=>(c.top===wearable[i].name&&c.bottom===wearable[j].name)||
           (c.top===wearable[j].name&&c.bottom===wearable[i].name)
      );
      if (isIntentional) {
        const contrast = INTENTIONAL_CONTRASTS.find(
          c=>(c.top===wearable[i].name&&c.bottom===wearable[j].name)||
             (c.top===wearable[j].name&&c.bottom===wearable[i].name)
        );
        breakdown.push({ check:"Formality", items:`${wearable[i].name} + ${wearable[j].name}`,
          score:9, level:"great", reason:contrast.note });
        totalScore+=9; checks++; continue;
      }
      const r = checkFormalityMatch(wearable[i].name, wearable[j].name);
      breakdown.push({ check:"Formality", items:`${wearable[i].name} + ${wearable[j].name}`, ...r });
      totalScore+=r.score; checks++;
    }
  }

  // ── 5. Shoe + bottom pairing ──
  const shoe   = items.find(i=>CLOTHING_ITEMS[i.name]?.category==="footwear");
  const bottom = items.find(i=>CLOTHING_ITEMS[i.name]?.role==="bottom");
  if (shoe && bottom) {
    const r = scoreShoeBottomPair(shoe.name, bottom.name);
    breakdown.push({ check:"Shoe pairing", items:`${shoe.name} + ${bottom.name}`, score:r.score,
      level:r.score>=8?"great":r.score>=5?"okay":"avoid", reason:r.note });
    totalScore+=r.score; checks++;
  }

  // ── 6. Pattern check ──
  const patterned = items.filter(i=>i.pattern&&i.pattern!=="solid");
  for (let i=0; i<patterned.length; i++) {
    for (let j=i+1; j<patterned.length; j++) {
      const r = canMixPatterns(patterned[i].pattern, patterned[j].pattern);
      breakdown.push({ check:"Pattern", items:`${patterned[i].pattern} + ${patterned[j].pattern}`,
        score:r.score, level:r.score>=7?"good":"avoid", reason:r.reason });
      totalScore+=r.score; checks++;
    }
  }

  // ── 7. Style archetype match ──
  if (userProfile.archetype) {
    const arch = scoreOutfitForArchetype(items, userProfile.archetype);
    if (arch.score !== 0) {
      breakdown.push({ check:"Style match", items:"Archetype alignment",
        score: Math.min(10, Math.max(0, 6 + arch.score)),
        level: arch.score > 0 ? "good" : "caution",
        reason: arch.score > 0
          ? `Suits your ${STYLE_ARCHETYPES[userProfile.archetype]?.label} style.`
          : arch.notes.join(" "),
      });
      totalScore += Math.min(10, Math.max(0, 6+arch.score)); checks++;
    }
  }

  // ── 8. Occasion tip ──
  const occasionData = OCCASIONS[occasion];
  if (occasionData) {
    tips.push(occasionData.tip);
    if (occasionData.keyRules?.[0]) tips.push(occasionData.keyRules[0]);
  }

  // ── 9. Weather tip ──
  if (wd?.tip) tips.push(wd.tip);

  // ── 10. Fit tip (context-aware) ──
  const names = items.map(i=>i.name.toLowerCase());
  const roles = items.map(i=>CLOTHING_ITEMS[i.name]?.role);
  
  const fitTips = [];
  if (names.some(n=>n.includes("oversized"))) {
    fitTips.push("Oversized tops work best with slim or straight-leg bottoms — never oversized on both.");
  }
  if (names.some(n=>n.includes("wide-leg"))) {
    fitTips.push("Wide-leg trousers need a tucked or cropped top — never untucked and loose.");
  }
  if (names.some(n=>n.includes("cropped"))) {
    fitTips.push("Cropped tops pair best with high-waisted bottoms.");
  }
  if (roles.includes("top") && (names.includes("trousers") || names.includes("chinos"))) {
    fitTips.push("Tuck in your shirt to define the waist and add polish.");
  }
  
  // Generic high-quality tips if nothing specific triggered
  if (fitTips.length === 0) {
    fitTips.push("The 1/3 – 2/3 proportion rule: one piece takes up 1/3 of the visual, the other 2/3.");
    fitTips.push("Monochromatic outfits (same color, different shades) look more expensive and elongating.");
  }
  
  tips.push(fitTips[Math.floor(Math.random() * fitTips.length)]);

  // ── 11. Vibe alignment bonus ──
  const vibes = OCCASION_VIBES[occasion];
  if (vibes && vibes.length > 0) {
    // Pick the best-matching vibe for this outfit
    let bestVibeScore = -Infinity, bestVibe = null;
    vibes.forEach(v => {
      const vs = scoreVibeAlignment(items, v);
      if (vs > bestVibeScore) { bestVibeScore = vs; bestVibe = v; }
    });
    if (bestVibeScore !== 0 && bestVibe) {
      const vibeNormalized = Math.min(10, Math.max(0, 5 + bestVibeScore));
      breakdown.push({ check:"Vibe", items:bestVibe, score:vibeNormalized,
        level: bestVibeScore > 0 ? "great" : "caution",
        reason: bestVibeScore > 0
          ? `Outfit aligns with "${bestVibe}" vibe — cohesive styling.`
          : `Outfit doesn't match target vibe "${bestVibe}" — consider adjustments.`,
      });
      totalScore += vibeNormalized; checks++;
    }
  }

  // ── 12. Statement piece bonus ──
  if (occasion !== "gym") {
    const hasStatement = hasStatementElement(items);
    const statementScore = hasStatement ? 8 : 3;
    breakdown.push({ check:"Statement", items:"Visual interest", score:statementScore,
      level: hasStatement ? "good" : "caution",
      reason: hasStatement
        ? "Outfit has visual interest — bold color, contrast, or layering."
        : "Outfit lacks visual distinction — all neutrals with no contrast.",
    });
    totalScore += statementScore; checks++;
  }

  const avg = checks > 0 ? Math.round((totalScore/checks)*10)/10 : 5;
  return {
    totalScore: avg,
    grade: avg>=8?"A": avg>=6?"B": avg>=4?"C":"D",
    breakdown,
    tips: [...new Set(tips.filter(Boolean))],
    outfitName: generateOutfitName(items, occasion),
  };
}


// ─────────────────────────────────────────────
// SECTION 16B: VALIDATION GATE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Deterministic statement piece detection.
 * An outfit MUST have at least one of:
 * 1. A high-saturation color (from COLOR_PROFILES)
 * 2. A lightness contrast between items (light vs dark)
 * 3. A layering element (role === "layer")
 * 4. Non-neutral color dominance (majority of items are non-neutral)
 *
 * Returns false if outfit is "too flat" (all neutrals, no contrast, no interest)
 */
function hasStatementElement(items) {
  const colorItems = items.filter(i => i.color && COLOR_PROFILES[i.color]);

  // Check 1: Any high-saturation color?
  const hasHighSat = colorItems.some(i => COLOR_PROFILES[i.color]?.saturation === "high");
  if (hasHighSat) return true;

  // Check 2: Has a layering element?
  const hasLayer = items.some(i => CLOTHING_ITEMS[i.name]?.role === "layer");
  if (hasLayer) return true;

  // Check 3: Non-neutral dominance (at least 2 non-neutral pieces or 1 if it's the top)?
  const nonNeutrals = colorItems.filter(i => !COLOR_PROFILES[i.color]?.neutral);
  if (nonNeutrals.length >= 2) return true;
  if (nonNeutrals.length === 1 && items.find(i => i.color === nonNeutrals[0].color && CLOTHING_ITEMS[i.name]?.role === "top")) return true;

  // Check 5: Mid-saturation color present (non-neutral)?
  const hasMidSat = colorItems.some(i => COLOR_PROFILES[i.color]?.saturation === "mid" && !COLOR_PROFILES[i.color]?.neutral);
  if (hasMidSat) return true;

  // All checks failed — outfit is flat
  return false;
}

/**
 * Real-world constraint validation — runs FIRST before any scoring.
 * Returns { valid: boolean, reason: string }
 */
function validateOutfitConstraints(items, occasion, weather) {
  const wd = WEATHER[weather];

  // 1. Must have shoes
  const hasShoes = items.some(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
  if (!hasShoes && items.length > 0) {
    return { valid: false, reason: "Missing shoes — every outfit needs footwear." };
  }

  // 2. Cold weather must have layer
  if (weather === "cold" && wd?.layerRequired && occasion !== "gym") {
    const hasLayer = items.some(i => CLOTHING_ITEMS[i.name]?.role === "layer");
    if (!hasLayer) {
      return { valid: false, reason: "Cold weather requires an outer layer (jacket, blazer, coat, etc.)." };
    }
  }

  // 3. Hot weather must not have heavy items
  if (weather === "hot" && wd) {
    const hasBanned = items.some(i => wd.bannedItems.includes(i.name));
    if (hasBanned) {
      return { valid: false, reason: "Hot weather outfit contains heavy/banned items." };
    }
  }

  // 4. Business formal must have formal shoes (formality >= 4)
  if (occasion === "business formal") {
    const shoe = items.find(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
    if (shoe && (CLOTHING_ITEMS[shoe.name]?.formality || 0) < 4) {
      return { valid: false, reason: "Business formal requires formal shoes (oxford, derby, monk straps)." };
    }
  }

  // 5. Gym must only have athletic items
  if (occasion === "gym") {
    const nonAthletic = items.filter(i => {
      const ci = CLOTHING_ITEMS[i.name];
      if (!ci) return false;
      if (ci.role === "top" && !GYM_ALLOWED.tops.includes(i.name)) return true;
      if (ci.role === "bottom" && !GYM_ALLOWED.bottoms.includes(i.name)) return true;
      if (ci.category === "footwear" && !GYM_ALLOWED.shoes.includes(i.name)) return true;
      return false;
    });
    if (nonAthletic.length > 0) {
      return { valid: false, reason: `Gym outfit contains non-athletic items: ${nonAthletic.map(i=>i.name).join(", ")}` };
    }
  }

  // 6. Statement piece check — reject "all flat" outfits for non-gym occasions
  if (occasion !== "gym" && !hasStatementElement(items)) {
    return { valid: false, reason: "Outfit is too flat — needs at least one bold color, contrast, or layering element." };
  }

  return { valid: true, reason: "OK" };
}

/**
 * Occasion-specific validation — HARD REJECTS for contextually wrong outfits.
 * Returns { valid: boolean, reason: string }
 */
function validateOccasionConstraints(items, occasion) {
  const names = items.map(i => i.name);
  const colors = items.map(i => i.color).filter(Boolean);

  // PARTY & DATE NIGHT: strict rejection of boring office outfits
  if (occasion === "party" || occasion === "date night") {
    const isOfficeBasic =
      names.includes("shirt") &&
      (names.includes("chinos") || names.includes("trousers")) &&
      !names.some(n => ["blazer","leather jacket","bomber jacket","turtleneck","hoodie","overcoat","silk blouse"].includes(n));

    const officeColors = ["white","beige","light blue","cream","gray"];
    const hasOnlyOfficeColors = colors.every(c => officeColors.includes(c));
    
    if (isOfficeBasic) {
      if (occasion === "party" && (hasOnlyOfficeColors || colors.includes("navy"))) {
        return { valid: false, reason: "Party outfit too basic/office — needs bolder colors, dark tones, or a statement piece." };
      }
      if (occasion === "date night" && hasOnlyOfficeColors) {
        return { valid: false, reason: "Date night shouldn't look like office wear — add darker palettes, layering, or texture." };
      }
    }
  }

  // WEDDING GUEST: require at least one elevated element
  if (occasion === "wedding guest") {
    const elevatedItems = ["kurta","sherwani","bandhgala","blazer","suit jacket","nehru jacket",
                           "bandhgala jacket","achkan","formal dress","suit","trench coat","overcoat",
                           "dress shirt","silk blouse","formal jumpsuit"];
    const hasElevated = names.some(n => elevatedItems.includes(n));
    if (!hasElevated) {
      return { valid: false, reason: "Wedding guest outfit needs at least one elevated piece (blazer, kurta, sherwani, bandhgala, etc.)." };
    }
  }

  // FESTIVAL: require at least one rich element (bold color OR elevated item)
  if (occasion === "festival") {
    const cultural = CULTURAL_OCCASION_RULES.festival;
    if (cultural.requireRichElement) {
      const hasBoldColor = colors.some(c => {
        const prof = COLOR_PROFILES[c];
        return prof && (prof.saturation === "high" || cultural.colorBias.includes(c));
      });
      const hasElevatedItem = names.some(n =>
        ["sherwani","bandhgala","bandhgala jacket","achkan","nehru jacket"].includes(n)
      );
      const hasLayer = names.some(n => CLOTHING_ITEMS[n]?.role === "layer");
      if (!hasBoldColor && !hasElevatedItem && !hasLayer) {
        return { valid: false, reason: "Festival outfit needs vibrancy — add a bold color, richer item, or layering element." };
      }
    }
  }

  // PUJA: reject heavy/flashy elements
  if (occasion === "pooja / puja") {
    const cultural = CULTURAL_OCCASION_RULES["pooja / puja"];
    if (cultural.requireSimple) {
      const flashyItems = ["sherwani","bandhgala","leather jacket","bomber jacket","graphic tee"];
      const hasFlashy = names.some(n => flashyItems.includes(n));
      if (hasFlashy) {
        return { valid: false, reason: "Puja outfit should be simple and conservative — avoid flashy or heavy pieces." };
      }
    }
    // Soft check: avoid dark/bold colors
    if (cultural.colorAvoid.length > 0) {
      const hasBanned = colors.some(c => cultural.colorAvoid.includes(c));
      if (hasBanned && colors.length > 0) {
        return { valid: false, reason: "Puja outfit should use light, simple colors (white, cream, yellow, gold) and avoid black/neon." };
      }
    }
  }

  return { valid: true, reason: "OK" };
}

/**
 * Generate a unique signature for an outfit to detect duplicates.
 * Tracks: item names sorted + colors sorted = structural identity.
 */
function getOutfitSignature(items) {
  const namesSorted = items.map(i => i.name).sort().join("|");
  const colorsSorted = items.map(i => i.color || "?").sort().join("|");
  return `${namesSorted}::${colorsSorted}`;
}

/**
 * Get the template ID that best matches an outfit's composition.
 * Used for diversity — ensuring different templates per batch slot.
 */
function detectOutfitTemplate(items, occasion) {
  const templates = OUTFIT_TEMPLATES[occasion];
  if (!templates) return "unknown";
  const names = items.map(i => i.name);

  for (const tpl of templates) {
    const topMatch = names.some(n => tpl.top.includes(n));
    const bottomMatch = names.some(n => tpl.bottom.includes(n));
    if (topMatch && bottomMatch) return tpl.id;
  }
  return "unknown";
}

/**
 * Score vibe alignment for an outfit.
 * Returns a bonus score (0 to +6) based on how well the outfit
 * matches the selected vibe's preferences.
 */
function scoreVibeAlignment(items, vibeKey) {
  const pref = VIBE_PREFERENCES[vibeKey];
  if (!pref) return 0;

  let bonus = 0;
  items.forEach(item => {
    // Color alignment
    if (item.color && pref.preferColors.includes(item.color)) bonus += 1;
    if (item.color && pref.avoidColors.includes(item.color)) bonus -= 2;
    // Item alignment
    if (pref.preferItems.includes(item.name)) bonus += 1;
  });

  return Math.max(-4, Math.min(6, bonus));
}


// ─────────────────────────────────────────────
// SECTION 17: OUTFIT SUGGESTION ENGINE
// ─────────────────────────────────────────────

/**
 * suggestOutfits — generates diverse, validated outfit suggestions.
 *
 * 7-TIER PIPELINE:
 * 1. Hard constraints (weather, footwear, gym whitelist)
 * 2. Occasion constraints (hard rejects for party/date/wedding/festival/puja)
 * 3. Vibe-controlled filtering (preferred colors/items get priority)
 * 4. Template diversity (different outfit structures per batch slot)
 * 5. Color diversity (no repeated top colors, penalize overused neutrals)
 * 6. Statement piece validation (reject "flat" outfits)
 * 7. Scoring (vibe alignment + statement bonus + standard scoring)
 *
 * @param {Array<{name,color,pattern?,fit?,fabric?}>} wardrobe
 * @param {string} occasion
 * @param {string} weather - "hot"|"mid"|"cold"
 * @param {object} userProfile - { season?, bodyType?, archetype?, undertone?, skinDepth? }
 * @returns {Array<OutfitSuggestion>} top 3 diverse outfit suggestions
 */
function suggestOutfits(wardrobe, occasion="casual", weather="mid", userProfile={}) {
  const strictOccasion = String(occasion || "casual").toLowerCase().trim();
  const strictWeather = String(weather || "mid").toLowerCase().trim();
  const strictFloor = 8.5;
  const gradedFloor = 6.5;

  const buildAdvisorResponse = (message, code, extra = {}) => {
    const gapsInfo = analyzeWardrobeGaps(wardrobe, strictOccasion, strictWeather, userProfile);
    const actionableGaps = (gapsInfo.gaps || []).filter(g => g !== "Wardrobe is well-rounded for this occasion.");
    const structuredSuggestions = Array.isArray(gapsInfo.suggestedItems) && gapsInfo.suggestedItems.length > 0
      ? gapsInfo.suggestedItems
      : actionableGaps.map(g => ({
          tip: g.split(" — ")[0],
          reason: g.includes(" — ") ? g.split(" — ")[1] : "This will open up new outfit possibilities."
        }));
    return {
      success: false,
      code,
      advisorFeedback: {
        message,
        missingCategories: actionableGaps.map(g => g.split(" — ")[0]),
        reasonCodes: [...new Set([...(gapsInfo.reasonCodes || []), code].filter(Boolean))],
        suggestedItems: structuredSuggestions.length > 0
          ? structuredSuggestions
          : [{
              tip: "Add pieces aligned to the target vibe and occasion.",
              reason: "Strict Excellence mode rejects low-confidence and flat combinations."
            }],
        topRecommendation: gapsInfo.topRecommendation || "Add one elevated top, one occasion-correct bottom, and one statement-capable layer.",
        ...extra,
      }
    };
  };

  const genderPref = userProfile?.gender || "Other";
  const genderFilteredWardrobe = filterByGender(wardrobe, genderPref);

  const accessories  = genderFilteredWardrobe.filter(i => CLOTHING_ITEMS[i.name]?.role === "accessory");
  const clothingOnly = genderFilteredWardrobe.filter(i => CLOTHING_ITEMS[i.name]?.role !== "accessory");

  const weatherFiltered = filterByWeather(clothingOnly, strictWeather);
  const occasionFiltered = filterByOccasion(weatherFiltered, strictOccasion);
  const filteredAccessories = filterByOccasion(accessories, strictOccasion);

  let tops, bottoms, layers, shoes, fulls;
  if (strictOccasion === "gym") {
    tops = occasionFiltered.filter(i => GYM_ALLOWED.tops.includes(i.name));
    bottoms = occasionFiltered.filter(i => GYM_ALLOWED.bottoms.includes(i.name));
    shoes = occasionFiltered.filter(i => GYM_ALLOWED.shoes.includes(i.name));
    layers = strictWeather === "cold"
      ? occasionFiltered.filter(i => ["hoodie", "sweatshirt", "zip hoodie"].includes(i.name))
      : [];
    fulls = [];
  } else if (strictOccasion === "business formal") {
    tops = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "top");
    bottoms = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "bottom");
    layers = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "layer");
    shoes = occasionFiltered.filter(i =>
      CLOTHING_ITEMS[i.name]?.category === "footwear" && (CLOTHING_ITEMS[i.name]?.formality || 0) >= 4
    );
    fulls = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "full");
  } else {
    tops = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "top");
    bottoms = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "bottom");
    layers = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "layer");
    shoes = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
    fulls = occasionFiltered.filter(i => CLOTHING_ITEMS[i.name]?.role === "full");
  }

  if (tops.length === 0 || (bottoms.length === 0 && fulls.length === 0)) {
    return buildAdvisorResponse(
      `Strict Excellence: no ${strictOccasion} outfits meet both ${strictWeather} weather and occasion rules with your current wardrobe.`,
      "NO_STRICT_MATCH"
    );
  }

  const targetVibes = (OCCASION_VIBES[strictOccasion] || []).filter(Boolean);
  if (targetVibes.length === 0) {
    return buildAdvisorResponse(
      `No vibe profile configured for ${strictOccasion}. Add occasion-to-vibe anchors before generating suggestions.`,
      "NO_VIBE_PROFILE"
    );
  }

  const feasibleVibes = targetVibes.filter(vibeKey => {
    const pref = getVibePreferences(vibeKey);
    if (!pref) return false;
    const hasPreferredItem = occasionFiltered.some(i => pref.preferItems.includes(i.name));
    const hasPreferredColor = occasionFiltered.some(i => i.color && pref.preferColors.includes(i.color));
    return hasPreferredItem && hasPreferredColor;
  });

  if (feasibleVibes.length === 0) {
    return buildAdvisorResponse(
      `Strict Excellence: your wardrobe cannot satisfy the target ${strictOccasion} vibe anchors (${targetVibes.join(", ")}).`,
      "VIBE_GAP",
      { targetVibes }
    );
  }

  const rankByVibe = (itemsArr, vibePref) => {
    if (!vibePref) return itemsArr;
    return [...itemsArr].sort((a, b) => {
      const scoreItem = (item) => {
        let score = 0;
        if (vibePref.preferItems.includes(item.name)) score += 6;
        if (item.color && vibePref.preferColors.includes(item.color)) score += 5;
        if (item.color && vibePref.avoidColors.includes(item.color)) score -= 4;
        return score;
      };
      return scoreItem(b) - scoreItem(a);
    });
  };

  const isSameGarment = (a, b) => {
    if (!a || !b) return false;
    const aId = a._dbItem?._id ? String(a._dbItem._id) : null;
    const bId = b._dbItem?._id ? String(b._dbItem._id) : null;
    if (aId && bId) return aId === bId;
    return a.name === b.name && (a.color || "") === (b.color || "");
  };

  const allCombos = [];
  const gradedFallbackMode = feasibleVibes.length === 0;
  const darkRomanticismFallback = targetVibes.includes("Dark Romanticism") && gradedFallbackMode;
  const vibeSearchKeys = gradedFallbackMode ? [targetVibes[0] || "Clean Casual"] : feasibleVibes;
  vibeSearchKeys.forEach(vibeKey => {
    const vibePref = gradedFallbackMode ? null : getVibePreferences(vibeKey);
    const sortedTops = rankByVibe(tops, vibePref);
    const sortedBottoms = rankByVibe(bottoms, vibePref);
    const sortedShoes = rankByVibe(shoes, vibePref);
    const sortedLayers = rankByVibe(layers, vibePref);

    sortedTops.forEach(top => {
      sortedBottoms.forEach(bottom => {
        const usableLayers = strictWeather === "hot"
          ? [null]
          : [null, ...sortedLayers.filter(layer => !isSameGarment(layer, top))];

        usableLayers.forEach(layer => {
          const base = layer ? [top, bottom, layer] : [top, bottom];
          const shoePairing = SHOE_PAIRING[bottom.name];
          const avoidSet = new Set(Array.isArray(shoePairing?.avoid) ? shoePairing.avoid : []);
          const shoeCandidates = shoePairing
            ? sortedShoes.filter(shoe => !avoidSet.has(shoe.name))
            : sortedShoes;

          let bestCandidate = null;
          shoeCandidates.forEach(shoe => {
            const finalItems = [...base, shoe];
            const gate = validateOutfitConstraints(finalItems, strictOccasion, strictWeather);
            if (!gate.valid) return;
            const occasionGate = validateOccasionConstraints(finalItems, strictOccasion);
            if (!occasionGate.valid) return;
            if (!gradedFallbackMode && strictOccasion !== "gym" && !hasStatementElement(finalItems)) return;

            const scored = scoreOutfit(finalItems, strictOccasion, strictWeather, userProfile);
            if (scored.totalScore < gradedFloor) return;

            const vibeAlignment = gradedFallbackMode ? 0 : scoreVibeAlignment(finalItems, vibeKey);
            if (!gradedFallbackMode && vibeAlignment <= 0) return;

            const templateId = detectOutfitTemplate(finalItems, strictOccasion);
            if (templateId === "unknown") return;

            const rank = scored.totalScore + (gradedFallbackMode ? 0 : vibeAlignment * 0.35);
            if (!bestCandidate || rank > bestCandidate.rank) {
              bestCandidate = {
                items: finalItems,
                score: scored,
                accessories: suggestAccessories(finalItems, filteredAccessories, strictOccasion, strictWeather),
                selectedVibe: gradedFallbackMode ? (targetVibes[0] || "Clean Casual") : vibeKey,
                templateId,
                signature: getOutfitSignature(finalItems),
                vibeAlignment,
                rank,
                fallbackVibeNote: darkRomanticismFallback && vibeKey === (targetVibes[0] || "Clean Casual")
                  ? "To unlock the 'Dark Romanticism' vibe for this occasion, add a 'burgundy sweater' or 'black blazer' to your closet."
                  : null,
              };
            }
          });

          if (bestCandidate) allCombos.push(bestCandidate);
        });
      });
    });

    fulls.forEach(full => {
      const layerOptions = strictWeather === "hot" ? [null] : [null, ...sortedLayers];
      layerOptions.forEach(layer => {
        const base = layer ? [full, layer] : [full];
        let bestCandidate = null;

        sortedShoes.forEach(shoe => {
          const finalItems = [...base, shoe];
          const gate = validateOutfitConstraints(finalItems, strictOccasion, strictWeather);
          if (!gate.valid) return;
          const occasionGate = validateOccasionConstraints(finalItems, strictOccasion);
          if (!occasionGate.valid) return;
          if (!gradedFallbackMode && strictOccasion !== "gym" && !hasStatementElement(finalItems)) return;

          const scored = scoreOutfit(finalItems, strictOccasion, strictWeather, userProfile);
          if (scored.totalScore < gradedFloor) return;

          const vibeAlignment = gradedFallbackMode ? 0 : scoreVibeAlignment(finalItems, vibeKey);
          if (!gradedFallbackMode && vibeAlignment <= 0) return;

          const templateId = detectOutfitTemplate(finalItems, strictOccasion);
          if (templateId === "unknown") return;

          const rank = scored.totalScore + (gradedFallbackMode ? 0 : vibeAlignment * 0.35);
          if (!bestCandidate || rank > bestCandidate.rank) {
            bestCandidate = {
              items: finalItems,
              score: scored,
              accessories: suggestAccessories(finalItems, filteredAccessories, strictOccasion, strictWeather),
              selectedVibe: gradedFallbackMode ? (targetVibes[0] || "Clean Casual") : vibeKey,
              templateId,
              signature: getOutfitSignature(finalItems),
              vibeAlignment,
              rank,
              fallbackVibeNote: darkRomanticismFallback && vibeKey === (targetVibes[0] || "Clean Casual")
                ? "To unlock the 'Dark Romanticism' vibe for this occasion, add a 'burgundy sweater' or 'black blazer' to your closet."
                : null,
            };
          }
        });

        if (bestCandidate) allCombos.push(bestCandidate);
      });
    });
  });

  if (allCombos.length === 0) {
    return buildAdvisorResponse(
      `No graded fits reached the 6.5 baseline for ${strictOccasion} in ${strictWeather} weather.`,
      "STRICT_QUALITY_REJECTION",
      { targetVibes: gradedFallbackMode ? [targetVibes[0] || "Clean Casual"] : feasibleVibes }
    );
  }

  const bySignature = new Map();
  allCombos.forEach(combo => {
    const current = bySignature.get(combo.signature);
    if (!current || combo.rank > current.rank) bySignature.set(combo.signature, combo);
  });

  const deduped = [...bySignature.values()].sort((a, b) => b.rank - a.rank);
  const result = [];

  for (const combo of deduped) {
    if (result.length >= 3) break;
    const confidence = Math.max(60, Math.min(99, Math.round(combo.score.totalScore * 10)));
    result.push({
      ...combo,
      confidence,
      visualRating: getVisualRating(combo.score.totalScore),
      relaxedMatch: false,
      relaxationReasons: [],
    });
  }

  if (result.length === 0) {
    return buildAdvisorResponse(
      `No graded fits reached the 6.5 baseline for ${strictOccasion}.`,
      "NO_GRADED_FITS",
      { targetVibes: gradedFallbackMode ? [targetVibes[0] || "Clean Casual"] : feasibleVibes }
    );
  }

  const roadmap = analyzeWardrobeGaps(wardrobe, strictOccasion, strictWeather, userProfile);
  result.advisorFeedback = roadmap.advisorFeedback || {
    message: roadmap.topRecommendation || "Stylist's Roadmap: sharpen the weakest category to raise the whole outfit tier.",
    missingCategories: roadmap.gaps || [],
    reasonCodes: roadmap.reasonCodes || [],
    suggestedItems: roadmap.suggestedItems || [],
    topRecommendation: roadmap.topRecommendation || "Add one elevated piece to move the outfit up a tier.",
    targetVibes: gradedFallbackMode ? [targetVibes[0] || "Clean Casual"] : feasibleVibes,
    bestScore: roadmap.strictBestScore,
    visualRating: getVisualRating(roadmap.strictBestScore ?? result[0].score.totalScore),
    bestCombo: roadmap.bestCombo || [],
  };

  return result;
}

// ── GENDER FILTERS ──
const WOMEN_ONLY = new Set([
  'crop top', 'blouse', 'silk blouse', 'bodysuit', 'bra', 'sports bra', 'bralette',
  'dress', 'sundress', 'slip dress', 'maxi dress', 'bodycon dress', 'wrap dress', 'sweater dress',
  'skirt', 'mini skirt', 'midi skirt', 'maxi skirt', 'slip skirt', 'tennis skirt',
  'leggings', 'jeggings', 'yoga pants',
  'flats', 'ballet flats', 'heels', 'strappy heels', 'wedges', 'stiletto', 'mary janes', 'block heels',
  'knee high boots', 'thigh high boots', 'ankle boots', 'knee boots',
  'purse', 'handbag', 'clutch', 'tote bag', 'crossbody bag',
  'bikini', 'swimsuit', 'one-piece'
]);

const MEN_ONLY = new Set([
  'briefs', 'boxers', 'tie', 'bowtie'
]);

function filterByGender(items, genderStr) {
  if (!genderStr || genderStr === 'Other' || genderStr === '') return items;
  return items.filter(item => {
    let rawName = typeof item === 'string' ? item : item.name;
    if (genderStr.toLowerCase() === 'woman') {
      return !MEN_ONLY.has(rawName);
    } else if (genderStr.toLowerCase() === 'man') {
      return !WOMEN_ONLY.has(rawName);
    }
    return true;
  });
}

function filterByWeather(items, weather) {
  const w = (weather || "mid").toLowerCase().trim();
  const wd = WEATHER[w];
  if (!wd) return items;
  return items.filter(item=>{
    const ci = CLOTHING_ITEMS[item.name];
    if (!ci) return true;
    if (wd.bannedCategories.includes(ci.category)) return false;
    if (wd.bannedItems.includes(item.name)) return false;
    if (ci.weatherOk && !ci.weatherOk.includes(w)) return false;
    return true;
  });
}

/**
 * Hard-filter items by occasion.
 * Items whose occasionOk array does NOT include the target occasion
 * are completely removed BEFORE combinations are generated.
 */
function filterByOccasion(items, occasion) {
  return items.filter(item => {
    const ci = CLOTHING_ITEMS[item.name];
    const perItemOccasion = Array.isArray(item.occasionOk) ? item.occasionOk : null;
    if (!ci) return true; // unknown item, keep it
    if (perItemOccasion) {
      return perItemOccasion.includes((occasion || "casual").toLowerCase().trim());
    }
    if (!ci.occasionOk) return true; // no rule defined, keep it
    return ci.occasionOk.includes((occasion || "casual").toLowerCase().trim());
  });
}

function generateOutfitName(items, occasion) {
  const map = {
    casual:          ["Laid-back cool","Easy everyday","Effortless casual","Off-duty style"],
    office:          ["Boardroom ready","Sharp and clean","Power outfit","Professional edge"],
    "business formal":["Executive look","Boardroom authority","Sharp formal","Polished professional"],
    party:           ["Night out energy","Bold evening","Stand-out style","Party ready"],
    "date night":    ["Refined evening","Clean and confident","Subtle and sharp","Date night edge"],
    gym:             ["Active essentials","Workout mode","Athletic edge"],
    "wedding guest": ["Celebratory elegance","Festive formal","Event-ready","Wedding polish"],
    ethnic:          ["Traditional elegance","Cultural pride","Festive fit","Heritage look"],
    "pooja / puja":  ["Respectful traditional","Spiritual grace"],
    festival:        ["Festive energy","Celebratory traditional","Festival ready"],
  };
  const names = map[occasion] || ["Outfit suggestion"];
  return names[Math.floor(Math.random()*names.length)];
}

function getVisualRating(totalScore) {
  if (totalScore >= 8.5) return "10/10 Masterpiece";
  if (totalScore >= 7.5) return "8/10 Professional";
  if (totalScore >= 6.5) return "6/10 Baseline";
  return "Discard";
}


// ─────────────────────────────────────────────
// SECTION 18: WARDROBE GAP ANALYSIS
// ─────────────────────────────────────────────

/**
 * Given a wardrobe, identify what single item would unlock the most
 * new outfit combinations.
 *
 * This is the "what should I buy next" feature.
 *
 * @param {Array<{name,color,pattern}>} wardrobe
 * @param {string} occasion
 * @param {string} weather
 * @returns {{ gaps: string[], topRecommendation: string, reason: string }}
 */
function analyzeWardrobeGaps(wardrobe, occasion="casual", weather="mid", userProfile={}) {
  const genderPref = userProfile?.gender || "Other";
  const genderFilteredWardrobe = filterByGender(wardrobe, genderPref);
  const strictOccasion = String(occasion || "casual").toLowerCase().trim();
  const strictWeather = String(weather || "mid").toLowerCase().trim();
  const qualityFloor = 8.5;

  const clothingOnly = filterByWeather(genderFilteredWardrobe.filter(i=>CLOTHING_ITEMS[i.name]?.role!=="accessory"), strictWeather);
  const tops    = clothingOnly.filter(i=>CLOTHING_ITEMS[i.name]?.role==="top");
  const bottoms = clothingOnly.filter(i=>CLOTHING_ITEMS[i.name]?.role==="bottom");
  const shoes   = clothingOnly.filter(i=>CLOTHING_ITEMS[i.name]?.category==="footwear");
  const layers  = clothingOnly.filter(i=>CLOTHING_ITEMS[i.name]?.role==="layer");

  const gaps = [];
  const reasonCodes = [];
  const occasionData = OCCASIONS[strictOccasion];
  const formalityMin = occasionData?.formalityRange?.[0] || 1;
  const formalityMax = occasionData?.formalityRange?.[1] || 5;
  const suggestedItems = [];
  const targetVibes = OCCASIONS[strictOccasion]?.targetVibes || OCCASION_VIBES[strictOccasion] || [];

  const formalFootwearNames = ["oxford shoes", "derby shoes", "monk straps", "loafers"];
  const hasFormalFootwear = shoes.some(s => {
    const f = CLOTHING_ITEMS[s.name]?.formality || 0;
    return f >= 4 || formalFootwearNames.includes(s.name);
  });

  // 1. Missing categories check
  if (tops.length === 0) {
    gaps.push("No tops — add a white tee or light shirt to start");
    reasonCodes.push("missing_required_category");
    suggestedItems.push({ tip: "Crisp White Shirt", reason: "A white shirt unlocks office, business formal, and date-night combinations." });
  }
  if (bottoms.length === 0) {
    gaps.push("No bottoms — jeans or chinos will pair with most tops");
    reasonCodes.push("missing_required_category");
    suggestedItems.push({ tip: "Charcoal Trousers", reason: "A formal-ready bottom is needed to clear strict scoring and formality gates." });
  }
  if (shoes.length === 0) {
    gaps.push("No shoes — white sneakers are the most versatile pick");
    reasonCodes.push("missing_required_category");
    suggestedItems.push({ tip: "White Leather Sneakers", reason: "Improves casual and smart-casual coverage with immediate versatility." });
  }

  // 2. Specific occasion gaps
  const suitableTops = tops.filter(t =>
    CLOTHING_ITEMS[t.name]?.formality >= formalityMin &&
    CLOTHING_ITEMS[t.name]?.formality <= formalityMax
  );
  if (suitableTops.length === 0 && tops.length > 0) {
    const rec = occasionData?.preferredItems?.find(i => CLOTHING_ITEMS[i]?.role === "top");
    if (rec) gaps.push(`Need a dressier top — try adding a ${rec}`);
    reasonCodes.push("insufficient_formality_match");
    if (rec) {
      suggestedItems.push({ tip: rec, reason: `Current tops are below the required formality floor (${formalityMin}-${formalityMax}).` });
    }
  }

  // 3. Formal shoes check
  if (shoes.length > 0 && formalityMax >= 4) {
    if (!hasFormalFootwear) {
      gaps.push("No formal shoes — loafers or oxfords needed for this occasion");
      reasonCodes.push("missing_required_category");
      suggestedItems.push({ tip: "oxford shoes / derby shoes", reason: "Without formal footwear, strict office/business-formal scores cannot cross 8.5." });
    }
  }

  // 4. Color bans (Pooja/Funeral etc)
  if (occasionData?.bannedColors && wardrobe.length > 0) {
    const hasOnlyBanned = wardrobe.every(i => i.color && i.role !== "accessory" && occasionData.bannedColors.includes(i.color));
    if (hasOnlyBanned) {
      gaps.push(`Only ${occasionData.bannedColors.join(", ")} in closet — ${strictOccasion} looks better in lighter or brighter colours`);
      reasonCodes.push("color_constraint_violation");
    }
  }

  // 5. Missing layer for cold weather
  if (strictWeather === "cold" && layers.length === 0) {
    gaps.push("No jacket or coat — add an overcoat or blazer for cold weather");
    suggestedItems.push({ tip: "Navy Blazer", reason: "Adds structure and statement depth for cold-weather scoring." });
  }

  // Strict Excellence Expert Critique: identify why 8.5 floor fails.
  let bestScore = -Infinity;
  let bestCombo = null;
  let bestScored = null;
  const scoredOccasionItems = filterByOccasion(clothingOnly, strictOccasion);
  const scoredTops = scoredOccasionItems.filter(i => CLOTHING_ITEMS[i.name]?.role === "top");
  const scoredBottoms = scoredOccasionItems.filter(i => CLOTHING_ITEMS[i.name]?.role === "bottom");
  const scoredShoes = scoredOccasionItems.filter(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
  const scoredLayers = scoredOccasionItems.filter(i => CLOTHING_ITEMS[i.name]?.role === "layer");

  const topPool = scoredTops.slice(0, 15);
  const bottomPool = scoredBottoms.slice(0, 15);
  const shoePool = scoredShoes.slice(0, 10);
  const layerPool = [null, ...scoredLayers.slice(0, 8)];

  topPool.forEach(top => {
    bottomPool.forEach(bottom => {
      shoePool.forEach(shoe => {
        layerPool.forEach(layer => {
          const items = layer ? [top, bottom, layer, shoe] : [top, bottom, shoe];
          const gate = validateOutfitConstraints(items, strictOccasion, strictWeather);
          if (!gate.valid) return;
          const occGate = validateOccasionConstraints(items, strictOccasion);
          if (!occGate.valid) return;
          const sc = scoreOutfit(items, strictOccasion, strictWeather, userProfile).totalScore;
          if (sc > bestScore) {
            bestScore = sc;
            bestCombo = items;
            bestScored = scoreOutfit(items, strictOccasion, strictWeather, userProfile);
          }
        });
      });
    });
  });

  if (bestScore > -Infinity && bestScore < qualityFloor) {
    reasonCodes.push("strict_quality_failure");

    const hasFoundationShirt = tops.some(t => ["shirt", "dress shirt", "oxford shirt", "t-shirt"].includes(t.name));
    const hasFoundationTrouser = bottoms.some(b => ["trousers", "dress trousers", "chinos"].includes(b.name));
    const hasBlazer = [...tops, ...layers].some(i => i.name === "blazer");

    const visualRating = getVisualRating(bestScore);
    let missingPiece = "a stronger statement piece";
    let missingCategory = "styling depth";
    let missingReason = `Best available combination scores ${bestScore.toFixed(1)}, below the strict ${qualityFloor} floor.`;
    let weakLink = "statement depth";
    let targetVibe = targetVibes[0] || occasionData?.label || strictOccasion;

    if (formalityMin >= 4 && !hasFormalFootwear) {
      missingPiece = "oxford shoes / derby shoes";
      missingCategory = "footwear";
      missingReason = "Without formal footwear, the look remains incomplete for strict business/formal scoring.";
      weakLink = "footwear formality";
      if (!suggestedItems.some(s => s.tip.includes("oxford shoes") || s.tip.includes("derby shoes"))) {
        suggestedItems.push({ tip: "oxford shoes / derby shoes", reason: "Mandatory for an 8.5+ office/business formal outcome." });
      }
    } else if ((strictOccasion === "office" || strictOccasion === "business formal") && !hasBlazer) {
      missingPiece = "Structured Layer (Navy Blazer)";
      missingCategory = "layer";
      missingReason = "A blazer is required to push authority and statement scores above the strict floor.";
      weakLink = "silhouette structure";
      if (!suggestedItems.some(s => s.tip.toLowerCase().includes("blazer"))) {
        suggestedItems.push({ tip: "Navy Blazer", reason: "Creates a sharp template and unlocks higher-formality combinations." });
      }
    } else if (strictOccasion === "gym" && !shoePool.some(s => ["running shoes", "sneakers", "white sneakers"].includes(s.name))) {
      missingPiece = "Performance Sneakers";
      missingCategory = "footwear";
      missingReason = "Gym scoring penalizes non-performance footwear heavily.";
      weakLink = "athletic footwear";
      if (!suggestedItems.some(s => s.tip.toLowerCase().includes("sneaker"))) {
        suggestedItems.push({ tip: "White Leather Sneakers", reason: "Improves both gym and casual strict-score combinations." });
      }
    }

    const foundationBits = [];
    if (hasFoundationTrouser) foundationBits.push("Trousers");
    if (hasFoundationShirt) foundationBits.push("Shirt");
    const foundationLabel = foundationBits.length > 0 ? foundationBits.join(" & ") : "the foundation";

    let expertCritique = `This ${visualRating} outfit is a solid base, but it lacks '${missingPiece}' to reach the 10/10 '${targetVibe}' status. Your current ${missingCategory} is pulling the score down.`;
    if (formalityMin >= 4 && !hasFormalFootwear) {
      expertCritique = `This ${visualRating} outfit is a solid base, but it lacks '${missingPiece}' to reach the 10/10 '${targetVibe}' status. Your current footwear is pulling the formality score down.`;
    } else if (bestScored?.breakdown?.length) {
      const weakest = [...bestScored.breakdown].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
      if (weakest?.check && weakest?.items) {
        expertCritique = `This ${visualRating} outfit is a solid base, but ${weakest.check.toLowerCase()} on '${weakest.items}' is limiting it from reaching 10/10 '${targetVibe}'. The ${weakest.check.toLowerCase()} score is the current weak link.`;
      }
    }
    gaps.unshift(`Missing: ${missingPiece}`);
    gaps.unshift(expertCritique);
  }

  const occasionDepthRules = {
    gym: ["top", "bottom", "shoes"],
    office: ["top", "bottom", "shoes", "layer"],
    "business formal": ["top", "bottom", "shoes", "layer"],
    "date night": ["top", "bottom", "shoes"],
    party: ["top", "bottom", "shoes"],
    casual: ["top", "bottom", "shoes"],
    ethnic: ["top", "bottom", "shoes"],
    "pooja / puja": ["top", "bottom", "shoes"],
    festival: ["top", "bottom", "shoes"],
    "wedding guest": ["top", "bottom", "shoes", "layer"],
  };
  const requiredRoles = occasionDepthRules[strictOccasion] || ["top", "bottom", "shoes"];
  const roleCount = {
    top: 0,
    bottom: 0,
    shoes: 0,
    layer: 0,
  };

  scoredOccasionItems.forEach(item => {
    const meta = CLOTHING_ITEMS[item.name] || {};
    const role = meta.category === "footwear" ? "shoes" : meta.role;
    if (!["top", "bottom", "shoes", "layer"].includes(role)) return;
    const formality = meta.formality || 0;
    const inRange = formality >= Math.max(1, formalityMin - 1) && formality <= Math.min(5, formalityMax + 1);
    if (inRange) roleCount[role] += 1;
  });

  const hasThreeHighQualityEach = requiredRoles.every(role => (roleCount[role] || 0) >= 3);

  if (!hasThreeHighQualityEach) {
    const missingDepth = requiredRoles.filter(role => (roleCount[role] || 0) < 3);
    if (missingDepth.length > 0) {
      gaps.push(`Depth gap: add ${missingDepth.join(" and ")} options to keep ${strictOccasion} looks consistently above the baseline.`);
      reasonCodes.push("insufficient_depth_per_subcategory");
    }
  }

  if (gaps.length === 0 && bestScore > -Infinity) {
    gaps.push(`Best current fit is ${getVisualRating(bestScore)}; no blocking gap detected, but the strongest available outfit still needs sharper formality or statement control to clear the 8.5 floor.`);
  }

  const currentCombos = tops.length * bottoms.length * Math.max(1, shoes.length);
  let topRec = gaps[0] || "No graded fit reached the current floor yet.";
  const advisorFeedback = {
    message: bestScore > -Infinity && bestScore < qualityFloor
      ? gaps[0]
      : `Stylist's Roadmap: ${topRec}`,
    missingCategories: gaps.slice(0, 3),
    reasonCodes: [...new Set(reasonCodes)],
    suggestedItems,
    topRecommendation: topRec,
    targetVibes,
    bestScore: bestScore > -Infinity ? Number(bestScore.toFixed(1)) : null,
    visualRating: bestScore > -Infinity ? getVisualRating(bestScore) : null,
    bestCombo: bestCombo ? bestCombo.map(i => i.name) : [],
  };

  return {
    gaps: gaps.length > 0 ? gaps : [],
    topRecommendation: topRec,
    suggestedItems,
    reasonCodes: [...new Set(reasonCodes)],
    currentOutfitCount: currentCombos,
    strictBestScore: bestScore > -Infinity ? Number(bestScore.toFixed(1)) : null,
    strictFloor: qualityFloor,
    bestCombo: bestCombo ? bestCombo.map(i => i.name) : [],
    advisorFeedback,
    visualRating: bestScore > -Infinity ? getVisualRating(bestScore) : null,
  };
}


// ─────────────────────────────────────────────
// SECTION 19: CAPSULE VERSATILITY SCORER
// ─────────────────────────────────────────────

/**
 * Score each item in the wardrobe by how many outfits it unlocks.
 * Items with the highest versatility score are the most valuable.
 *
 * Versatility = number of other items it pairs well with (score >= 7).
 *
 * @param {Array<{name,color,pattern}>} wardrobe
 * @returns {Array<{item, versatilityScore, unlockedCombos, tip}>} sorted desc
 */
function scoreWardrobeVersatility(wardrobe) {
  const results = [];
  const clothing = wardrobe.filter(i=>CLOTHING_ITEMS[i.name]);

  clothing.forEach(item=>{
    let goodPairings = 0;
    let totalPairings = 0;

    clothing.forEach(other=>{
      if (other === item) return;
      if (!other.color || !item.color) return;
      totalPairings++;
      const colorScore = scoreColorPair(item.color, other.color);
      const formalityScore = checkFormalityMatch(item.name, other.name);
      if (colorScore.score >= 7 && formalityScore.score >= 5) goodPairings++;
    });

    const ci = CLOTHING_ITEMS[item.name];
    // Bonus for neutrals
    const neutralBonus = COLOR_PROFILES[item.color]?.neutral ? 2 : 0;
    // Bonus for versatile item types
    const typeBonus = ["shirt","chinos","jeans","blazer","white sneakers","trench coat"].includes(item.name) ? 1 : 0;

    results.push({
      item,
      versatilityScore: goodPairings + neutralBonus + typeBonus,
      totalPairings,
      tip: COLOR_PROFILES[item.color]?.neutral
        ? `${item.color} ${item.name} is a neutral — high versatility anchor.`
        : `${item.color} ${item.name} — good with ${goodPairings}/${totalPairings} other items.`,
    });
  });

  return results.sort((a,b)=>b.versatilityScore-a.versatilityScore);
}


// ─────────────────────────────────────────────
// SECTION 20: CLIP / GEMINI INTEGRATION HELPERS
// ─────────────────────────────────────────────

/**
 * Common mismatches from Gemini/CLIP output — maps to our item keys.
 */
const ITEM_FUZZY_MAP = {
  "denim pants":      "jeans",
  "pants":            "trousers",
  "tennis shoes":     "sneakers",
  "dress pants":      "dress trousers",
  "button shirt":     "dress shirt",
  "button up":        "shirt",
  "button-up":        "shirt",
  "pullover":         "sweater",
  "coat":             "overcoat",
  "flip-flops":       "flip flops",
  "slippers":         "slides",
  "trainers":         "sneakers",
  "sport shoes":      "running shoes",
  "athletic shoes":   "running shoes",
  "trousers":         "trousers",
  "formal pants":     "dress trousers",
  "formal shirt":     "dress shirt",
  "casual shirt":     "shirt",
  "knit top":         "ribbed knit",
  "crewneck":         "sweatshirt",
  "crewneck sweater": "sweater",
  "mock-neck":        "mock neck",
  "overcoat":         "overcoat",
  "long coat":        "overcoat",
  "down jacket":      "puffer jacket",
  "fleece jacket":    "jacket",
  "gilet":            "vest",
  "waistcoat":        "vest",
  "cords":            "chinos",
  "corduroy pants":   "cargo pants",
  "yoga pants":       "leggings",
  "athletic shorts":  "shorts",
  "swim shorts":      "shorts",
  "green sneakers":   "sneakers",
  "blue sneakers":    "sneakers",
  "black sneakers":   "sneakers",
  "red sneakers":     "sneakers",
  "grey sneakers":    "sneakers",
  "gray sneakers":    "sneakers",
  "dhoti pants":      "dhoti",
  "palazzo":          "wide leg jeans",
  "palazzo pants":    "maxi skirt",
  "ethnic top":       "kurta",
  "indian top":       "kurta",
  "black body fit synthetic tee": "t-shirt",
  "grey sweatpants": "joggers",
  "gray sweatpants": "joggers",
  "camel coat": "overcoat",
  "maroon sweater": "sweater",
};

/**
 * Parse a label string from Gemini/CLIP into an item object.
 * Handles fuzzy matching and common synonyms.
 */
function parseCLIPLabel(label) {
  const l = (label||"").toLowerCase().trim();

  // Find color (longest match wins)
  const colorFound = Object.keys(COLOR_PROFILES)
    .sort((a,b)=>b.length-a.length)
    .find(c=>l.includes(c)) || null;

  // Find item — fuzzy map first, then direct match (longest first)
  let itemFound = null;
  const fuzzyKey = Object.keys(ITEM_FUZZY_MAP).find(k=>l.includes(k));
  if (fuzzyKey) {
    itemFound = ITEM_FUZZY_MAP[fuzzyKey];
  } else {
    const sorted = Object.keys(CLOTHING_ITEMS).sort((a,b)=>b.length-a.length);
    itemFound = sorted.find(item=>l.includes(item)) || null;
  }

  const patternFound = Object.keys(PATTERNS)
    .sort((a,b)=>b.length-a.length)
    .find(p=>l.includes(p)) || "solid";

  return { name: itemFound, color: colorFound, pattern: patternFound };
}

/**
 * Full pipeline entry point.
 * Takes Gemini/CLIP output labels and returns outfit suggestions.
 */
function suggestFromCLIP(clipLabels, occasion="casual", weather="mid", userProfile={}) {
  const wardrobe = clipLabels
    .map(parseCLIPLabel)
    .filter(i=>i.name!==null);
  if (wardrobe.length===0)
    return { error:"No recognizable clothing items found. Check Gemini detection output." };
  return suggestOutfits(wardrobe, occasion, weather, userProfile);
}


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  // Data
  COLOR_PROFILES, COLOR_HARMONY, COLOR_RULES,
  CLOTHING_ITEMS, PATTERNS, FABRICS, TEXTURE_RULES,
  OCCASIONS, WEATHER, BODY_TYPES,
  PERSONAL_COLOR_SEASONS, STYLE_ARCHETYPES,
  LAYERING_RULES, SHOE_PAIRING, METAL_TONE_RULES,
  INDIAN_FASHION, INTENTIONAL_CONTRASTS,

  // New systems
  OCCASION_VIBES, VIBE_PREFERENCES, OUTFIT_TEMPLATES,
  CULTURAL_OCCASION_RULES, GYM_ALLOWED,

  // Core logic
  scoreColorPair, scoreOutfit, suggestOutfits, filterByOccasion,
  checkFormalityMatch, canMixPatterns,
  scoreShoeBottomPair, scoreItemForBodyType,
  scoreOutfitForArchetype, scoreColorForSeason,
  detectColorSeason, filterByWeather,

  // Validation gates
  validateOutfitConstraints, validateOccasionConstraints,
  hasStatementElement, getOutfitSignature, detectOutfitTemplate,

  // Vibe system
  getVibePreferences, scoreVibeAlignment,

  // Accessory logic
  suggestAccessories,

  // Higher-level features
  analyzeWardrobeGaps, scoreWardrobeVersatility,

  // Integration
  parseCLIPLabel, suggestFromCLIP, ITEM_FUZZY_MAP,
};

/*
// ── USAGE EXAMPLES ────────────────────────────────────────────

// 1. Basic outfit suggestion — hot day, casual
import { suggestOutfits } from './fashionEngine.js';
const wardrobe = [
  { name:"t-shirt",        color:"white",   pattern:"solid" },
  { name:"polo shirt",     color:"sky blue",pattern:"solid" },
  { name:"shorts",         color:"beige",   pattern:"solid" },
  { name:"chinos",         color:"khaki",   pattern:"solid" },
  { name:"white sneakers", color:"white",   pattern:"solid" },
  { name:"sandals",        color:"tan",     pattern:"solid" },
  // jacket will be filtered out — hot weather
  { name:"jacket",         color:"brown",   pattern:"solid" },
  // accessories
  { name:"watch",          color:"silver",  pattern:"solid" },
  { name:"chain",          color:"silver",  pattern:"solid" },
  { name:"rings",          color:"gold",    pattern:"solid" },
];
const outfits = suggestOutfits(wardrobe, "casual", "hot");

// 2. With user profile for personalization
const userProfile = {
  undertone: "warm",    // warm | cool | neutral
  skinDepth: "medium",  // fair | light | medium | tan | deep | rich
  bodyType:  "rectangle",
  archetype: "smart_casual",
};
const personalizedOutfits = suggestOutfits(wardrobe, "office", "mid", userProfile);

// 3. What to buy next
import { analyzeWardrobeGaps } from './fashionEngine.js';
const gaps = analyzeWardrobeGaps(wardrobe, "office", "mid");

// 4. Which item in my wardrobe is most versatile?
import { scoreWardrobeVersatility } from './fashionEngine.js';
const versatility = scoreWardrobeVersatility(wardrobe);

// 5. Parse Gemini detection output
import { suggestFromCLIP } from './fashionEngine.js';
const geminiOutput = [
  "a white oversized t-shirt",
  "navy slim jeans",
  "white chunky sneakers",
  "a gold watch",  // accessory — handled separately
];
const suggestions = suggestFromCLIP(geminiOutput, "casual", "mid", userProfile);
*/
