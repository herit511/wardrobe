// ============================================================
//  fashionStylingEngine.js — Styling Intelligence Layer
//
//  This sits ON TOP of fashionEngine.js.
//  fashionEngine validates. This layer STYLES.
//
//  What this adds:
//  1.  Outfit personality & mood system
//  2.  The Signature Move — one unexpected detail per outfit
//  3.  Micro-styling instructions (HOW to wear it, not just WHAT)
//  4.  Outfit storytelling — why this look turns heads
//  5.  Trend intelligence — what's current 2024–2025
//  6.  The Finishing Move — the one detail that goes 7→10
//  7.  Proportion & silhouette direction
//  8.  Color story narration
//  9.  Occasion-specific power moves
//  10. The "Wow Reason" — what people will actually notice
// ============================================================


// ─────────────────────────────────────────────
// SECTION 1: OUTFIT PERSONALITIES
// ─────────────────────────────────────────────

/**
 * Every great outfit has a MOOD — a story it tells before
 * you even open your mouth. This system assigns a personality
 * to each outfit combination based on its components.
 *
 * This is what transforms "navy shirt + beige chinos"
 * into "Quiet Authority" — and gives the user language
 * to understand why it works.
 */
const OUTFIT_PERSONALITIES = {
  // ── High-impact named looks ──────────────────

  "quiet authority": {
    vibe: "Quiet Authority",
    description: "You don't announce yourself. You don't need to. This outfit reads as someone who has already arrived.",
    moodBoard: ["boardroom confidence", "old money", "effortless polish"],
    triggeredBy: {
      colors: [["navy","beige"],["charcoal","white"],["camel","white"],["navy","white"]],
      items:  [["shirt","chinos"],["dress shirt","trousers"],["blazer","chinos"]],
    },
    wowReason: "The restraint is the statement. People sense control before they see it.",
  },

  "clean confidence": {
    vibe: "Clean Confidence",
    description: "Minimal. Intentional. The look that says you know exactly who you are without needing to prove it.",
    moodBoard: ["minimalist", "understated", "precise"],
    triggeredBy: {
      colors: [["white","navy"],["white","black"],["black","gray"],["all-white"],["all-black"]],
      items:  [["turtleneck","trousers"],["white sneakers","straight jeans"],["shirt","slim jeans"]],
    },
    wowReason: "Monochromatic or near-monochromatic outfits photograph beautifully and read as sophisticated without effort.",
  },

  "effortless cool": {
    vibe: "Effortless Cool",
    description: "This looks like you threw it on in 3 minutes. It took 3 minutes. That's the point — and no one will believe you.",
    moodBoard: ["off-duty", "relaxed", "French casual"],
    triggeredBy: {
      colors: [["white","denim"],["gray","white"],["navy","white"],["beige","white"]],
      items:  [["t-shirt","jeans"],["shirt","jeans"],["white sneakers","jeans"]],
    },
    wowReason: "The genius move is the half-tuck or the single cuff. One imperfect detail makes the whole thing look intentional rather than boring.",
  },

  "urban edge": {
    vibe: "Urban Edge",
    description: "This outfit has tension — a deliberate contrast that makes it look like it was styled, not just assembled.",
    moodBoard: ["streetwear", "editorial", "high-low contrast"],
    triggeredBy: {
      colors: [["black","white"],["black","red"],["charcoal","cobalt"]],
      items:  [["leather jacket","jeans"],["hoodie","trousers"],["graphic tee","blazer"]],
    },
    wowReason: "The high-low contrast is what catches people — formal piece + casual piece creates visual surprise.",
  },

  "golden hour": {
    vibe: "Golden Hour",
    description: "Warm, rich, and layered in a way that photographs like it was lit by a sunset. Earth tones done right.",
    moodBoard: ["earthy", "warm", "Italian autumn"],
    triggeredBy: {
      colors: [["camel","rust"],["mustard","olive"],["terracotta","beige"],["brown","camel"],["rust","cream"]],
      items:  [["sweater","chinos"],["cardigan","trousers"]],
    },
    wowReason: "Earth tones create an outfit that feels warm before you even touch it. The whole look glows.",
  },

  "dark romanticism": {
    vibe: "Dark Romanticism",
    description: "Rich, deep, and layered. The kind of outfit that commands a room without raising its voice.",
    moodBoard: ["evening sophistication", "old world", "cinematic"],
    triggeredBy: {
      colors: [["burgundy","black"],["navy","burgundy"],["plum","charcoal"],["wine","black"]],
      items:  [["blazer","trousers"],["turtleneck","trousers"],["overcoat","jeans"]],
    },
    wowReason: "Dark + dark works when the tones are different families. Burgundy against navy creates depth that lighter colors never achieve.",
  },

  "summer protagonist": {
    vibe: "Summer Protagonist",
    description: "You're the main character of every outdoor setting in this. Light, clean, and alive.",
    moodBoard: ["mediterranean", "resort", "energy"],
    triggeredBy: {
      colors: [["white","beige"],["sky blue","white"],["coral","white"],["mint","white"]],
      items:  [["shirt","shorts"],["t-shirt","shorts"],["linen shirt","chinos"]],
    },
    wowReason: "Light colors in hot weather reflect light back — you glow rather than absorb. The linen texture adds depth without weight.",
  },

  "cultural power": {
    vibe: "Cultural Power",
    description: "Rooted and confident. This outfit is a statement of identity — dressed in heritage, not costume.",
    moodBoard: ["ethnic elegance", "heritage", "celebration"],
    triggeredBy: {
      colors: [["white","gold"],["mustard","white"],["navy","gold"],["burgundy","gold"]],
      items:  [["kurta","churidar"],["sherwani","churidar"],["kurta","chinos"]],
    },
    wowReason: "The combination of traditional silhouette with intentional accessorizing signals confidence in identity. That's rare and magnetic.",
  },

  "stealth wealth": {
    vibe: "Stealth Wealth",
    description: "Nothing branded, nothing loud. But everything is clearly expensive in its fit and fabric choice. Quiet luxury.",
    moodBoard: ["old money", "understated luxury", "Loro Piana energy"],
    triggeredBy: {
      colors: [["camel","cream"],["camel","white"],["gray","camel"],["navy","camel"],["beige","ivory"]],
      items:  [["overcoat","trousers"],["trench coat","chinos"],["cashmere sweater","trousers"]],
    },
    wowReason: "The palette is entirely neutral but the proportions are precise. That precision is what reads as money.",
  },

  "off-duty creative": {
    vibe: "Off-Duty Creative",
    description: "Relaxed but clearly considered. The kind of outfit a designer or director wears to not try — but still try.",
    moodBoard: ["creative industry", "downtown", "art world"],
    triggeredBy: {
      colors: [["black","black"],["olive","black"],["gray","black"],["navy","olive"]],
      items:  [["wide leg jeans","t-shirt"],["cargo pants","plain tee"],["oversized tee","chinos"]],
    },
    wowReason: "Proportion play is doing all the work. Wide on one, slim on the other, dark palette — looks directional without trying.",
  },

  "date night precision": {
    vibe: "Date Night Precision",
    description: "Dressed up without announcing it. You look like yourself, just... dialed up exactly one notch.",
    moodBoard: ["confidence", "warmth", "presence"],
    triggeredBy: {
      colors: [["navy","white"],["charcoal","white"],["black","white"],["burgundy","navy"]],
      items:  [["shirt","trousers"],["turtleneck","jeans"],["blazer","shirt","jeans"]],
    },
    wowReason: "The precision is in what you didn't overdo. One elevated piece — the boots, the watch, the collar — does all the talking.",
  },

  "festive fire": {
    vibe: "Festive Fire",
    description: "Rich, celebratory, and unmistakably intentional. You walked in and the room noticed.",
    moodBoard: ["celebration", "festival", "joy"],
    triggeredBy: {
      colors: [["burgundy","gold"],["emerald","gold"],["royal blue","gold"],["deep red","cream"]],
      items:  [["kurta","churidar"],["sherwani","churidar"],["nehru jacket","shirt","trousers"]],
    },
    wowReason: "Jewel tones under warm light do something special — they glow. This is not an outfit, it's an entrance.",
  },
};

/**
 * Detect which personality best matches an outfit.
 * Returns the personality object or a generic fallback.
 */
function detectOutfitPersonality(items) {
  const colors  = items.map(i => i.color).filter(Boolean);
  const names   = items.map(i => i.name).filter(Boolean);

  // Score each personality
  let bestMatch = null, bestScore = -1;

  for (const [key, personality] of Object.entries(OUTFIT_PERSONALITIES)) {
    let score = 0;
    const triggers = personality.triggeredBy;

    // Color trigger
    triggers.colors?.forEach(combo => {
      const matched = combo.every(c => colors.includes(c));
      if (matched) score += 3;
      // Partial match
      const partialMatch = combo.filter(c => colors.includes(c)).length;
      if (partialMatch >= 1) score += partialMatch;
    });

    // Item trigger
    triggers.items?.forEach(combo => {
      const matched = combo.every(item => names.some(n => n.includes(item) || item.includes(n)));
      if (matched) score += 2;
    });

    if (score > bestScore) { bestScore = score; bestMatch = personality; }
  }

  return bestMatch || {
    vibe: "Your Own Signature",
    description: "An individual combination — the kind that defines a style rather than follows one.",
    moodBoard: ["individual", "personal", "signature"],
    wowReason: "The most memorable outfits are the ones that feel like nobody else would have put them together.",
  };
}


// ─────────────────────────────────────────────
// SECTION 2: MICRO-STYLING INSTRUCTIONS
// ─────────────────────────────────────────────

/**
 * The HOW. Not just what to wear — exactly how to wear it.
 * These are the details that separate "dressed" from "styled."
 *
 * Each item has specific styling instructions that change
 * how the overall outfit reads.
 */
const MICRO_STYLING = {
  // ── Tops ──────────────────────────────────

  "shirt": [
    "Tuck the front in, leave the back out (the half-tuck). Works for casual. Never for formal.",
    "For smart casual: full tuck, top button undone, sleeves rolled to just below the elbow — twice, no more.",
    "The last button at the hem: leave it undone when untucked. It prevents the shirt from looking like a sail.",
    "Collar: keep it crisp. A soft collar signals you didn't iron it. Either wear it open deliberately or wear it buttoned.",
  ],
  "dress shirt": [
    "Full tuck always. No exceptions.",
    "Collar: first button undone only — anything more looks casual, not confident.",
    "Cuffs should show exactly 1.5cm below a jacket sleeve. If you're wearing it alone, button the cuffs.",
    "French tuck only works on relaxed dress shirts, not poplin. Know your fabric.",
  ],
  "t-shirt": [
    "Fit is everything. It should skim the body — not hug it, not hang from it.",
    "Half-tuck into high-waist bottoms instantly elevates a plain tee.",
    "Roll the sleeve once if the sleeve is too long — creates a cleaner line at the bicep.",
    "A plain white tee should be replaced every 6 months. Yellow undertones kill the look.",
  ],
  "hoodie": [
    "Wear it with the hood out. Never hood up unless you're actually cold.",
    "The sleeves should hit the base of the thumb — not the knuckles, not above the wrist.",
    "Over a shirt: let 1–2cm of shirt collar show above the hoodie neck. That layering is the look.",
    "With trousers: the contrast is the point. Keep the hoodie in a neutral to let it read as intentional.",
  ],
  "turtleneck": [
    "The turtleneck should sit close to the jaw — not fold down, not bunch at the throat.",
    "Tuck it into high-waist trousers or skirts. The uninterrupted vertical line is why this works.",
    "Under a blazer: the turtleneck replaces the shirt entirely. No lapels needed.",
    "Keep everything else slim. The turtleneck provides enough statement on its own.",
  ],
  "sweater": [
    "Half-tuck into trousers with a slight blouse at the waist. More relaxed and editorial than a full tuck.",
    "The sleeves should always be pushed up slightly — hit just below the elbow when relaxed.",
    "Layering: let a collar shirt show beneath the sweater neck. 1cm is elegant. 3cm is intentional. Anything more is accident.",
    "Chunky knits: wear slim on the bottom. Always. No exceptions.",
  ],
  "blazer": [
    "The shoulder seam must sit exactly at your shoulder — not hanging off, not pulling up.",
    "Button: one button rule for single-breasted. Always the top button only. Bottom button is always open.",
    "Sleeve length: shirt cuff shows 1–1.5cm. No shirt? 1cm of bare wrist showing.",
    "Pushed-up sleeves: only on unstructured blazers. Never on tailored ones.",
    "Open blazer over a tee: the most versatile smart casual move in existence.",
  ],
  "kurta": [
    "Length matters: knee length is the sweet spot. Too short reads casual, too long reads costume.",
    "For indo-western: tuck the front half-in to jeans. Gives structure.",
    "Collar: mandarin collar should sit flat. Never gap, never crumple.",
    "Embroidered kurta: let the embroidery speak. Keep everything else minimal.",
  ],
  "leather jacket": [
    "Zip it halfway — never fully. The half-zip is the look.",
    "Underneath: t-shirt or thinly fitted shirt only. Bulk underneath kills the silhouette.",
    "Collar: up or down — decide and commit. Half-up looks unfinished.",
    "The jacket should allow you to move without pulling at the shoulders. If it pulls, it's too small.",
  ],

  // ── Bottoms ──────────────────────────────

  "jeans": [
    "The break: a slight break at the shoe (fabric touching but not pooling) is the most versatile hem.",
    "No break (cropped to ankle): cleaner and more contemporary. Works with every shoe type.",
    "Full pool: only with chunky shoes intentionally. Otherwise looks like you forgot to tailor.",
    "Never wash dark jeans hot — they fade to a gray that ruins the depth.",
  ],
  "slim jeans": [
    "Ankle length is ideal — the clean break at the ankle shows the shoe.",
    "Tuck the ankle into chelsea boots or wear them with the boots over the jeans for streetwear.",
    "Roll once at the hem if they're too long — the cuff should be tight, not loose.",
  ],
  "wide leg jeans": [
    "Hem: the jeans should barely graze the top of your shoe. Too long pools, too short looks cropped wrong.",
    "Shoe choice determines everything — heels or loafers lengthen. Chunky sneakers balance.",
    "Tuck or crop the top always. A flowing top over wide-leg jeans removes all your proportions.",
  ],
  "chinos": [
    "The taper at the ankle: if they're straight, roll once. A clean ankle line elevates the shoe.",
    "Full tuck for formal. Half tuck for casual. Untucked only if you're wearing a very fitted top.",
    "Crease: chinos with a front crease read as smart. Without crease: relaxed. Know which you're going for.",
  ],
  "trousers": [
    "Break: a half-break is the professional standard. Quarter-break for a more modern look.",
    "Always full tuck. A shirt worn untucked with trousers reads as someone who got dressed in the dark.",
    "Waist: should sit at the natural waist, not the hip. This is what gives trousers their authority.",
    "Crease should be sharp. Press them before wearing.",
  ],
  "shorts": [
    "Length: 2–3cm above the knee is the most flattering. Mid-thigh is fashion-forward. Below the knee is dated.",
    "The hem should be clean — not frayed, not rolled (unless it's your aesthetic).",
    "With a tucked tee: instantly looks more intentional. With untucked: make sure the tee is fitted.",
  ],
  "joggers": [
    "The ankle cuff defines the look: it should hug the ankle just above the shoe, never slumping over it.",
    "Pair with structured tops — a clean tee, denim jacket, or overcoat — to balance the relaxed bottom.",
    "Avoid running shoes unless you're actually running. Choose retro sneakers or minimalist leather sneakers to bridge the gap between gym and street.",
  ],

  // ── Shoes ────────────────────────────────

  "white sneakers": [
    "Keep them clean. White sneakers that are gray-tinted ruin every outfit they're part of.",
    "No-show socks or bare ankle always. Visible white socks with white sneakers is not the vibe.",
    "Lacing: flat and even. Loose lacing looks accidental. Tight lacing looks aggressive.",
  ],
  "loafers": [
    "Wear with bare ankles or no-show socks. Visible socks with loafers only if the socks are a deliberate statement.",
    "The fit: your heel should not slip when you walk. Loafers that slip look too big.",
    "With jeans: cuff the jeans once to show the full loafer silhouette.",
  ],
  "chelsea boots": [
    "The elastic panel should sit flush against your ankle — not gaping.",
    "Tuck slim jeans into the boot or wear outside. Never scrunch jeans around the ankle.",
    "These boots look best with a slight cuff on jeans — shows the whole boot silhouette.",
  ],
  "oxford shoes": [
    "These are formal. Polish them. Scuffs on formals undermine the entire outfit.",
    "Wear with trousers that have a clean half-break — shows the shoe without hiding it.",
    "Black oxfords with everything dark. Brown oxfords need at least one warm tone in the outfit.",
  ],

  // ── Layers ────────────────────────────────

  "denim jacket": [
    "Leave it unbuttoned always. A buttoned denim jacket looks like a uniform.",
    "Collar: up gives you an '80s edge. Down is cleaner. Decide — don't let it flop in between.",
    "Sleeves: push up to the forearm when indoors. Full sleeve when outside.",
    "Over a turtleneck: the collar stack is the move. Let the turtleneck neck show above the jacket collar.",
  ],
  "overcoat": [
    "Length: should hit just above or at the knee. Any longer and you need the height to carry it.",
    "Leave it open when stationary. Button when walking. This is the most photogenic version of this coat.",
    "What's underneath matters: a structured mid-layer (blazer, sweater) makes the coat look intentional.",
  ],
  "trench coat": [
    "Belt it. Always belt it. An unbelted trench is 40% less impactful.",
    "Collar up when it's cold or when you want the drama. Down when it's formal.",
    "Length should be knee-length or longer. A trench cut short loses its entire purpose.",
  ],
  "nehru jacket": [
    "The collar must sit flat and high — that mandarin collar is the signature. If it wrinkles, iron it.",
    "Wear over a plain kurta or a simple collarless shirt. Any more collar and it competes.",
    "Buttons: all closed. No exceptions. An open Nehru jacket looks unfinished.",
  ],
};

/**
 * Get micro-styling instructions for items in an outfit.
 * GUARANTEES at least 3 tips: top, shoes, and one standout item.
 * Falls back to role-based generic tips for items not in the MICRO_STYLING map.
 */
function getMicroStyling(items) {
  const instructions = [];

  // Generic fallbacks by role for items not in the MICRO_STYLING database
  const GENERIC_TIPS = {
    top:    "Ensure the fit is clean at the shoulders — this is where most tops succeed or fail.",
    bottom: "The break at the shoe defines the silhouette — adjust length before wearing.",
    shoes:  "Keep them clean. Footwear is the first thing people actually notice, even if they don't realize it.",
    layer:  "The outer layer is the frame for the outfit. Make sure it sits cleanly on the shoulders without bunching.",
    accessory: "One accessory at a time until you're sure of the combination. Subtlety is always safer than excess.",
    full:   "Full-body pieces need precise length — hemmed exactly to the right break at the shoe.",
  };

  // Prioritize: top, then layer, then bottom, then shoes
  const priority = ["top","layer","bottom","shoes"];
  const sorted = [...items].sort((a,b) => {
    const roleA = a.role || (a.name && MICRO_STYLING[a.name] ? "top" : "");
    const roleB = b.role || (b.name && MICRO_STYLING[b.name] ? "top" : "");
    const ai = priority.indexOf(roleA);
    const bi = priority.indexOf(roleB);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const coveredRoles = new Set();

  sorted.forEach(item => {
    const instructions_for_item = MICRO_STYLING[item.name];
    if (instructions_for_item && instructions_for_item.length > 0) {
      // Pick 1 instruction per item — the most impactful one
      instructions.push({
        item: item.name,
        tip: instructions_for_item[Math.floor(Math.random() * instructions_for_item.length)],
      });
      if (item.role) coveredRoles.add(item.role);
    }
  });

  // Guarantee at least 3 tips — fill gaps with generic role-based tips
  if (instructions.length < 3) {
    for (const item of sorted) {
      if (instructions.length >= 3) break;
      const role = item.role || "top";
      if (coveredRoles.has(role)) continue;
      if (GENERIC_TIPS[role] && !instructions.some(i => i.item === item.name)) {
        instructions.push({ item: item.name, tip: GENERIC_TIPS[role] });
        coveredRoles.add(role);
      }
    }
  }

  return instructions.slice(0, 4); // Max 4 micro-styling tips per outfit
}


// ─────────────────────────────────────────────
// SECTION 3: THE SIGNATURE MOVE
// ─────────────────────────────────────────────

/**
 * Every truly memorable outfit has ONE unexpected, intentional
 * detail that makes people think "how did they think of that?"
 *
 * This is not a random suggestion — it's calculated based on
 * what the outfit is already doing and what single move
 * would elevate it from good to extraordinary.
 */
const SIGNATURE_MOVES = {
  // Color-based signature moves
  colorMoves: [
    {
      condition: (colors) => colors.includes("navy") && colors.includes("white"),
      move: "Add one terracotta or rust accessory — a belt, a bag strap, or a watch strap. It's the colour nobody expected and everyone remembers.",
    },
    {
      condition: (colors) => colors.includes("black") && colors.includes("white"),
      move: "A single gold accessory — chain, watch, or ring — is all this needs. Black and white is the canvas; gold is the brushstroke.",
    },
    {
      condition: (colors) => colors.filter(c => ["camel","beige","tan","cream","ivory"].includes(c)).length >= 2,
      move: "Introduce a single deep burgundy or forest green element — even a subtle one like a pocket square or a bag. It grounds all the warmth.",
    },
    {
      condition: (colors) => colors.includes("olive") || colors.includes("army green"),
      move: "Wear the watch on the outside of a long sleeve. Military detail, intentional rather than accidental.",
    },
    {
      condition: (colors) => colors.filter(c => ["rust","terracotta","mustard","orange"].includes(c)).length >= 1,
      move: "A thin silver chain instead of gold. The cool metal against warm earth tones creates a tension that feels editorial.",
    },
  ],

  // Item-based signature moves
  itemMoves: [
    {
      items: ["blazer","t-shirt"],
      move: "The blazer and tee combination only works if the tee is tucked. Tuck it, push the blazer sleeves up slightly. That pushed sleeve is the detail.",
    },
    {
      items: ["shirt","jeans"],
      move: "Leave the shirt untucked but tie a small knot at the front hem. Just a small one — 2cm of knot. It breaks the boxy shape and creates a waist.",
    },
    {
      items: ["turtleneck","jeans"],
      move: "Tuck the turtleneck deep into the jeans, then pull it back out 1–2cm over the waistband. This slight blouse is the difference between tucked and styled.",
    },
    {
      items: ["leather jacket","jeans"],
      move: "Cuff the jeans once cleanly and let the boots or sneakers be fully visible. The exposed ankle breaks the heaviness of the leather.",
    },
    {
      items: ["overcoat","jeans"],
      move: "Let the overcoat be the only structure in the look — keep everything under it soft and fitted. The coat does the work alone.",
    },
    {
      items: ["hoodie","joggers"],
      move: "The full sweatsuit only works if the fit is intentional. A slightly cropped hoodie with tapered joggers looks active; anything baggy just looks tired.",
    },
    {
      items: ["oversized tee","joggers"],
      move: "French tuck the oversized tee into the joggers just slightly at the hip to establish a waist and prevent the entire silhouette from dragging.",
    },
    {
      items: ["hoodie","trousers"],
      move: "The trick is the half-tuck: front hem of the hoodie tucked into the trousers, back left out. This creates a casual waist where there usually isn't one.",
    },
    {
      items: ["kurta","jeans"],
      move: "Roll the jeans hem once cleanly to show the ankle. It signals you made a choice — indo-western isn't an accident, it's a perspective.",
    },
    {
      items: ["denim jacket","trousers"],
      move: "The denim jacket over tailored trousers is a deliberate class collision. Make sure the trousers have a sharp crease — the tension between structured and casual is the whole point.",
    },
    {
      items: ["sweater","chinos"],
      move: "Untuck the front of the shirt or tee underneath the sweater by exactly 1–2cm. The visible hem underneath adds a deliberate layering detail.",
    },
    {
      items: ["blazer","jeans"],
      move: "Roll the jeans to expose a clean 3cm of ankle above the shoe. The ankle gap in a blazer outfit signals you understand proportion.",
    },
  ],

  // Occasion-based signature moves
  occasionMoves: {
    "office":       "The pocket square fold matters more than people admit. A simple TV fold (straight, flat) says boardroom. A puff fold says personality. Choose based on the day.",
    "date night":   "Wear cologne to the collar, not the wrist. The collar is where it lingers — close conversation will reveal it naturally rather than announcing it.",
    "party":        "One piece is louder than the rest. Let it be only one. The outfit around it should be completely quiet so that one piece does its job.",
    "ethnic":       "The footwear is the final signature. A kurta with kolhapuri reads traditional. The same kurta with clean white sneakers reads Indo-Western. The shoe makes the statement.",
    "casual":       "One texture that doesn't obviously match — a slightly shiny watch on a matte cotton outfit, a leather belt with jersey — creates depth without drama.",
    "gym":          "Matching set in one color, one brand. The monochrome athlete look reads as someone who trained, not someone who tried.",
    "date night":   "Minimal cologne, clean nails, pressed clothes. The date night moves aren't in the outfit — they're in the details everyone assumes you skipped.",
    "festival":     "Layer metals and embroidery thoughtfully — the rule is: if the fabric is loud, the jewelry is subtle. If the fabric is quiet, the jewelry speaks.",
  },
};

/**
 * Get the signature move for an outfit.
 */
function getSignatureMove(items, occasion) {
  const colors = items.map(i => i.color).filter(Boolean);
  const names  = items.map(i => i.name).filter(Boolean);

  // Check color-based moves first
  for (const move of SIGNATURE_MOVES.colorMoves) {
    if (move.condition(colors)) return move.move;
  }

  // Check item-based moves
  for (const move of SIGNATURE_MOVES.itemMoves) {
    const matched = move.items.every(item =>
      names.some(n => n.includes(item) || item.includes(n))
    );
    if (matched) return move.move;
  }

  // Fall back to occasion move — never return null/empty
  if (SIGNATURE_MOVES.occasionMoves[occasion]) {
    return SIGNATURE_MOVES.occasionMoves[occasion];
  }

  // Occasion-specific fallbacks for occasions not in the map
  const fallbackMoves = {
    "wedding guest":    "The guest who looks like they belong at the head table wins. Clean lines, pressed fabric, and one metallic accessory.",
    "business formal":  "The cuff link or the pocket fold — choose one detail to be perfect. Everything else should feel invisible.",
    "pooja / puja":     "Simplicity is the statement. A clean, pressed kurta in light tones with minimal accessories says respect without words.",
  };
  return fallbackMoves[occasion] ||
    "The final move: wear this outfit like it was the only possible choice. Confidence is the one accessory that never clashes.";
}


// ─────────────────────────────────────────────
// SECTION 4: TREND INTELLIGENCE (2024–2025)
// ─────────────────────────────────────────────

/**
 * Current fashion trends — updated for 2024–2025.
 * Each outfit is tagged against relevant trends
 * to give users context for why something is current.
 *
 * Source: runway reports, street style, major fashion weeks.
 */
const TRENDS_2024_2025 = {
  silhouette: [
    {
      name: "Straight leg dominance",
      description: "Slim and skinny jeans are out. Straight and wide-leg are the current shape.",
      items: ["straight jeans","wide leg jeans","straight-leg trousers"],
      tip: "If you own slim jeans, they still work — but straight leg instantly reads as more current.",
    },
    {
      name: "Quiet Luxury / Stealth Wealth",
      description: "No logos. No loud branding. Exceptional fit and fabric quality speak instead.",
      items: ["overcoat","cashmere sweater","trousers","loafers"],
      tip: "The outfit whispers rather than shouts. Every piece is identifiable by quality, not label.",
    },
    {
      name: "Oversized tailoring",
      description: "Blazers and suit jackets worn deliberately large. Shoulder extends past the natural shoulder.",
      items: ["oversized blazer","suit jacket"],
      tip: "Size up one in blazers — the oversized shoulder is the signature of this trend.",
    },
    {
      name: "Gorpcore / Utility",
      description: "Functional outdoor aesthetics in urban settings. Cargo, technical fabrics, layering.",
      items: ["cargo pants","parka","puffer jacket","boots"],
      tip: "The key is keeping it clean — gorpcore works when it's intentional, not accidental.",
    },
    {
      name: "Elevated Athleisure",
      description: "Bridging the gap between performance wear and street style. Comfort without sacrificing silhouette.",
      items: ["joggers","track pants","sweatpants","sneakers"],
      tip: "The fit is everything. The moment athleisure becomes baggy, it loses all its elevation.",
    },
  ],
  color: [
    {
      name: "Chocolate brown and caramel",
      description: "Brown is back — not the muddy brown of the 2000s but rich, warm chocolate and caramel.",
      colors: ["brown","dark brown","camel","chocolate"],
      tip: "Pair brown with cream or white for the cleanest version of this trend.",
    },
    {
      name: "Muted earth tones across the board",
      description: "The palette of the moment is warm and desaturated — terracotta, sage, camel, rust.",
      colors: ["terracotta","sage","camel","rust","olive"],
      tip: "These colors work in monochromatic stacks — same tone, different shades from head to foot.",
    },
    {
      name: "Cobalt and royal blue",
      description: "Electric blue shades are making a strong run — saturated, statement-making.",
      colors: ["cobalt","royal blue","blue"],
      tip: "One cobalt piece in an otherwise neutral outfit is the only way to wear this trend cleanly.",
    },
    {
      name: "Off-white and ivory over pure white",
      description: "Pure white is stepping back. Warm whites — ivory, cream, off-white — feel more current.",
      colors: ["ivory","cream","off-white"],
      tip: "Off-white pairs with everything but feels softer and more luxurious than stark white.",
    },
  ],
  styling: [
    {
      name: "Barrel jeans and wide-leg with loafers",
      description: "The current trouser shoe pairing — wide on top, clean shoe with no bulk below.",
      tip: "No chunky sole with wide-leg. Clean loafer or low-heel only.",
    },
    {
      name: "Uncuffed, full-break trousers",
      description: "A return to a longer trouser length — letting trousers fully break on the shoe.",
      tip: "This only works on trousers, not jeans. And only with formal shoes.",
    },
    {
      name: "The row of buttons undone",
      description: "Shirts worn with 2 buttons open — more casual and effortless than the single-button norm.",
      tip: "Works on relaxed fabric shirts. Not on poplin dress shirts.",
    },
    {
      name: "Tonal dressing",
      description: "Head-to-toe in the same color family — different shades, same hue.",
      tip: "Navy jacket, mid-blue shirt, light blue jeans. The monochromatic gradient is the trend.",
    },
  ],
};

/**
 * Check which 2024-2025 trends an outfit aligns with.
 * Returns trend tags to display with the outfit.
 */
function getOutfitTrends(items) {
  const colors = items.map(i => i.color).filter(Boolean);
  const names  = items.map(i => i.name).filter(Boolean);
  const trends = [];

  TRENDS_2024_2025.silhouette.forEach(trend => {
    const match = trend.items?.some(item => names.some(n => n.includes(item) || item.includes(n)));
    if (match) trends.push({ type:"silhouette", name: trend.name, tip: trend.tip });
  });

  TRENDS_2024_2025.color.forEach(trend => {
    const match = trend.colors?.some(c => colors.includes(c));
    if (match) trends.push({ type:"color", name: trend.name, tip: trend.tip });
  });

  return trends.slice(0, 2); // Max 2 trend tags per outfit
}


// ─────────────────────────────────────────────
// SECTION 5: COLOR STORY NARRATION
// ─────────────────────────────────────────────

/**
 * Instead of just scoring colors, narrate the color story —
 * explain WHY this palette feels the way it does.
 * This is what stylists actually communicate.
 */
const COLOR_STORIES = {
  // By palette type
  monochromatic: {
    story: "One color, different expressions. This palette creates elongation and a sense of intention — like the outfit was designed, not assembled.",
    emotion: "Calm authority",
  },
  neutralOnNeutral: {
    story: "A palette that lets the silhouette and fabric do the talking. No color is competing for attention — which means the fit and texture are everything.",
    emotion: "Quiet sophistication",
  },
  complementary: {
    story: "Opposite ends of the color wheel, pulled together. This creates visual tension — the eye keeps moving between the two colors, which is exactly what you want.",
    emotion: "Bold and dynamic",
  },
  analogous: {
    story: "Colors that sit next to each other on the spectrum. This is nature's palette — harmonious without being boring.",
    emotion: "Natural confidence",
  },
  neutralPlusAccent: {
    story: "A neutral foundation with a single color punch. The neutral makes the accent look more vibrant; the accent makes the neutral look intentional.",
    emotion: "Effortless pop",
  },
  warmEarth: {
    story: "An autumn palette — warm, layered, and grounded. These colours remind people of good light and comfortable spaces. They're emotionally inviting.",
    emotion: "Warmth and approachability",
  },
  darkAndRich: {
    story: "Deep, saturated tones that absorb light rather than reflect it. This creates a look that reads as powerful and composed.",
    emotion: "Command and depth",
  },
  lightAndAiry: {
    story: "A palette that reflects light — everything feels open, clean, and effortless. The visual weight is low, which makes the outfit feel like it belongs in warm, beautiful places.",
    emotion: "Freedom and clarity",
  },
};

/**
 * Determine the color story type and return the narration.
 */
function getColorStory(items) {
  const colors = items.map(i => i.color).filter(Boolean);
  if (colors.length === 0) return null;

  // Detect palette type
  const allNeutral = colors.every(c =>
    ["white","black","gray","navy","beige","cream","ivory","camel","tan","charcoal","off-white"].includes(c)
  );
  if (allNeutral) return COLOR_STORIES.neutralOnNeutral;

  const uniqueColors = [...new Set(colors)];
  if (uniqueColors.length === 1) return COLOR_STORIES.monochromatic;

  const warmEarth = colors.every(c =>
    ["camel","rust","terracotta","mustard","olive","brown","beige","cream","tan"].includes(c)
  );
  if (warmEarth) return COLOR_STORIES.warmEarth;

  const darkRich = colors.every(c =>
    ["black","navy","charcoal","burgundy","wine","plum","dark brown","forest green"].includes(c)
  );
  if (darkRich) return COLOR_STORIES.darkAndRich;

  const lightAiry = colors.every(c =>
    ["white","cream","ivory","sky blue","mint","blush","lavender","peach","sage"].includes(c)
  );
  if (lightAiry) return COLOR_STORIES.lightAndAiry;

  const hasAccent = colors.filter(c =>
    !["white","black","gray","navy","beige","cream","ivory","camel","tan","charcoal"].includes(c)
  ).length === 1;
  if (hasAccent) return COLOR_STORIES.neutralPlusAccent;

  return COLOR_STORIES.analogous;
}


// ─────────────────────────────────────────────
// SECTION 6: THE FINISHING MOVE
// ─────────────────────────────────────────────

/**
 * The single detail that takes an outfit from 7/10 to 10/10.
 * Not accessories — the actual wearing detail.
 *
 * These are context-aware. They know what's in the outfit
 * and what the occasion demands.
 */
const FINISHING_MOVES = {
  byOccasion: {
    "casual": [
      "Leave exactly one part of the outfit slightly imperfect — a single cuff, a half-tuck. Perfection reads as trying too hard in casual contexts.",
      "Bare ankles: even in mid weather, showing ankle (no socks or low-cut socks) gives the outfit lightness.",
      "The final check: remove one accessory. If the outfit looks better without it, you've found your finishing move.",
    ],
    "office": [
      "Posture completes business wear. The same outfit slouched looks underdressed. Shoulders back, jacket open when sitting, closed when standing.",
      "A single touch of contrast colour — pocket square, watch strap, inner lining — signals personality within professional structure.",
      "Check the mirror for fabric pull: if anything pulls when you move, it breaks the professional illusion.",
    ],
    "date night": [
      "Scent placement: collar and wrist, never chest. Close conversation reveals it naturally.",
      "The last thing you put on should be the most considered — the watch, the shoes, the top layer. That last piece is what your date sees first.",
      "Wear something you've worn before and know you look good in. Confidence in familiar clothes outperforms a risky new outfit.",
    ],
    "party": [
      "The one statement piece should be worn with full commitment — if it's bold, don't dilute it with a nervous second bold piece.",
      "Check the venue lighting. Dark venues call for lighter colors or metallics. Bright venues can handle deeper tones.",
      "Movement test: dance once in the mirror. If anything shifts, pulls, or needs adjusting — fix it before you leave.",
    ],
    "ethnic": [
      "The footwear takes 30 seconds and changes everything. Never underestimate what the right jutti or kolhapuri does to a kurta.",
      "Pressing the kurta matters more than the kurta itself. An expensive embroidered kurta wrinkled looks cheaper than a plain cotton kurta pressed sharp.",
      "The dupatta or stole should be draped with a decision — don't just hang it. Drape it over one shoulder or both. A chosen drape reads as style.",
    ],
    "gym": [
      "The gym look is about cleanliness — clean shoes, clean fabric, nothing worn. Old gym clothes with holes signal you don't care. New gym clothes signal you're serious.",
      "Matching top and bottom in the same color reads as athlete, not accidental. Even in budget clothes.",
    ],
    "festival": [
      "Apply kajal or ethnic eye detail if relevant — ethnic wear is one context where eye detail is part of the costume language.",
      "The jewellery should be checked in the final mirror for jangle: too many metal-on-metal pieces that make noise break the elegance.",
    ],
  },

  // Universal finishing moves
  universal: [
    "The lint roller test: run it once over the entire outfit before leaving. Lint, hair, and dust are outfit killers that go unnoticed until someone's camera is on you.",
    "The movement test: sit down in the outfit. If it bunches, creases, or restricts — fix it before you leave.",
    "The smell test: fabric softener smell fades in 30 minutes. Make sure your outer layer isn't carrying old closed-wardrobe odour.",
    "Silhouette check from the side: most people only check the front mirror. A great outfit looks equally good from the side — check both.",
  ],
};

/**
 * Get the finishing move for an outfit and occasion.
 */
function getFinishingMove(items, occasion) {
  const occasionMoves = FINISHING_MOVES.byOccasion[occasion] || FINISHING_MOVES.byOccasion["casual"];
  const universalMove = FINISHING_MOVES.universal[Math.floor(Math.random() * FINISHING_MOVES.universal.length)];
  const occasionMove  = occasionMoves[Math.floor(Math.random() * occasionMoves.length)];

  return { primary: occasionMove, secondary: universalMove };
}


// ─────────────────────────────────────────────
// SECTION 7: PROPORTION DIRECTION
// ─────────────────────────────────────────────

/**
 * Silhouette and proportion coaching.
 * Goes beyond "oversized top + slim bottom" into
 * actual visual direction.
 */
const PROPORTION_COACHING = {
  rules: [
    {
      condition: (items) => items.some(i => ["wide leg jeans","wide leg trousers","pleated trousers"].includes(i.name)),
      advice: "Wide-leg bottoms shift the visual weight down. Counter this with a cropped or tucked top — the exposed waist re-centres your proportions.",
    },
    {
      condition: (items) => items.some(i => ["oversized tee","hoodie","sweatshirt"].includes(i.name)),
      advice: "Volume on top means slim below — no exceptions. The contrast between full and fitted is what makes the silhouette work.",
    },
    {
      condition: (items) => items.some(i => ["blazer","suit jacket","overcoat"].includes(i.name)),
      advice: "Structured outerwear creates shoulder width. Everything under it should be fitted — bulk under a structured jacket just reads as larger, not layered.",
    },
    {
      condition: (items) => items.some(i => ["crop top","bodysuit"].includes(i.name)),
      advice: "A cropped top only works with high-waist bottoms. The waistband should meet where the crop ends — any gap between them is styling, not accident.",
    },
    {
      condition: (items) => items.some(i => ["maxi skirt","maxi dress"].includes(i.name)),
      advice: "Maxi length needs height — real or visual. A heel (even 2cm block heel) makes the difference. With flats, the maxi should be tailored exactly to floor-length.",
    },
    {
      condition: (items) => items.some(i => ["midi skirt","midi dress"].includes(i.name)),
      advice: "The midi is the hardest length to wear well. A fitted top (not tucked) and a low-heeled shoe keeps the proportions clean. Avoid chunky soles.",
    },
    {
      condition: (items) => items.some(i => ["shorts"].includes(i.name)),
      advice: "Shorts expose leg. Use that. Slim on top — not tucked, not cropped — lets the legs read as the proportion. The hem of the shorts should be clean, not frayed.",
    },
  ],

  /**
   * The 1/3 - 2/3 rule — one of the most useful styling principles.
   */
  oneThirdRule: "The most flattering outfits divide the body into 1/3 and 2/3 visually — either the top takes 1/3 and bottom takes 2/3 (with a high waist) or vice versa. Equal halves make you look shorter.",
};

/**
 * Get proportion advice for the specific items in the outfit.
 */
function getProportionAdvice(items) {
  for (const rule of PROPORTION_COACHING.rules) {
    if (rule.condition(items)) return rule.advice;
  }
  return PROPORTION_COACHING.oneThirdRule;
}


// ─────────────────────────────────────────────
// SECTION 8: THE WOW ASSEMBLER
// ─────────────────────────────────────────────

/**
 * The main function of this engine.
 * Takes a scored outfit from fashionEngine.js and wraps it
 * in the full styling intelligence layer.
 *
 * Input:  a raw outfit object from fashionEngine.suggestOutfits()
 * Output: a richly styled outfit with personality, story, moves, and trends
 *
 * @param {object} rawOutfit   - from suggestOutfits(): { items, score, accessories }
 * @param {string} occasion
 * @param {string} weather
 * @param {object} userProfile
 * @returns {StyledOutfit}
 */
function styleOutfit(rawOutfit, occasion = "casual", weather = "mid", userProfile = {}) {
  const { items, score, accessories, selectedVibe } = rawOutfit;

  // Use the pre-selected vibe if the engine provided one, otherwise detect
  const personality = (selectedVibe && OUTFIT_PERSONALITIES[selectedVibe.toLowerCase()]) 
    ? { ...OUTFIT_PERSONALITIES[selectedVibe.toLowerCase()], vibe: selectedVibe }
    : detectOutfitPersonality(items);

  const microStyling     = getMicroStyling(items);
  const signatureMove    = getSignatureMove(items, occasion);
  const trends           = getOutfitTrends(items);
  const colorStory       = getColorStory(items);
  const finishingMove    = getFinishingMove(items, occasion);
  const proportionAdvice = getProportionAdvice(items);

  // Build the "why it works" explanation — narrative, not bullet
  const whyItWorks = buildWhyItWorks(items, score, personality, colorStory);

  // Build the "what you'll feel" line
  const feelLine = buildFeelLine(personality, occasion);

  return {
    // From fashionEngine
    items,
    score,
    accessories,

    // Styling intelligence
    personality,
    colorStory,
    whyItWorks,
    feelLine,
    signatureMove,
    microStyling,
    trends,
    finishingMove,
    proportionAdvice,

    // Summary
    outfitName: personality.vibe || score.outfitName,
    description: personality.description,
    wowReason: personality.wowReason,
    moodBoard: personality.moodBoard,
  };
}

/**
 * Apply styling intelligence to all outfits from suggestOutfits().
 * This is the function you call instead of suggestOutfits() directly.
 *
 * @param {Array} rawOutfits  - from suggestOutfits()
 * @param {string} occasion
 * @param {string} weather
 * @param {object} userProfile
 * @returns {StyledOutfit[]}
 */
function applyStyleIntelligence(rawOutfits, occasion, weather, userProfile = {}) {
  return rawOutfits.map(outfit =>
    styleOutfit(outfit, occasion, weather, userProfile)
  );
}

/**
 * The full pipeline in one call.
 * suggestOutfits() → applyStyleIntelligence() → styled results
 */
function suggestStyledOutfits(wardrobe, occasion, weather, userProfile = {}) {
  // Import suggestOutfits from fashionEngine — call it externally
  // This function wraps the result
  throw new Error(
    "Call suggestOutfits() from fashionEngine.js first, then pass results to applyStyleIntelligence(). " +
    "See usage example at bottom of file."
  );
}


// ─────────────────────────────────────────────
// SECTION 9: NARRATIVE BUILDERS
// ─────────────────────────────────────────────

function buildWhyItWorks(items, score, personality, colorStory) {
  const colors = items.map(i => i.color).filter(Boolean);
  const goodChecks = score.breakdown?.filter(b => b.score >= 8) || [];
  const mainReason = goodChecks[0]?.reason || "";

  let narrative = "";

  // Open with color story
  if (colorStory) {
    narrative += `${colorStory.story} `;
  }

  // Add the scoring reason
  if (mainReason) {
    narrative += `${mainReason} `;
  }

  // Add personality context
  if (personality.wowReason) {
    narrative += personality.wowReason;
  }

  return narrative.trim() ||
    "The combination works because each piece supports the others — nothing competes, everything contributes.";
}

function buildFeelLine(personality, occasion) {
  const feelMap = {
    "quiet authority":    "You'll feel like the most prepared person in the room — which you probably are.",
    "clean confidence":   "You'll feel like yourself, but dialled up exactly one notch.",
    "effortless cool":    "You'll feel like you weren't trying. Which is exactly the look.",
    "urban edge":         "You'll feel like the person others quietly clock when you walk in.",
    "golden hour":        "You'll feel warm, grounded, and like you belong somewhere beautiful.",
    "dark romanticism":   "You'll feel like you command space without asking for it.",
    "summer protagonist": "You'll feel light, alive, and like this city was made for this outfit.",
    "cultural power":     "You'll feel rooted. Confident in where you come from and where you're going.",
    "stealth wealth":     "You'll feel expensive. Not flashy — expensive.",
    "off-duty creative":  "You'll feel like an interesting person, which is better than looking like an interesting person.",
    "date night precision":"You'll feel present. The outfit is sorted — you can focus on everything else.",
    "festive fire":       "You'll feel like a celebration. Because you are one.",
  };

  const key = Object.keys(feelMap).find(k =>
    personality.vibe?.toLowerCase().includes(k)
  );

  return key ? feelMap[key] :
    "You'll feel like you made a decision — and that confidence will show.";
}


// ─────────────────────────────────────────────
// SECTION 10: OUTFIT CARD DATA STRUCTURE
// ─────────────────────────────────────────────

/**
 * Defines exactly what the frontend should display for each outfit.
 * This is the contract between this engine and your React components.
 *
 * A StyledOutfit has:
 *
 * HERO SECTION (what draws attention first):
 *   outfitName      — string: "Quiet Authority"
 *   description     — string: 1-sentence outfit story
 *   feelLine        — string: "You'll feel like..."
 *   score.grade     — "A" | "B" | "C" | "D"
 *   score.totalScore— number
 *
 * COLOR STORY (visual layer):
 *   colorStory.story    — why this palette feels the way it does
 *   colorStory.emotion  — one word: "Warmth and approachability"
 *
 * ITEMS LIST:
 *   items[]   — [{name, color, pattern}]
 *
 * THE MOVES (the actionable magic):
 *   signatureMove   — the one unexpected detail
 *   microStyling[]  — [{item, tip}] — how to wear each piece
 *   finishingMove.primary   — occasion-specific final detail
 *   finishingMove.secondary — universal final check
 *   proportionAdvice— silhouette direction
 *
 * CONTEXT:
 *   trends[]        — [{name, tip}] trend tags
 *   moodBoard[]     — ["old money", "effortless"]
 *   wowReason       — why people will notice this
 *
 * ACCESSORIES:
 *   accessories[]   — smart suggestions from fashionEngine
 *
 * SCORE BREAKDOWN (show only problems + top win):
 *   score.breakdown[]  — show score < 7 (warning) + score >= 9 (confirm)
 *   score.tips[]       — contextual tips
 */


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  // Core styling function
  applyStyleIntelligence,
  styleOutfit,

  // Individual modules (for custom use)
  detectOutfitPersonality,
  getMicroStyling,
  getSignatureMove,
  getOutfitTrends,
  getColorStory,
  getFinishingMove,
  getProportionAdvice,

  // Data (for UI rendering)
  OUTFIT_PERSONALITIES,
  MICRO_STYLING,
  SIGNATURE_MOVES,
  TRENDS_2024_2025,
  COLOR_STORIES,
  FINISHING_MOVES,
  PROPORTION_COACHING,
};


/*
// ── USAGE ──────────────────────────────────────────────────────

// In your app — after detecting items via Gemini:

import { suggestOutfits } from './fashionEngine.js';
import { applyStyleIntelligence } from './fashionStylingEngine.js';

// Step 1: Get raw outfit combinations from fashionEngine
const rawOutfits = suggestOutfits(wardrobe, occasion, weather, userProfile);

// Step 2: Apply styling intelligence — this is where the wow happens
const styledOutfits = applyStyleIntelligence(rawOutfits, occasion, weather, userProfile);

// Step 3: Each styled outfit now has:
styledOutfits.forEach(outfit => {
  console.log(outfit.outfitName);            // "Quiet Authority"
  console.log(outfit.description);           // "You don't announce yourself..."
  console.log(outfit.feelLine);              // "You'll feel like the most prepared..."
  console.log(outfit.colorStory.story);      // Why the palette works
  console.log(outfit.colorStory.emotion);    // "Calm authority"
  console.log(outfit.signatureMove);         // The one unexpected detail
  console.log(outfit.microStyling);          // [{item: "shirt", tip: "Roll sleeves..."}]
  console.log(outfit.finishingMove.primary); // The final occasion-specific move
  console.log(outfit.proportionAdvice);      // Silhouette direction
  console.log(outfit.trends);               // [{name:"Quiet Luxury", tip:"..."}]
  console.log(outfit.wowReason);            // Why people will notice it
  console.log(outfit.moodBoard);            // ["old money", "effortless polish"]
  console.log(outfit.accessories);           // Smart accessory suggestions
  console.log(outfit.score.totalScore);      // 8.5
  console.log(outfit.score.grade);           // "A"
});

// ── WHAT THE CARD LOOKS LIKE ─────────────────────────────────

// Instead of:
// "Navy shirt + beige chinos + white sneakers. Score: 8.5. Tip: tuck in your shirt."

// You now show:
//
// ┌─────────────────────────────────────────────┐
// │  QUIET AUTHORITY                     A 8.5  │
// │  "You don't announce yourself.              │
// │   You don't need to."                       │
// │                                             │
// │  You'll feel like the most prepared         │
// │  person in the room.                        │
// │                                             │
// │  COLOR STORY                                │
// │  Calm authority — this palette lets the     │
// │  silhouette do the talking.                 │
// │                                             │
// │  ✦ SIGNATURE MOVE                           │
// │  Roll sleeves to below elbow, tuck front    │
// │  half in. Leave back out. That contrast     │
// │  between structured and relaxed is it.      │
// │                                             │
// │  HOW TO WEAR IT                             │
// │  • Shirt: top button undone, sleeves x2     │
// │  • Chinos: clean ankle break, pressed crease│
// │  • Sneakers: no-show socks only             │
// │                                             │
// │  FINISHING MOVE                             │
// │  Remove one thing you were going to wear.   │
// │  If the outfit is better — that's the move. │
// │                                             │
// │  TRENDING NOW  ◉ Quiet Luxury               │
// │  "No logos, exceptional fit."               │
// └─────────────────────────────────────────────│
*/
