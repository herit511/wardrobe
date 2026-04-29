// ============================================================
//  fashionStylingEngine.js — v2 — The Wow Layer
//
//  This is not a validator. fashionEngine.js validates.
//  This is a STYLIST — opinionated, specific, and alive.
//
//  What separates this from everything else:
//
//  1.  25 named outfit personalities — each with a story,
//      a mood, a cultural reference, and a specific reason
//      people will notice you
//
//  2.  The 3-Second Rule — what someone registers about
//      you in the first 3 seconds, before you speak
//
//  3.  Micro-styling so specific it feels handcrafted —
//      not "roll your sleeves" but exactly how, exactly
//      where, and exactly why that detail changes everything
//
//  4.  The Anti-Tip — the single thing that will ruin
//      this specific outfit that most people get wrong
//
//  5.  Wear It 3 Ways — how the same items create 3
//      completely different looks for 3 different moments
//
//  6.  The Honest Upgrade — one specific addition that
//      transforms this from good to unforgettable
//
//  7.  Photographer's Note — what setting, light, and
//      angle this outfit was made for
//
//  8.  Indian Cultural Intelligence — Bollywood references,
//      regional context, festival specifics that actually
//      mean something to someone from India
//
//  9.  The "You'll Be Remembered For" line — specific,
//      not generic. The detail someone will describe
//      when they tell a friend about you later
//
//  10. Occasion Transition — how to take this look
//      from where it is to the next level up
// ============================================================


// ─────────────────────────────────────────────
// SECTION 1: OUTFIT PERSONALITIES (25 named looks)
// ─────────────────────────────────────────────

/**
 * Each personality is a COMPLETE STORY about an outfit.
 * triggeredBy: the color + item signals that create this look
 * threeSecondRule: what registers in the first 3 seconds
 * culturalRef: the person/moment this energy references
 * antiTip: the single thing that kills this specific look
 * youllBeRememberedFor: the detail they'll describe to someone else
 */
const OUTFIT_PERSONALITIES = {

  "quiet authority": {
    vibe: "Quiet Authority",
    description: "You don't announce yourself. You don't need to. This outfit reads as someone who has already arrived — not arriving.",
    moodBoard: ["boardroom confidence", "old money", "effortless polish", "control"],
    triggeredBy: {
      colors: [["navy","beige"],["charcoal","white"],["camel","white"],["navy","white"],["charcoal","camel"]],
      items:  [["shirt","chinos"],["dress shirt","trousers"],["blazer","chinos"],["blazer","trousers"]],
    },
    threeSecondRule: "Posture and palette. Before anyone registers what you're wearing, they register that every piece is in its place. That stillness reads as authority.",
    wowReason: "The restraint is the statement. Every expensive-looking outfit shouts. This one doesn't. That silence is the loudest thing in the room.",
    culturalRef: "Mahendra Singh Dhoni in a navy suit at a press conference — not the most decorated blazer, not the loudest color. Just precise. Just enough.",
    youllBeRememberedFor: "The fact that everything fit. Not a loose collar, not a billowing hem. The precision is what people notice even when they can't name it.",
    antiTip: "Don't add a statement accessory to prove you have personality. This outfit's personality IS the restraint. A loud watch or a graphic tee underneath destroys it.",
  },

  "clean confidence": {
    vibe: "Clean Confidence",
    description: "Minimal. Intentional. The look that says you know exactly who you are without needing anyone else to agree.",
    moodBoard: ["minimalist", "understated", "precise", "certain"],
    triggeredBy: {
      colors: [["white","navy"],["white","black"],["black","gray"],["all-white"],["all-black"],["navy","navy"]],
      items:  [["turtleneck","trousers"],["white sneakers","straight jeans"],["shirt","slim jeans"]],
    },
    threeSecondRule: "Color story first. A monochromatic or near-monochromatic outfit reads as a deliberate aesthetic decision, not a lazy one. People instantly understand you made a choice.",
    wowReason: "Monochromatic outfits photograph beautifully and age well in memory. Someone describing you to a friend says 'all black' or 'all white' — not 'I can't remember.' You became a visual moment.",
    culturalRef: "Steve Jobs built an identity on this. In India — Virat Kohli in an all-white casual look or Deepika Padukone in monochromatic beige. The palette becomes the signature.",
    youllBeRememberedFor: "The simplicity that somehow looked expensive. People will wonder what brand it is. It's not brand — it's intention.",
    antiTip: "The single thing that ruins monochromatic: different whites. Bright white shoes with warm ivory shirt — they fight each other visibly. Make sure whites and blacks are the same temperature.",
  },

  "effortless cool": {
    vibe: "Effortless Cool",
    description: "This looks like you threw it on in 3 minutes. It took 3 minutes. That's the point — and no one will believe you.",
    moodBoard: ["off-duty", "relaxed", "French casual", "lived-in"],
    triggeredBy: {
      colors: [["white","denim"],["gray","white"],["navy","white"],["beige","white"],["denim","white"]],
      items:  [["t-shirt","jeans"],["shirt","jeans"],["white sneakers","jeans"],["linen shirt","shorts"]],
    },
    threeSecondRule: "Movement. Effortless cool only registers when you move — when the shirt falls naturally, when the jeans don't restrict. Static, it looks basic. In motion, it looks right.",
    wowReason: "The genius is in the one imperfect detail — a half-tuck, a single cuff. That one deviation from perfect symmetry signals you styled this rather than just wore it.",
    culturalRef: "Shah Rukh Khan at the airport — jeans, white shirt, nothing more. Ranbir Kapoor in denim and a tee. The Indian casual that doesn't look like it tried is the hardest look to pull off.",
    youllBeRememberedFor: "That one detail — the cuff, the half-tuck, the open collar. People won't name it but they'll say 'they looked really put-together somehow.'",
    antiTip: "New shoes ruin effortless cool. Box-fresh white sneakers next to a worn-in denim look scream 'I'm trying.' Slightly worn-in is the correct level.",
  },

  "urban edge": {
    vibe: "Urban Edge",
    description: "This outfit has tension — a deliberate collision between two worlds that makes it look like it was styled by someone who knows rules well enough to break them.",
    moodBoard: ["streetwear", "editorial", "high-low contrast", "tension"],
    triggeredBy: {
      colors: [["black","white"],["black","red"],["charcoal","cobalt"],["olive","black"],["gray","black"]],
      items:  [["leather jacket","jeans"],["hoodie","trousers"],["graphic tee","blazer"],["cargo pants","shirt"]],
    },
    threeSecondRule: "The contrast registers first. Structured meets casual, formal meets street — the visual tension is what makes people look twice.",
    wowReason: "The high-low contrast creates a visual argument — expensive piece + casual piece. The eye keeps resolving the tension. That active looking is what creates impact.",
    culturalRef: "Ranveer Singh in a blazer over a graphic tee. Badshah at an airport in a hoodie with tailored trousers. The collision between street and formal is the Indian urban aesthetic right now.",
    youllBeRememberedFor: "The unexpected combination that somehow worked. They'll say 'they wore a [formal piece] with [casual piece] and it was actually sick.'",
    antiTip: "One contrast element only. Leather jacket + torn jeans + graphic tee + chunky chain = too many arguments happening at once. Pick one collision and let everything else be neutral.",
  },

  "golden hour": {
    vibe: "Golden Hour",
    description: "Warm, rich, and layered in a way that photographs like it was lit by a sunset. Earth tones don't just look good — they feel good. This is that.",
    moodBoard: ["earthy", "warm", "Italian autumn", "harvest", "gilded"],
    triggeredBy: {
      colors: [["camel","rust"],["mustard","olive"],["terracotta","beige"],["brown","camel"],["rust","cream"],["amber","brown"]],
      items:  [["sweater","chinos"],["cardigan","trousers"],["shirt","chinos"]],
    },
    threeSecondRule: "Warmth. Before the outfit registers, the warmth does. Earth tones trigger comfort and approachability in the viewer before they've consciously clocked what you're wearing.",
    wowReason: "Earth tones create an outfit that feels warm before you touch it. Under natural light or golden indoor light, these tones glow while other palettes go flat.",
    culturalRef: "This is the Rajasthan aesthetic in contemporary form — the richness of Rajasthani color filtered through a modern silhouette. Jaideep Ahlawat in warm browns. Pankaj Tripathi in earthy textures.",
    youllBeRememberedFor: "The warmth of the overall palette. Someone will describe you as 'they were wearing these warm autumn colors' — not the specific pieces, the feeling.",
    antiTip: "Cold metals destroy this look. Silver watch, silver chain — they sit cold inside a warm palette and create a visual argument. Go gold, bronze, or no metal at all.",
  },

  "dark romanticism": {
    vibe: "Dark Romanticism",
    description: "Rich, deep, and layered. The kind of outfit that commands a room without raising its voice. Darkness done with depth, not just absence of color.",
    moodBoard: ["evening sophistication", "old world", "cinematic", "velvet", "candlelight"],
    triggeredBy: {
      colors: [["burgundy","black"],["navy","burgundy"],["plum","charcoal"],["wine","black"],["emerald","black"],["bottle green","charcoal"]],
      items:  [["blazer","trousers"],["turtleneck","trousers"],["overcoat","jeans"],["leather jacket","black jeans"]],
    },
    threeSecondRule: "Depth. Dark outfits that use two different dark color families create dimension — not a dark blob but a layered composition. That depth registers as sophistication.",
    wowReason: "Burgundy against navy creates a tonal depth that lighter colors never achieve. The eye sees richness. It reads as deliberately, confidently dark — not accidentally.",
    culturalRef: "Nawazuddin Siddiqui at award shows — dark blazer, darker shirt, no flash. The combination commands rather than shouts. This is the look of someone who doesn't need approval.",
    youllBeRememberedFor: "The depth of the dark. 'They were in all dark but it looked expensive somehow' — that somehow is the use of two different dark tones rather than one.",
    antiTip: "Avoid shiny fabric in this palette. A satin burgundy shirt against a matte black blazer creates a cheap contrast. Keep textures consistent — matte with matte, or one subtle sheen maximum.",
  },

  "summer protagonist": {
    vibe: "Summer Protagonist",
    description: "You're the main character of every outdoor setting in this. Light, clean, and alive. The sun doesn't beat you — it works with you.",
    moodBoard: ["mediterranean", "resort", "energy", "clean air", "Goa afternoon"],
    triggeredBy: {
      colors: [["white","beige"],["sky blue","white"],["coral","white"],["mint","white"],["linen","natural"]],
      items:  [["shirt","shorts"],["t-shirt","shorts"],["linen shirt","chinos"],["linen shirt","linen trousers"]],
    },
    threeSecondRule: "Lightness. Light-colored outfits in outdoor settings create a visual brightness — you stand out against almost any backdrop without competing with it.",
    wowReason: "Light colors in hot weather reflect light back — you glow rather than absorb. Linen creates visible texture that photographs beautifully. This outfit was made for natural light.",
    culturalRef: "The Goa morning look — white linen shirt, linen trousers, leather sandals. The coastal India aesthetic that exists between casual and refined. You've seen it on every coffee shop Instagram from Goa to Pondicherry.",
    youllBeRememberedFor: "The ease. 'They looked so light and comfortable' — which is exactly the effect. It looks warm, easy, like you've been somewhere beautiful and just arrived.",
    antiTip: "Heavyweight fabrics destroy this. A cotton t-shirt that clings, denim that's too thick — both fight the summer energy. Linen or light cotton only. If you're sweating through it, it's wrong.",
  },

  "cultural power": {
    vibe: "Cultural Power",
    description: "Rooted and confident. This outfit is a statement of identity — dressed in heritage as a choice, not an obligation. The difference is everything.",
    moodBoard: ["ethnic elegance", "heritage", "celebration", "identity", "pride"],
    triggeredBy: {
      colors: [["white","gold"],["mustard","white"],["navy","gold"],["burgundy","gold"],["ivory","gold"]],
      items:  [["kurta","churidar"],["sherwani","churidar"],["kurta","chinos"],["nehru jacket","shirt","trousers"]],
    },
    threeSecondRule: "Identity. Ethnic wear worn with confidence registers differently than ethnic wear worn reluctantly. The 3-second read is 'this person chose this' — and that confidence is magnetic.",
    wowReason: "Intentional ethnic styling signals something that Western fashion can't — cultural fluency. Someone who wears traditional with this level of intention is showing two kinds of taste at once.",
    culturalRef: "Vikram Vedha-era Hrithik Roshan in a kurta. A.R. Rahman at any international stage in a crisp white kurta. The image of Indian excellence in Indian clothes. That's the register.",
    youllBeRememberedFor: "The confidence of the cultural choice. 'They wore ethnic and it looked cool, not formal' — that's the register you're going for.",
    antiTip: "Scuffed shoes completely undermine ethnic wear. A pristine kurta with dusty mojari looks like the shoes were forgotten. Footwear is the final signature of ethnic styling — it must be clean.",
  },

  "stealth wealth": {
    vibe: "Stealth Wealth",
    description: "Nothing branded, nothing loud. But everything communicates quality in a frequency that only people with taste can hear. Quiet luxury — the real version.",
    moodBoard: ["old money", "Loro Piana energy", "understated luxury", "fabric over flash"],
    triggeredBy: {
      colors: [["camel","cream"],["camel","white"],["gray","camel"],["navy","camel"],["beige","ivory"],["oat","camel"]],
      items:  [["overcoat","trousers"],["trench coat","chinos"],["cashmere sweater","trousers"],["blazer","trousers"]],
    },
    threeSecondRule: "Precision. Before anyone registers the specific pieces, they sense that every proportion is exactly right. That sense of 'nothing is wrong here' reads immediately as expensive.",
    wowReason: "The palette is entirely neutral but the proportions are perfect. The fabric drapes correctly. There's nothing to look at except the architecture of the outfit — and the architecture is immaculate.",
    culturalRef: "Kumar Mangalam Birla. Anand Mahindra on a weekend. Old Delhi business family on a regular Tuesday. Not trying. Just correct. The look of people who don't need fashion to make a statement because the statement was already made.",
    youllBeRememberedFor: "The quality of the fabric in motion. When you walk, the coat swings correctly, the trousers drape — people notice the quality before they notice you.",
    antiTip: "Fast fashion fabrics destroy stealth wealth instantly. A polyester blazer that shines under light, a camel coat that pills — the entire illusion collapses. This look only works with natural fibres.",
  },

  "off-duty creative": {
    vibe: "Off-Duty Creative",
    description: "Relaxed but clearly considered. The kind of outfit a director, designer, or architect wears to not try — but unmistakably still try. The creative's paradox.",
    moodBoard: ["creative industry", "downtown", "art world", "considered mess"],
    triggeredBy: {
      colors: [["black","black"],["olive","black"],["gray","black"],["navy","olive"],["charcoal","olive"]],
      items:  [["wide leg jeans","t-shirt"],["cargo pants","plain tee"],["oversized tee","chinos"],["straight jeans","turtleneck"]],
    },
    threeSecondRule: "Proportion. The deliberate size contrast between top and bottom registers as an aesthetic decision — not a mistake. That's what reads as 'creative.'",
    wowReason: "Proportion play is doing all the work. Wide on one, slim or cropped on the other. Dark neutral palette. Looks directional without announcing it. The art-world uniform for a reason.",
    culturalRef: "Anurag Kashyap on set. Zoya Akhtar at a creative meeting. The Indian creative class uniform — dark tones, interesting proportion, zero flash. Tells you everything about who they are before they speak.",
    youllBeRememberedFor: "The proportion choice. 'They were wearing this wide-leg thing with a simple tee and it looked really deliberate' — that deliberateness is the takeaway.",
    antiTip: "Bright accessories collapse this look. A bright red cap or loud sneakers pull attention away from the proportional game that IS the look. Everything must be in the dark neutral family.",
  },

  "date night precision": {
    vibe: "Date Night Precision",
    description: "Dressed up without announcing it. You look like yourself, just dialled exactly one notch. The goal: memorable, not costume.",
    moodBoard: ["confidence", "presence", "warmth", "intentional"],
    triggeredBy: {
      colors: [["navy","white"],["charcoal","white"],["black","white"],["burgundy","navy"],["dark teal","black"]],
      items:  [["shirt","trousers"],["turtleneck","jeans"],["blazer","shirt","jeans"],["shirt","chinos"]],
    },
    threeSecondRule: "Grooming + outfit as a unit. Date night outfits that work aren't noticed as outfits — they're noticed as a person who looks good. The outfit disappears and you remain.",
    wowReason: "The precision is in what you didn't overdo. One elevated piece — the shoes, the watch, the collar — does all the work. Everything else supports it. Restraint is confidence.",
    culturalRef: "Sidharth Malhotra at a casual restaurant dinner. The look that reads as effort without looking like effort is the exact sweet spot. Clean, warm, specific.",
    youllBeRememberedFor: "That one elevated piece. 'They had these amazing boots' or 'the watch was beautiful' — the single piece you elevated becomes the image memory.",
    antiTip: "New outfit anxiety shows. Don't wear something for the first time on a date — unfamiliar clothes cause adjustment anxiety and your date will notice you pulling and fidgeting. Wear something you know works.",
  },

  "festive fire": {
    vibe: "Festive Fire",
    description: "Rich, celebratory, unmistakably intentional. You walked in and the room recalibrated. Not loud — significant.",
    moodBoard: ["celebration", "festival", "jewel tones", "joy", "entrance"],
    triggeredBy: {
      colors: [["burgundy","gold"],["emerald","gold"],["royal blue","gold"],["deep red","cream"],["royal purple","gold"]],
      items:  [["kurta","churidar"],["sherwani","churidar"],["nehru jacket","shirt","trousers"],["bandhgala","trousers"]],
    },
    threeSecondRule: "Richness. Jewel tones under warm indoor festival light do something physically different — they absorb and re-emit the warmth. The look literally glows. That glow registers in 3 seconds.",
    wowReason: "This is not an outfit. It's an entrance. The combination of jewel tone + traditional silhouette + gold accessory creates a visual event. The room notices and then adjusts.",
    culturalRef: "Ranveer Singh at Anant Ambani's wedding. Salman Khan at Diwali. The Indian festive power look — not excess, but abundance. Every element chosen, none accidental.",
    youllBeRememberedFor: "The overall richness. 'They were in this deep emerald sherwani with gold — they looked incredible' — color + silhouette becomes one memory.",
    antiTip: "Silver accessories with jewel tones is a category error. Gold is the metal of festive wear — silver cools everything down and fights the warmth. Gold or copper only.",
  },

  "campus legend": {
    vibe: "Campus Legend",
    description: "The outfit that walks into a lecture and instantly communicates personality without trying. Not fashion — character.",
    moodBoard: ["college", "personality", "approachable cool", "casual authority"],
    triggeredBy: {
      colors: [["gray","white"],["white","denim"],["navy","white"],["olive","white"],["black","white"]],
      items:  [["hoodie","jeans"],["polo shirt","chinos"],["t-shirt","cargo pants"],["denim jacket","jeans"]],
    },
    threeSecondRule: "Energy. Campus looks that work project energy without effort. The fit is clean, the palette is readable, and there's one personality element — a color, a jacket — that makes it specific to you.",
    wowReason: "College contexts have dress codes nobody admits — too formal looks try-hard, too casual looks like you stopped caring. The sweet spot is exactly one element above baseline. That one element is everything.",
    culturalRef: "Every IIT/IIM campus protagonist energy — the person who doesn't need to dress up to stand out because they dress with enough personality to be distinct without trying to be.",
    youllBeRememberedFor: "That one element of personality — the olive jacket, the interesting watch, the non-obvious shoe. 'The person who always has a good sense of style but never looks overdressed.'",
    antiTip: "Wearing formal shoes on campus reads as someone who got lost from a job fair. Keep shoes firmly casual. The disconnect between campus context and formal shoes is jarring.",
  },

  "monsoon mood": {
    vibe: "Monsoon Mood",
    description: "Layered, rich, and weather-aware. The Indian monsoon/cold season look — darker, deeper, wrapped in texture and intention.",
    moodBoard: ["monsoon", "warm indoors", "texture", "depth", "layers"],
    triggeredBy: {
      colors: [["olive","camel"],["navy","gray"],["charcoal","burgundy"],["forest green","tan"],["brown","cream"]],
      items:  [["denim jacket","jeans"],["cardigan","trousers"],["flannel shirt","jeans"],["sweater","chinos"]],
    },
    threeSecondRule: "Texture. Layered cold-weather outfits register as texture-rich first. The visual complexity of multiple fabrics and tones reads as sophisticated in under 3 seconds.",
    wowReason: "India doesn't do cold weather fashion well enough. The difference between looking cold and looking styled in the cold is deliberate layering — and this outfit does it.",
    culturalRef: "The Shimla/Manali winter look that actually works. Delhi winters done right. Not the tourist in too many layers — the person who looks warm and considered simultaneously.",
    youllBeRememberedFor: "The layering architecture. 'They had this great jacket over a great sweater — it all worked together' — that cohesive layering is what sticks.",
    antiTip: "Layers that don't taper break the silhouette. Chunky hoodie under a chunky jacket over baggy jeans = shapeless. One layer should be fitted for every loose layer. Architecture, not just warmth.",
  },

  "board meeting energy": {
    vibe: "Board Meeting Energy",
    description: "Business formal done without becoming a costume. You look like the room belongs to you — without the room needing to agree.",
    moodBoard: ["authority", "precision", "professional command", "clean power"],
    triggeredBy: {
      colors: [["charcoal","white"],["navy","white"],["gray","white"],["black","white"],["charcoal","light blue"]],
      items:  [["suit jacket","dress shirt","trousers"],["blazer","dress shirt","trousers"],["dress shirt","trousers"]],
    },
    threeSecondRule: "Fit. Formal wear that fits registers as powerful. Formal wear that doesn't fit registers as a costume. The 3-second read is determined entirely by whether the shoulders sit correctly.",
    wowReason: "Business formal is the uniform of authority — but only when it fits and is pressed. A perfectly fitted charcoal blazer with a white dress shirt communicates competence before you open your mouth.",
    culturalRef: "Mukesh Ambani at a board meeting. Ratan Tata at any public appearance. The Indian corporate authority look — never flashy, always exact. The tie optional, the fit non-negotiable.",
    youllBeRememberedFor: "The shoulder fit. 'They were in this perfect navy suit' — the vague rightness of formal wear that fits is the takeaway. People remember the overall precision.",
    antiTip: "Cheap shoes destroy business formal completely. A ₹20,000 blazer with ₹1,500 shoes reads as someone who got the jacket right and forgot the rest. Shoes and belt are the two finishing elements that must be quality.",
  },

  "south asian heat": {
    vibe: "South Asian Heat",
    description: "Hot weather, Indian context, dressed with intelligence. Not just comfortable — considered. The person who knows how to dress for Indian summer with style.",
    moodBoard: ["Indian summer", "heat-intelligent", "light mastery", "Bombay morning"],
    triggeredBy: {
      colors: [["white","white"],["cream","beige"],["sky blue","white"],["ivory","white"],["light gray","white"]],
      items:  [["linen shirt","linen trousers"],["t-shirt","shorts"],["polo shirt","chinos"],["kurta","churidar"]],
    },
    threeSecondRule: "Lightness. In Indian heat, a light-colored breathable-looking outfit registers as visually cool before anyone knows if you actually are. The eye reads the color temperature before the weather.",
    wowReason: "Most people in Indian heat just survive. This outfit actively works with the climate — light colors reflecting heat, breathable fabric creating airflow. You look cooler than the temperature.",
    culturalRef: "The Bombay morning commute person who arrives looking pressed. The Chennai summer professional who has figured it out. White kurta, white linen — the South Asian heat uniform with intelligence.",
    youllBeRememberedFor: "Looking like you weren't affected by the heat. 'They always look fresh even in this weather' — heat-appropriate dressing is a skill and people notice it.",
    antiTip: "Dark accessories in hot weather. A black leather watch strap absorbs heat and sits hot against the wrist. Light metal, fabric straps, or no watch in extreme heat. The detail matters.",
  },

  "indo western architect": {
    vibe: "Indo-Western Architect",
    description: "Two aesthetics, one coherent vision. Not a fusion accident — a deliberate design decision. The kurta with jeans that looks like it was planned by someone who understands both worlds.",
    moodBoard: ["indo-western", "cultural fluency", "contemporary heritage", "dual identity"],
    triggeredBy: {
      colors: [["white","denim"],["navy","white"],["cream","indigo"],["mustard","denim"],["olive","cream"]],
      items:  [["kurta","jeans"],["kurta","chinos"],["nehru jacket","shirt","jeans"],["pathani suit top","chinos"]],
    },
    threeSecondRule: "The intentionality of the fusion. A kurta with jeans that works registers as a confident cultural choice. One that doesn't looks like someone couldn't decide. The difference is in the details.",
    wowReason: "Indo-western done well is genuinely hard and increasingly valuable. It signals someone who is fluent in two aesthetic languages — that cultural code-switching reads as sophisticated.",
    culturalRef: "Irrfan Khan's everyday off-set look. Pankaj Tripathi in a kurta over well-fitted jeans. The look that says 'I contain multitudes' without explaining itself.",
    youllBeRememberedFor: "The specific combination that worked. 'They were in a kurta with jeans but it actually looked really good' — the fact that fusion worked is the memory.",
    antiTip: "Heavy embroidery with ripped or distressed denim is a visual collision that reads as confused rather than fusion. The ethnic piece and the western piece need compatible formality levels.",
  },

  "gym main character": {
    vibe: "Gym Main Character",
    description: "Athletic wear that looks intentional — a matching set, a considered color, a pair of shoes that are actually right for the activity. The gym look that reads as discipline.",
    moodBoard: ["athletic", "discipline", "function-forward", "clean performance"],
    triggeredBy: {
      colors: [["black","black"],["gray","black"],["navy","gray"],["white","black"],["olive","black"]],
      items:  [["t-shirt","shorts"],["tank top","joggers"],["t-shirt","joggers"],["crop top","leggings"]],
    },
    threeSecondRule: "Matching. A gym look where the top and bottom are either the same color or clearly chosen together registers as someone who takes their training seriously. That intentionality reads fast.",
    wowReason: "Gym aesthetics have a specific power — the person who looks put-together in athletic wear signals that discipline carries across contexts. It's character signaling through clothing.",
    culturalRef: "Akshay Kumar's gym aesthetic — matching blacks and grays, nothing flashy. The Indian athlete look that isn't about fashion but reads as focused. Virat Kohli's training wear — functional and deliberate.",
    youllBeRememberedFor: "The matching set. 'They always look like they actually train' — gym wear that matches communicates serious intent even if the session was light.",
    antiTip: "Cotton for serious workouts is the biggest gym style mistake. Cotton absorbs sweat and goes heavy and shapeless — you look worse as the session goes on. Dry-fit only for anything beyond light walking.",
  },

  "wedding house energy": {
    vibe: "Wedding House Energy",
    description: "Wedding guest who knows the difference between dressing for the event and dressing for the photographs. Both audiences served, neither disappointed.",
    moodBoard: ["celebration", "photo-ready", "joyful formal", "festive appropriate"],
    triggeredBy: {
      colors: [["royal blue","gold"],["emerald","cream"],["burgundy","ivory"],["deep purple","silver"],["coral","gold"]],
      items:  [["sherwani","churidar"],["bandhgala","trousers"],["blazer","dress shirt","trousers"],["kurta","churidar"]],
    },
    threeSecondRule: "Color and formality alignment. At a wedding, the first read is whether you understood the dress code. Someone who read the room correctly registers as someone who respects the occasion.",
    wowReason: "Wedding wear that photographs well under warm indoor light is a specific skill. Jewel tones and deep colors do this — they absorb warm light and glow rather than wash out.",
    culturalRef: "Every Bollywood wedding scene — the baraati who looks better than the groom's friend who tried too hard. The guest who nailed it without competing. That balance is the goal.",
    youllBeRememberedFor: "The color. 'There was someone in this incredible deep blue at the wedding' — rich color at weddings becomes the identifying detail in photos and memories.",
    antiTip: "White is the one color to avoid at an Indian wedding guest (it can read as inauspicious in many regional contexts). Light colors that wash out under flash photography are also risky. Rich tones photograph best.",
  },

  "quiet luxury india": {
    vibe: "Quiet Luxury — Indian Edit",
    description: "The Indian interpretation of stealth wealth — where quality fabric meets considered ethnic silhouette. Nothing shouts. Everything costs.",
    moodBoard: ["premium ethnic", "understated Indian", "khadi meets cashmere", "heritage luxury"],
    triggeredBy: {
      colors: [["ivory","cream"],["off-white","beige"],["camel","gold"],["cream","gold"],["oat","natural"]],
      items:  [["kurta","trousers"],["nehru jacket","shirt","trousers"],["bandhgala","trousers"],["kurta","chinos"]],
    },
    threeSecondRule: "Fabric quality. A high-quality khadi kurta or a well-cut linen nehru jacket reads differently from a polyester ethnic piece — the drape, the texture, the weight registers immediately.",
    wowReason: "The Indian luxury aesthetic isn't imported — it exists in handwoven fabrics, in the drape of quality silk, in the precision of a well-cut kurta. This outfit accesses that.",
    culturalRef: "Amitabh Bachchan at a literary event. Kumar Vishwas on stage. The Indian intellectual-creative's festive look — fabric that speaks, silhouette that serves.",
    youllBeRememberedFor: "The quality of the fabric. 'That kurta looked expensive' — fabric quality is the signal. Handloom, linen, khadi all carry this quietly.",
    antiTip: "Mixing luxury fabric with cheap accessories destroys this look faster than anything else. A ₹15,000 silk kurta with ₹200 plastic buttons or a polyester dupatta — the inconsistency is immediately readable.",
  },

  "athleisure architect": {
    vibe: "Athleisure Architect",
    description: "Athletic wear elevated to everyday wear through precision of fit and palette. Not gym clothes out of context — a deliberate urban aesthetic.",
    moodBoard: ["athleisure", "contemporary", "urban athletic", "movement meets style"],
    triggeredBy: {
      colors: [["black","gray"],["navy","gray"],["olive","black"],["charcoal","white"],["black","white"]],
      items:  [["joggers","hoodie"],["track pants","zip hoodie"],["bomber jacket","joggers"],["bomber jacket","track pants"]],
    },
    threeSecondRule: "Silhouette. Athleisure that works has a clear silhouette — a defined shape even in relaxed clothes. Matching colors, tapered fits, one structured element elevates the whole.",
    wowReason: "Athleisure works when it looks like a choice rather than an accident. The matching palette, the bomber over joggers — together they create a look that's relaxed but clearly authored.",
    culturalRef: "The Mumbai gym regular who goes from workout to coffee to meeting without changing. The look that transitions because it was designed to. Hardik Pandya's casual range — athletic but dressed.",
    youllBeRememberedFor: "The deliberateness. 'They were in sweats but it looked so good' — the controlled palette and fit make athleisure look designed rather than lazy.",
    antiTip: "Mixing athletic brands badly. A Nike top with Adidas joggers and Puma shoes creates a brand salad that reads as random. Either go all one brand or go all no-brand. The brand collision is the tell.",
  },

  "minimal menace": {
    vibe: "Minimal Menace",
    description: "All black. No apology. This isn't nihilism — it's the confidence to let the silhouette speak when color is removed. Dangerous in the best possible way.",
    moodBoard: ["all-black", "silhouette forward", "confident darkness", "no compromise"],
    triggeredBy: {
      colors: [["black","black"],["off-black","black"],["charcoal","black"]],
      items:  [["turtleneck","trousers"],["t-shirt","jeans"],["blazer","shirt","trousers"],["leather jacket","jeans"]],
    },
    threeSecondRule: "Silhouette only. Without color, the shape is everything. All-black that works has a considered shape — wide then narrow, or fitted throughout. All-black that doesn't is just a dark blob.",
    wowReason: "All-black is the hardest thing to wear badly AND the hardest thing to wear perfectly. The line between looking powerful and looking like a dark shapeless mass is the fit. When it's right, it's unforgettable.",
    culturalRef: "Steve Jobs made this look a philosophy. In India — AR Rahman's signature stage look. Rajkummar Rao in all-black at award events. The person who doesn't use color as a crutch.",
    youllBeRememberedFor: "The intentional darkness. 'They were in all black but it wasn't boring — it was sharp.' The sharpness is the memory, not the blackness.",
    antiTip: "Mixed blacks. Washed-out black jeans with a fresh black jacket — the two blacks fight each other and the whole look reads as faded rather than intentional. All blacks must be the same tone and freshness.",
  },

  "the returnee": {
    vibe: "The Returnee",
    description: "Someone who has been somewhere beautiful and brought the best of it back. Not tourist — well-travelled. The look that references a world without naming it.",
    moodBoard: ["well-travelled", "continental", "cultured casual", "worldly"],
    triggeredBy: {
      colors: [["tan","white"],["beige","denim"],["cream","brown"],["sand","navy"],["natural","camel"]],
      items:  [["linen shirt","jeans"],["linen shirt","chinos"],["linen shirt","shorts"],["white shirt","chinos"]],
    },
    threeSecondRule: "The linen. There's something about linen that registers as 'this person has been somewhere.' The crease, the texture, the relaxed fall of it — it looks well-travelled.",
    wowReason: "Linen in a good light with clean proportions is one of the most naturally beautiful fabric-silhouette combinations. It photographs well, moves well, and reads as someone who prioritises comfort AND quality.",
    culturalRef: "The Goa-Mumbai creative. The person who went to Europe for three months and came back with better taste in coffee and linen shirts. The Indian who references the Mediterranean without saying it.",
    youllBeRememberedFor: "The ease. 'They always look like they've just arrived from somewhere nice.' That feeling of arriving rather than trying is what sticks.",
    antiTip: "Over-ironing linen kills the look. Linen is meant to have a natural crease — a perfectly pressed linen shirt looks like you didn't understand linen. Let the natural texture live.",
  },

  "power casual": {
    vibe: "Power Casual",
    description: "The person who could walk into a boardroom from this casual look and not lose authority. Casual that has an undercurrent of capability.",
    moodBoard: ["relaxed authority", "weekend CEO", "effortless competence"],
    triggeredBy: {
      colors: [["navy","beige"],["camel","gray"],["navy","gray"],["charcoal","beige"]],
      items:  [["polo shirt","chinos"],["shirt","jeans","blazer"],["sweater","trousers"],["turtleneck","chinos"]],
    },
    threeSecondRule: "Quality texture at a casual formality. The combination of premium-looking fabric with a relaxed silhouette reads as someone who could dress up but chose not to — which is more powerful than dressing up.",
    wowReason: "Power casual is the most sophisticated of all registers — it requires real clothes quality because there's no formality structure to hide behind. The fabric has to carry the look alone.",
    culturalRef: "Narayana Murthy on a weekend. Azim Premji's non-meeting days. The look that says success is resting, not performing.",
    youllBeRememberedFor: "The quality fabric in a casual setting. 'They were dressed casually but it looked expensive somehow' — premium casual is that exact sensation.",
    antiTip: "Visible brand logos on power casual are a mistake — the look's power comes from quality over signalling. A visible Gucci logo or Supreme print collapses the subtlety into the obvious.",
  },
};


// ─────────────────────────────────────────────
// SECTION 2: THE 3-SECOND RULE SYSTEM
// ─────────────────────────────────────────────

/**
 * The human eye registers an outfit in this order:
 * 1. Color (0–0.5 seconds)
 * 2. Silhouette / proportion (0.5–1.5 seconds)
 * 3. Specific items and details (1.5–3 seconds)
 *
 * Great outfits are designed with all 3 layers.
 * Most outfits only think about layer 3.
 *
 * This system generates a specific 3-second breakdown
 * for each outfit.
 */
function getThreeSecondBreakdown(items, personality) {
  const colors = items.map(i => i.color).filter(Boolean);
  const names  = items.map(i => i.name).filter(Boolean);

  // Layer 1: Color read
  const allNeutral = colors.every(c =>
    ["white","black","gray","navy","beige","cream","ivory","camel","tan","charcoal"].includes(c)
  );
  const hasAccent = colors.some(c =>
    !["white","black","gray","navy","beige","cream","ivory","camel","tan","charcoal"].includes(c)
  );
  const colorRead = allNeutral
    ? "Neutral palette — reads as controlled and intentional before anything else registers."
    : hasAccent
    ? `The ${colors.find(c => !["white","black","gray","navy","beige","cream","ivory","camel"].includes(c))} draws the eye first — it's the entry point into the outfit.`
    : "Tonal palette — reads as sophisticated and considered.";

  // Layer 2: Silhouette read
  const hasLayer  = names.some(n => ["blazer","jacket","coat","cardigan","overcoat","trench coat","hoodie"].includes(n));
  const hasWide   = names.some(n => ["wide leg jeans","maxi skirt","wide leg trousers","cargo pants"].includes(n));
  const hasFitted = names.some(n => ["slim jeans","trousers","chinos","leggings","dress shirt"].includes(n));
  const silhouetteRead = hasLayer
    ? "The outer layer creates a strong silhouette — structured and intentional."
    : hasWide
    ? "Volume below the waist — the eye is drawn down and then back up."
    : hasFitted
    ? "Clean, close silhouette — the shape reads quickly as precise."
    : "Relaxed silhouette — reads as comfortable and approachable.";

  // Layer 3: Detail read
  const detailRead = personality?.youllBeRememberedFor ||
    "The specific combination that makes this uniquely yours.";

  return {
    second1: `Color (0–1s): ${colorRead}`,
    second2: `Silhouette (1–2s): ${silhouetteRead}`,
    second3: `Detail (2–3s): ${detailRead}`,
    summary: personality?.threeSecondRule || "This outfit registers clearly and quickly — each layer communicates.",
  };
}


// ─────────────────────────────────────────────
// SECTION 3: WEAR IT 3 WAYS
// ─────────────────────────────────────────────

/**
 * The same core items styled 3 different ways for 3 contexts.
 * This is one of the highest-value features for users —
 * showing how their wardrobe is more versatile than they think.
 */
const WEAR_3_WAYS_TEMPLATES = {
  "shirt+jeans": {
    item1: "shirt", item2: "jeans",
    ways: [
      { context:"Casual day", instruction:"Untucked, top 2 buttons open, sleeves rolled to elbow. White sneakers. No layer. This is your easy Saturday.", accessory:"Cap or no accessory." },
      { context:"Smart casual evening", instruction:"Fully tucked, top button open only. Chelsea boots or loafers. Sleeves down or rolled once. This is dinner or a work event.", accessory:"Watch — the one upgrade that moves this outfit." },
      { context:"Night out", instruction:"Half-tucked, leather jacket over the top, dark jeans. The jacket changes the entire register from casual to intentional evening.", accessory:"Chain if you have one. Sunglasses until you get inside." },
    ],
  },
  "tshirt+jeans": {
    item1: "t-shirt", item2: "jeans",
    ways: [
      { context:"Effortless everyday", instruction:"Untucked, straight hem. White sneakers. Cap optional. This is the baseline.", accessory:"Nothing. The simplicity is the point." },
      { context:"Elevated casual", instruction:"Half-tuck front into jeans. Same tee, instantly more considered. Add white sneakers or loafers.", accessory:"Watch — elevates without formal shift." },
      { context:"With a layer", instruction:"Same tee and jeans with a denim jacket or bomber. The layer completely transforms the register from basic to put-together.", accessory:"Cap or chain depending on your archetype." },
    ],
  },
  "kurta+jeans": {
    item1: "kurta", item2: "jeans",
    ways: [
      { context:"Casual Indo-Western", instruction:"Kurta untucked over slim or straight jeans. White sneakers or kolhapuri. Simple, comfortable, personality-forward.", accessory:"Minimal. Watch or none." },
      { context:"Smart Indo-Western", instruction:"Kurta tucked partially or belted slightly. Clean chinos instead of jeans. Mojari or loafers.", accessory:"Earthy-toned woven bracelet or simple chain." },
      { context:"Statement Indo-Western", instruction:"Embroidered or printed kurta with well-fitted dark jeans. Dress up the shoes — kolhapuri or jutti. This is your 'I understand both worlds' moment.", accessory:"Gold chain or ethnic woven bracelet." },
    ],
  },
  "blazer+jeans": {
    item1: "blazer", item2: "jeans",
    ways: [
      { context:"Business casual", instruction:"Blazer buttoned, white shirt underneath, jeans dark and clean. Loafers. This is the meeting-from-work look.", accessory:"Watch and belt that matches shoes." },
      { context:"Smart casual evening", instruction:"Blazer open, t-shirt or turtleneck underneath. Same jeans, chelsea boots. This is dinner or an evening event.", accessory:"Watch. Maybe a subtle chain with the turtleneck." },
      { context:"Fashion-forward", instruction:"Oversized blazer, plain tee tucked halfway, wide-leg or straight jeans. Chunky sneakers. Push-up the blazer sleeves. This is the contemporary look.", accessory:"Minimal — the blazer is the statement." },
    ],
  },
  "tshirt+chinos": {
    item1: "t-shirt", item2: "chinos",
    ways: [
      { context:"Clean casual", instruction:"Tee untucked, chinos clean and pressed with a slight ankle break. White sneakers. The go-to.", accessory:"Watch if you have a good one." },
      { context:"Polished casual", instruction:"Tee half-tucked into high-waist chinos. Loafers. Pressed chinos with a crease. This reads as smart without being formal.", accessory:"Belt matching the loafer — elevates immediately." },
      { context:"Layered smart", instruction:"Tee + chinos + cardigan or light blazer. The layer elevates both pieces. Loafers or clean sneakers.", accessory:"Watch. Pocket square if blazer." },
    ],
  },
};

/**
 * Find the best "Wear It 3 Ways" template for an outfit.
 */
function getWearThreeWays(items) {
  const names = items.map(i => i.name).filter(Boolean);

  for (const [key, template] of Object.entries(WEAR_3_WAYS_TEMPLATES)) {
    const hasItem1 = names.some(n => n.includes(template.item1) || template.item1.includes(n));
    const hasItem2 = names.some(n => n.includes(template.item2) || template.item2.includes(n));
    if (hasItem1 && hasItem2) return template;
  }

  // Generic fallback
  return {
    ways: [
      { context:"Current look", instruction:"This combination as styled.", accessory:"As suggested." },
      { context:"Add a layer", instruction:"Add a jacket, blazer, or cardigan — shifts the occasion upward.", accessory:"Watch or belt." },
      { context:"Change the shoes", instruction:"The shoe swap changes the entire register. Sneakers = casual. Loafers = smart. Boots = evening.", accessory:"Match to new shoe tone." },
    ],
  };
}


// ─────────────────────────────────────────────
// SECTION 4: THE ANTI-TIP
// ─────────────────────────────────────────────

/**
 * The single thing that will ruin this specific outfit.
 * Not generic advice — exactly what kills each look.
 * Specific to item combinations and color stories.
 */
const ANTI_TIPS = {
  // By personality
  "quiet authority":     "Adding a statement accessory to prove you have personality. This outfit IS the personality. A loud watch or graphic tee underneath destroys the restraint that makes it work.",
  "clean confidence":    "Mixed whites or blacks. Warm-white shirt with cool-white shoes — the two whites fight each other. Monochromatic only works when all tones match in temperature.",
  "effortless cool":     "Brand new shoes. Box-fresh sneakers against lived-in denim reads as trying. Slightly worn-in is correct. You can't buy effortless — you can only let it develop.",
  "urban edge":          "Too many contrasts at once. One high-low collision is the look. Two or three and it becomes visual noise. Pick the tension and let everything else be neutral.",
  "golden hour":         "Cold metal accessories. Silver watch or silver chain against a warm earth palette is a visual temperature clash. Gold, bronze, or no metal.",
  "dark romanticism":    "Shiny fabric in a dark palette. Satin shirt against a matte blazer makes the dark look cheap rather than rich. Keep textures consistent.",
  "summer protagonist":  "Heavy fabrics. Cotton that clings, denim in summer heat — both fight the lightness the look requires. Linen or light cotton only.",
  "cultural power":      "Dirty or scuffed footwear. Ethnic wear lives or dies on the shoes. A pristine kurta with dusty footwear collapses the entire look.",
  "stealth wealth":      "Synthetic fabrics. A polyester blazer that shines under light, a camel coat that pills — the illusion of quality collapses immediately. Natural fibres only.",
  "festive fire":        "Silver accessories with jewel tones. Silver cools everything down and creates a temperature clash. Gold, copper, or brass only with deep festival colors.",
  "board meeting energy":"Cheap shoes. A well-fitted blazer with low-quality shoes reads as someone who got 80% of the way there. Shoes and belt are the final 20% that determine the verdict.",
  "minimal menace":      "Mixed blacks. Washed-out black jeans with a fresh black jacket — they fight and the whole look reads as faded. All blacks must be the same tone.",

  // By specific item combinations
  "blazer+graphic tee":  "A graphic tee with text or a busy print under a blazer competes. The blazer needs a quiet foundation. Plain tee only.",
  "kurta+sneakers":      "Bright color sneakers with ethnic wear. White sneakers work for indo-western. Neon sneakers or heavily branded ones break the cultural bridge.",
  "linen+heavy shoes":   "Heavy boots or thick-soled sneakers with linen feel like a weight at the bottom of a light look. Keep shoes light and flat.",
  "all-black+logo":      "A visible brand logo in an all-black outfit destroys the intentional silhouette approach. No logos when the silhouette is the statement.",
};

function getAntiTip(items, personality) {
  const names = items.map(i => i.name).filter(Boolean);
  const personalityKey = personality?.vibe?.toLowerCase() || "";
  const personalityHyphenKey = personalityKey.replace(/\s+/g, "-");

  // Try personality-specific first
  if (ANTI_TIPS[personalityKey]) return ANTI_TIPS[personalityKey];
  if (ANTI_TIPS[personalityHyphenKey]) return ANTI_TIPS[personalityHyphenKey];

  // Try item-combination specific
  if (names.includes("blazer") && names.includes("graphic tee"))
    return ANTI_TIPS["blazer+graphic tee"];
  if (names.some(n=>["kurta","kurta"].includes(n)) && names.includes("sneakers"))
    return ANTI_TIPS["kurta+sneakers"];
  if (names.some(n=>["linen shirt","linen trousers"].includes(n)) && names.some(n=>["boots","combat boots"].includes(n)))
    return ANTI_TIPS["linen+heavy shoes"];

  // Universal fallback — specific to the palette
  const colors = items.map(i => i.color).filter(Boolean);
  const allDark = colors.every(c => ["black","charcoal","navy","dark brown","burgundy","wine","plum"].includes(c));
  if (allDark) return "Adding a bright accessory 'for contrast.' If you've committed to a dark palette, the contrast should come from texture and tone, not a bright splash of color. Trust the palette.";

  return "The biggest risk is adding one element too many. This outfit has its story. Every addition after the core look must answer: 'does this add to the story, or does it start a different one?'";
}


// ─────────────────────────────────────────────
// SECTION 5: THE HONEST UPGRADE PATH
// ─────────────────────────────────────────────

/**
 * The specific single addition that takes this outfit
 * from its current level to the next level.
 * Not a shopping list — one precise item.
 */
function getUpgradePath(items, score, occasion) {
  const names  = items.map(i => i.name).filter(Boolean);
  const colors = items.map(i => i.color).filter(Boolean);
  const grade  = score?.grade || "B";

  const hasShoe   = names.some(n => ["sneakers","white sneakers","loafers","chelsea boots","oxford shoes","boots","sandals"].includes(n));
  const hasLayer  = names.some(n => ["blazer","jacket","cardigan","denim jacket","leather jacket","overcoat"].includes(n));
  const hasWatch  = names.some(n => ["watch","silver watch","gold watch"].includes(n));
  const hasKurta  = names.some(n => ["kurta","sherwani","kurta"].includes(n));
  const isFormal  = ["office","business formal","date night","wedding guest"].includes(occasion);
  const isCasual  = ["casual","campus"].includes(occasion);

  if (!hasShoe) return {
    item: "The right shoe",
    why: "Shoes are the single highest-impact addition to any outfit. White sneakers for casual, loafers for smart casual, chelsea boots for evening — the shoe decides the occasion, not the clothes.",
    impact: "Transforms the look from incomplete to intentional.",
  };

  if (!hasLayer && isFormal) return {
    item: "A blazer or structured layer",
    why: `For ${occasion}, a layer elevates every piece underneath it. A navy or charcoal blazer makes a shirt and trousers read as a deliberate formal statement rather than separate pieces.`,
    impact: "Moves the outfit from ${grade} to A territory immediately.",
  };

  if (!hasWatch && isFormal) return {
    item: "A watch",
    why: "For formal occasions, a watch is the one accessory that signals you understand the register. It elevates without competing. Metal strap for formal, leather strap for smart casual.",
    impact: "Adds the one finishing element that formal wear requires.",
  };

  if (hasKurta && !names.some(n => ["mojari","jutti","kolhapuri"].includes(n))) return {
    item: "Ethnic footwear",
    why: "Ethnic wear with western shoes is a missed opportunity. Mojari or jutti with a kurta completes the cultural statement — it's the footwear, not the kurta, that makes it look intentional.",
    impact: "Takes the look from indo-western compromise to ethnic with confidence.",
  };

  // Grade-specific upgrades
  if (grade === "A") return {
    item: "Nothing",
    why: "This outfit is complete. The most common mistake with a great outfit is adding something unnecessary. Subtract rather than add — remove one element and see if it improves.",
    impact: "The removal is the upgrade.",
  };

  if (grade === "B") return {
    item: "Better shoes for this specific occasion",
    why: `The outfit scores well but ${occasion} contexts respond to elevated footwear. Swap to loafers or chelsea boots and the overall formality alignment improves.`,
    impact: "Single highest-impact change available.",
  };

  return {
    item: "A neutral belt",
    why: "A leather belt in brown or black that matches the shoe creates a visual anchor at the waist and ties the top and bottom together. It's invisible when right and obvious when missing.",
    impact: "Creates polish and visual cohesion.",
  };
}


// ─────────────────────────────────────────────
// SECTION 6: PHOTOGRAPHER'S NOTE
// ─────────────────────────────────────────────

/**
 * Every outfit has a setting where it peaks.
 * This tells users where to wear this — or how to photograph it
 * if they want to capture it at its best.
 * Instagram-era users understand this instinctively.
 */
const PHOTOGRAPHERS_NOTES = {
  "quiet authority":     { setting:"Minimalist indoor space — white walls, clean architecture. Morning light.", bestAngle:"Straight on, eye level. The outfit's power comes from the front view.", instagramNote:"Shoot against a concrete wall or a glass office building exterior." },
  "clean confidence":    { setting:"Any clean background — the outfit creates its own context. Urban street or white studio.", bestAngle:"3/4 turn, slightly above eye level.", instagramNote:"Monochromatic outfits photograph best in bright, slightly overcast light. Harsh sun creates shadows." },
  "effortless cool":     { setting:"Street level, candid if possible. Moving through a city.", bestAngle:"Slightly low angle looking up — gives the effortless look an editorial quality.", instagramNote:"The best shot of this look is mid-stride, not posed." },
  "urban edge":          { setting:"Urban landscape — graffiti walls, underpasses, industrial settings.",bestAngle:"Wide shot that shows the full silhouette contrast.", instagramNote:"Shoot at golden hour or blue hour — the dramatic light matches the dramatic palette." },
  "golden hour":         { setting:"Outdoor, natural light — gardens, parks, old city streets.", bestAngle:"Side profile works beautifully — the layered earth tones read as depth.", instagramNote:"This outfit was literally made for golden hour photography. Shoot 45 minutes before sunset." },
  "dark romanticism":    { setting:"Low-key indoor — a good restaurant, candlelit space, evening exterior.", bestAngle:"Three-quarter angle with moody, directional light.", instagramNote:"Don't shoot in bright overhead light — dark palettes go flat. Shoot in warm, directional light." },
  "summer protagonist":  { setting:"Outdoor, natural daylight — beaches, outdoor cafes, gardens.", bestAngle:"Wide shot with environment included — this outfit needs context to glow.", instagramNote:"Bright sun works here. Light colors reflect and glow — this is one of the few outfits that photographs better in harsh sun." },
  "cultural power":      { setting:"Contextually appropriate — a temple, a mandap, a cultural space, or deliberately contrasted with a modern backdrop.", bestAngle:"Slightly low, looking up — gives the ethnic silhouette dignity.", instagramNote:"Warm indoor light makes ethnic colors glow. Avoid cool-tinted fluorescent for photos." },
  "festive fire":        { setting:"Festival venue, wedding hall, diyas and fairy lights.", bestAngle:"Three-quarter, showing the full embroidery or fabric.", instagramNote:"Jewel tones under warm white light are stunning. Avoid blue-toned flash — it washes out the warmth." },
};

function getPhotographersNote(personality) {
  const key = personality?.vibe?.toLowerCase().replace(/ /g, "-");
  return PHOTOGRAPHERS_NOTES[key] || {
    setting: "Any setting with good, warm natural light.",
    bestAngle: "Three-quarter view at eye level.",
    instagramNote: "Good light matters more than the backdrop. Find a clean wall and natural light.",
  };
}


// ─────────────────────────────────────────────
// SECTION 7: MICRO-STYLING (color + item aware)
// ─────────────────────────────────────────────

/**
 * Micro-styling that actually knows the outfit.
 * Not just "roll your sleeves" — but exactly how, where,
 * and crucially WHY this specific detail matters for
 * this specific combination.
 *
 * Each item has detailed instructions.
 * The contextual version is color-aware and occasion-aware.
 */
const MICRO_STYLING_DETAILED = {
  "shirt": {
    default: [
      "The half-tuck: push the front of the shirt into the waistband, back stays out, pull the front out 1–2cm so it blooms slightly. This is not messy — it's the look.",
      "Sleeves: roll exactly twice, each fold 3–4cm wide, to the midpoint between wrist and elbow. Not above, not at the wrist. Mid-forearm. Every time.",
      "Collar: either commit to all buttons open (casual, minimum top 2 undone) or one button undone (smart casual). Halfway-open collar reads as forgot, not styled.",
      "The last button at the hem: always leave it undone when untucked. It allows the shirt to hang rather than ride up.",
    ],
    withBlazers: "Shirt under a blazer: full tuck, top button undone only. 1.5cm of shirt cuff should show below the blazer sleeve — check this before you leave.",
    whenDark: "Dark shirt with dark trousers: the collar detail becomes crucial — keep it clean and deliberate because color won't differentiate the pieces.",
    whenLight: "Light shirt with light trousers: the textural difference between the fabrics carries the look. Make sure both are pressed — shapeless light fabrics lose all their appeal.",
  },

  "t-shirt": {
    default: [
      "Fit test: when you raise your arm, the tee should stay within 5cm of the waistband. If it rides up to your ribcage, it's too short or too fitted.",
      "The half-tuck is your single biggest upgrade. Front hem into the waistband, slightly bloused. Transforms basic into considered in 10 seconds.",
      "Sleeve: roll once if the sleeve is even slightly long — the roll should be tight and sit at mid-bicep. Loose rolls look like an accident.",
      "Replace white tees every 6 months. Yellow undertone on a white tee against your skin is visible and aging. Fresh white reads completely differently.",
    ],
    withChinos: "Tee with chinos: the half-tuck is especially effective here because it creates a waist definition that the chino silhouette demands.",
    withJeans: "Tee with jeans: untucked works if the tee hem hits the hip exactly. Above hip = too short. Below hip = too long. Mid-hip is the only correct length.",
  },

  "blazer": {
    default: [
      "Shoulder check: the seam must sit at the edge of your shoulder — not hanging 1cm off, not pulling up. This is non-negotiable. Adjust or don't wear it.",
      "Single-breasted: button rule is always button when standing, unbutton when sitting. Buttoned while sitting creates a pull across the chest that destroys the silhouette.",
      "Sleeve length: if wearing a shirt underneath, 1.5cm of white cuff should show. If no shirt, 1cm of wrist shows. These are not suggestions.",
      "Unstructured blazers only: push the sleeves up to the forearm. This signals you're relaxed and wearing it, not being worn by it.",
    ],
    withTee: "Blazer over a tee: the tee must be tucked. An untucked tee under a blazer looks like the outfit gave up halfway. Tuck it — the blazer-over-tee look lives in the tuck.",
    withKurta: "If layering a nehru jacket or bandhgala over a plain kurta: all buttons of the jacket closed. An open ethnic jacket looks unfinished.",
  },

  "turtleneck": {
    default: [
      "The turtleneck should sit close to the jaw — not folded down, not bunched at the throat. If it bunches, size up.",
      "Full tuck into high-waist trousers, then pull out 2–3cm of turtleneck over the waistband. That slight blouse over the top is the styling detail.",
      "Keep everything else slim when wearing a turtleneck. The neck detail provides the statement — wide legs or a voluminous bottom compete rather than support.",
      "Under a blazer: turtleneck replaces the shirt entirely. No lapels needed, no collar. The clean neck line against the blazer lapel is the contemporary look.",
    ],
    withJeans: "Turtleneck tucked into slim or straight jeans with a slight blouse: the vertical line from jaw to waist creates an elegant, elongated silhouette.",
  },

  "kurta": {
    default: [
      "Length: knee-length is the standard sweet spot. 5cm above the knee reads casual. 10cm below the knee reads traditional. Know which you're going for.",
      "For indo-western: half-tuck the front into jeans. Pull 2cm back out. This deliberate tuck-and-blouse signals you styled this, not just wore it.",
      "Embroidered kurta: let the embroidery speak. Keep everything else — accessories, shoes — minimal. The kurta is already making a statement.",
      "Collar: mandarin collar must sit flat and high. If it curls or gaps, iron it specifically. The collar is the entire signature of the ethnic silhouette.",
    ],
    withChinos: "Kurta over chinos: go slim or tapered chinos — wide-leg or cargo pants under a kurta reads as confused silhouette.",
    withJeans: "Kurta over jeans: roll the jeans hem once, cleanly. Showing the ankle signals that the indo-western fusion was intentional rather than accidental.",
  },

  "jeans": {
    default: [
      "Break: a slight break (fabric just touching the top of the shoe) is the most versatile length. Zero break (clean ankle) is more contemporary and works with every shoe.",
      "Cuff: one clean cuff, 2–3cm wide, sitting just above the ankle. The cuff should be tight — a loose, floppy cuff reads as forgot to hem rather than styled.",
      "Dark wash jeans: never put in a hot wash. The indigo fades to a grayish-blue that reads as old rather than dark. Cold wash, inside out.",
      "The front crease that develops on slim jeans with wear: this is fine and authentic. A pressed crease on jeans looks like you ironed denim — avoid.",
    ],
    withFormalShoes: "Jeans with formal shoes (loafers, oxfords): a slight ankle break shows the shoe properly. The full shoe silhouette is the point — don't hide it in long denim.",
    withSneakers: "Jeans with sneakers: a clean ankle (no break, no cuff) works best. The full sneaker profile is visible and the ankle gap gives the look lightness.",
  },

  "chinos": {
    default: [
      "The crease: chinos with a front crease pressed in read as smart casual. Without crease: relaxed casual. Know which you want and dress for it.",
      "Fit at the ankle: chinos should taper slightly to the ankle and break just above the shoe. Pooling at the ankle reads as wrong size.",
      "For smart occasions: full tuck always. An untucked shirt or tee with dressed-up chinos reads as the outfit made a decision halfway.",
      "Roll: one cuff, 2cm, for casual contexts. Shows the ankle and elevates the shoe. Don't roll for formal contexts.",
    ],
  },

  "trousers": {
    default: [
      "Break: professional standard is half-break (slight fold where fabric meets shoe). Quarter-break (almost no break) reads as more contemporary.",
      "Waistband: should sit at natural waist, not hip. Trousers worn at the hip lose their entire authority and proportion.",
      "Full tuck. Always. No shirt worn untucked with formal trousers — this combination reads as getting dressed in the dark.",
      "Press before wearing. A crease through the front of the trouser leg is not optional — it's the entire structure of formal bottomwear.",
    ],
  },

  "white sneakers": {
    default: [
      "Clean them before wearing — every single time. Gray-tinted 'white' sneakers against a considered outfit undo every other decision you made.",
      "No-show socks always. Or bare ankle. Visible white socks with white sneakers is not an aesthetic — it's an oversight.",
      "Lacing: flat, even tension, tucked neatly. Loose lacing looks careless. Overly tight looks aggressive. Even and tucked is the standard.",
      "Shoe freshness signals overall outfit care — if your sneakers look tired, the rest of the outfit takes on that tiredness.",
    ],
  },

  "loafers": {
    default: [
      "Bare ankle or no-show socks only. Visible socks with loafers requires intentionality — bright or patterned socks as a deliberate detail, not a practical one.",
      "Heel check: the shoe should not slip when you walk. Slipping loafers look two sizes too big.",
      "With jeans: cuff the jean once to show the full loafer silhouette. The shoe deserves to be seen.",
      "With chinos: clean ankle break, the full loafer visible. This combination is the smart casual gold standard.",
    ],
  },

  "chelsea boots": {
    default: [
      "The elastic panel should sit flush against your ankle without gaping. Gaping elastic reads as worn out or wrong size.",
      "With slim jeans: wear jeans either tucked into the boot or clearly outside. Jeans scrunched around the ankle looks like you can't decide.",
      "Cuff slim jeans once cleanly above the boot — the full boot silhouette is the visual point of wearing chelsea boots.",
      "Keep them polished. Scuffed chelsea boots undermine formal contexts immediately.",
    ],
  },

  "shorts": {
    default: [
      "Length: 2–3cm above the knee is the flattering sweet spot. Mid-thigh is fashion-forward. Below knee reads as dated.",
      "The hem should be clean — not fraying, not rolled unless it's a deliberate style choice.",
      "With a top: fitted top works best. An oversized tee over shorts removes all proportional definition.",
    ],
  },

  "leather jacket": {
    default: [
      "Zip it halfway — never fully closed. The half-zip is the look. Fully closed reads as cold, not styled.",
      "Under the jacket: a fitted tee or thin shirt only. Volume underneath breaks the silhouette. The jacket's architecture depends on a clean foundation.",
      "Collar: up or down, commit. Half-up looks like wind damage, not a choice.",
      "Movement test: you should be able to move naturally without the jacket pulling at the shoulders. If it pulls, it's too small.",
    ],
  },

  "hoodie": {
    default: [
      "Wear hood out, down. Hood up is weather functional, not style.",
      "Sleeve length: should hit the base of the thumb — not the knuckles, not the mid-wrist. This proportion is where it reads right.",
      "Over a shirt: let 1–2cm of shirt collar show above the hoodie neck. That collar stack is the detail.",
      "With trousers: the half-tuck — front hem tucked into trousers, back out. Creates a casual waist that the hoodie normally erases.",
    ],
  },

  "overcoat": {
    default: [
      "Length: knee or just above. Any longer needs height. Any shorter loses the drama.",
      "When standing: leave open. When walking: either button or leave open with belt tied. When sitting: open fully.",
      "The coat does the work — keep everything under it slim and fitted. Structure under structure creates bulk, not intention.",
    ],
  },

  "sandals": {
    default: [
      "Sandals require groomed feet. No exceptions. The sandal draws the eye to the foot — what it finds there matters.",
      "Tan or natural leather sandals age beautifully. Maintain the leather.",
      "With shorts: the proportional exposure of ankle and leg is the aesthetic. Socks with sandals only intentionally as a high-fashion statement.",
    ],
  },
};

function getMicroStyling(items, occasion, weather) {
  const instructions = [];
  const names = items.map(i => i.name).filter(Boolean);

  // Priority order: layer > top > bottom > shoes
  const priorityOrder = ["layer","top","bottom","shoes"];
  const sorted = [...items].sort((a,b) => {
    const roleA = a.role || "";
    const roleB = b.role || "";
    return priorityOrder.indexOf(roleA) - priorityOrder.indexOf(roleB);
  });

  sorted.forEach(item => {
    const styling = MICRO_STYLING_DETAILED[item.name];
    if (!styling) return;

    // Pick the most contextually relevant tip
    let tip = styling.default[0];

    // Context-aware overrides
    if (item.name === "shirt") {
      if (names.includes("blazer") && styling.withBlazers) tip = styling.withBlazers;
      else if (item.color && ["black","charcoal","navy","burgundy"].includes(item.color) && styling.whenDark) tip = styling.whenDark;
      else if (item.color && ["white","cream","ivory","light blue"].includes(item.color) && styling.whenLight) tip = styling.whenLight;
    }
    if (item.name === "t-shirt") {
      if (names.includes("chinos") && styling.withChinos) tip = styling.withChinos;
      else if (names.includes("jeans") && styling.withJeans) tip = styling.withJeans;
    }
    if (item.name === "blazer") {
      if (names.includes("t-shirt") && styling.withTee) tip = styling.withTee;
    }
    if (item.name === "kurta") {
      if (names.includes("chinos") && styling.withChinos) tip = styling.withChinos;
      else if (names.includes("jeans") && styling.withJeans) tip = styling.withJeans;
    }
    if (item.name === "jeans") {
      const hasFormals = names.some(n => ["loafers","oxford shoes","derby shoes"].includes(n));
      const hasSneakers = names.some(n => ["sneakers","white sneakers","chunky sneakers"].includes(n));
      if (hasFormals && styling.withFormalShoes) tip = styling.withFormalShoes;
      else if (hasSneakers && styling.withSneakers) tip = styling.withSneakers;
    }

    instructions.push({ item: item.name, tip });
  });

  // Add one weather-specific tip
  if (weather === "hot") {
    instructions.push({ item:"heat tip", tip:"Check for visible sweat marks — this is the one unavoidable hot-weather risk. Light colors hide sweat better than mid-tones. Darker fabrics worst." });
  }
  if (weather === "cold") {
    instructions.push({ item:"cold tip", tip:"Layer check: your base layer should be fully tucked and hidden. Visible base layer peeking from the bottom reads as underdressed, not layered." });
  }

  return instructions.slice(0, 5);
}


// ─────────────────────────────────────────────
// SECTION 8: OCCASION TRANSITION GUIDE
// ─────────────────────────────────────────────

/**
 * How to take this outfit from current context
 * to the next occasion without going home to change.
 * This is the "smart wardrobe" feature — real-world utility.
 */
const OCCASION_TRANSITIONS = {
  "casual → office":     "Add a blazer (keep in bag). Button the shirt fully. Swap sneakers for loafers if you have them. The upgrade takes 2 minutes.",
  "casual → date night": "Swap the shoes — from sneakers to chelsea boots or loafers. Add a watch if you have one. If the shirt isn't tucked, tuck it. Done.",
  "office → party":      "Unbutton top 2 buttons. Lose the blazer or keep it but push the sleeves up. Swap formal shoes for something less conservative if possible.",
  "casual → ethnic":     "If you have a kurta in your bag, layer it open over a plain tee and jeans — that's a functional indo-western transition.",
  "gym → casual":        "You can't fully transition from gym wear — the fabric is too athletic. If you must: clean hoodie over gym shorts or joggers, clean shoes. It's a functional look, not a styled one.",
  "casual → wedding":    "Add the blazer. Swap to your best shoes. Tuck in fully. If you can — add the watch. Weddings respond to one elevated piece more than a completely different outfit.",
};

function getOccasionTransition(currentOccasion, items) {
  const transitionMap = {
    casual: ["casual → office", "casual → date night"],
    office: ["office → party"],
    gym:    ["gym → casual"],
  };

  const transitions = transitionMap[currentOccasion] || [];
  return transitions.map(key => ({
    transition: key,
    instruction: OCCASION_TRANSITIONS[key],
  }));
}


// ─────────────────────────────────────────────
// SECTION 9: COLOR STORY (enhanced narration)
// ─────────────────────────────────────────────

const COLOR_STORIES = {
  monochromatic:    { story:"One color, every expression. This palette creates elongation, intention, and a visual consistency that registers as sophisticated before anything else.", emotion:"Certain" },
  neutralOnNeutral: { story:"The palette disappears into the silhouette — which means every fold, every hem, every proportion becomes visible. This look has nowhere to hide and doesn't need to.", emotion:"Composed" },
  complementary:    { story:"Opposite ends of the spectrum, held together by choice. The eye keeps moving between the two — that active looking is exactly what creates impact.", emotion:"Dynamic" },
  analogous:        { story:"Colors that exist in the same neighborhood of the spectrum. Harmonious without being boring — nature's own palette, borrowed intelligently.", emotion:"Cohesive" },
  neutralPlusAccent:{ story:"The neutral creates silence. The accent speaks into that silence. Without the neutral, the accent is noise. With it, the accent is a sentence.", emotion:"Intentional" },
  warmEarth:        { story:"An autumn palette — the warmest, most inviting colors that exist. Earth tones trigger comfort before the eye has finished looking. You feel the warmth.", emotion:"Approachable" },
  darkAndRich:      { story:"Deep tones that absorb rather than reflect. This palette doesn't shout — it gravitates. Things come toward it rather than away from it.", emotion:"Magnetic" },
  lightAndAiry:     { story:"A palette that reflects light back into the room. Everything feels open, clean, unencumbered. The visual weight is low; the impression is spacious.", emotion:"Free" },
  jewelTone:        { story:"Saturated, rich, dimensional color. Under warm light, jewel tones glow from within rather than just off the surface. This is color at its most alive.", emotion:"Luminous" },
  pastel:           { story:"Desaturated color — the light version of bold. Pastels are harder to wear than bold because they have no color to hide behind, only their gentleness.", emotion:"Delicate" },
};

function getColorStory(items) {
  const colors = items.map(i => i.color).filter(Boolean);
  if (colors.length === 0) return null;

  const neutrals = ["white","black","gray","navy","beige","cream","ivory","camel","tan","charcoal","off-white"];
  const jewel    = ["emerald","royal blue","burgundy","plum","sapphire","ruby","deep purple"];
  const pastels  = ["lavender","blush","mint","peach","lilac","powder blue","baby pink","sage"];
  const earth    = ["camel","rust","terracotta","mustard","olive","brown","beige","cream","tan"];
  const dark     = ["black","navy","charcoal","burgundy","wine","plum","dark brown","forest green"];

  const uniqueColors = [...new Set(colors)];
  if (uniqueColors.length === 1) return COLOR_STORIES.monochromatic;
  if (colors.every(c => neutrals.includes(c))) return COLOR_STORIES.neutralOnNeutral;
  if (colors.every(c => earth.includes(c))) return COLOR_STORIES.warmEarth;
  if (colors.every(c => dark.includes(c))) return COLOR_STORIES.darkAndRich;
  if (colors.every(c => pastels.includes(c))) return COLOR_STORIES.pastel;
  if (colors.some(c => jewel.includes(c))) return COLOR_STORIES.jewelTone;
  if (colors.every(c => [...neutrals,...pastels].includes(c))) return COLOR_STORIES.lightAndAiry;

  const nonNeutral = colors.filter(c => !neutrals.includes(c));
  if (nonNeutral.length === 1) return COLOR_STORIES.neutralPlusAccent;

  return COLOR_STORIES.analogous;
}


// ─────────────────────────────────────────────
// SECTION 10: SIGNATURE MOVES (specific)
// ─────────────────────────────────────────────

/**
 * The one unexpected, intentional detail per outfit.
 * Highly specific — calculated from the actual combination.
 * Not random tips. Architectural decisions.
 */
function getSignatureMove(items, occasion, weather) {
  const colors = items.map(i => i.color).filter(Boolean);
  const names  = items.map(i => i.name).filter(Boolean);

  // Item-specific signature moves (checked first — most specific)
  if (
    occasion === "office" &&
    names.some(n => ["shirt", "dress shirt"].includes(n)) &&
    names.includes("chinos") &&
    names.includes("loafers")
  ) {
    return "Roll the shirt sleeves exactly twice to mid-forearm, then lock a clean front crease down each chino leg. That sleeve-to-crease contrast is what makes this look read as Quiet Authority rather than generic office casual.";
  }
  if (names.includes("blazer") && names.some(n => ["t-shirt","graphic tee"].includes(n))) {
    return "The blazer-and-tee works on one condition: tuck the tee. Untucked tee under a blazer is fashion's most common mistake. Tucked, the blazer has a foundation. Untucked, it has confusion.";
  }
  if (names.includes("turtleneck") && names.some(n => ["jeans","slim jeans","straight jeans"].includes(n))) {
    return "Tuck the turtleneck fully into the jeans, then pull it back out 2cm over the waistband. That controlled blouse over the waistband is what separates 'tucked in a turtleneck' from 'wearing a turtleneck well.'";
  }
  if (names.some(n => ["shirt","linen shirt"].includes(n)) && names.some(n => ["jeans","straight jeans"].includes(n))) {
    return "The knot: pull the front two sides of the untucked shirt together and tie a small knot at the front hem — just 2cm of knot. It creates a waist where there wasn't one and changes the entire silhouette geometry.";
  }
  if (names.includes("overcoat") || names.includes("trench coat")) {
    return "Leave the coat entirely open when you're stationary — close it only when walking. Static, the open coat frames the outfit underneath. In motion, the closed coat creates drama. Both positions work for different reasons.";
  }
  if (names.some(n => ["hoodie","sweatshirt"].includes(n)) && names.some(n => ["trousers","chinos"].includes(n))) {
    return "The hoodie half-tuck into the trousers: front hem inside the waistband, back hanging free, front pulled 2cm back out over the band. This creates a casual waist definition that hoodies normally erase.";
  }
  if (names.some(n => ["kurta","kurti"].includes(n)) && names.some(n => ["jeans","straight jeans","slim jeans"].includes(n))) {
    return "Roll the jeans exactly once — a clean, 3cm fold — and let it sit just above the ankle. That single cuff signals the indo-western was a choice, not a default. The ankle is the reveal.";
  }
  if (names.includes("leather jacket")) {
    return "Half-zip the leather jacket. Not fully open, not fully closed — the zip should sit at the sternum. The opening creates a V-shape that frames whatever is underneath, adding dimension without removing structure.";
  }

  // Color-based signature moves (second priority)
  const hasWarmEarth = colors.filter(c => ["camel","rust","mustard","terracotta","olive","brown"].includes(c)).length >= 2;
  if (hasWarmEarth) {
    return "Introduce a single silver accessory — a thin chain or a silver-toned watch. The cool metal against the warm earth palette creates a tension that reads as editorial rather than obvious.";
  }
  const hasNavyAndWhite = colors.includes("navy") && colors.includes("white");
  if (hasNavyAndWhite) {
    return "Add one terracotta or rust element — a belt, a watch strap, or even a bag. Navy and white is the canvas. The unexpected warm accent is the brushstroke that makes the painting specific.";
  }
  const hasAllDark = colors.every(c => ["black","charcoal","navy","burgundy","wine","plum"].includes(c));
  if (hasAllDark) {
    return "The finishing detail for an all-dark look is texture contrast, not color: a matte blazer over a slightly textured turtleneck, or leather against wool. The eye needs something to find in the darkness.";
  }

  // Occasion-specific fallbacks
  const occasionMoves = {
    "office":      "Check the mirror from the side as well as the front. Most people only check front-on. The side silhouette of formal wear is what colleagues see as you walk past — make sure the back tuck is clean and the coat falls correctly.",
    "date night":  "The last thing on should be the most considered. The watch, the shoes, the jacket — whatever you put on last is what your date sees first. Make that last element count.",
    "party":       "Test the outfit in the kind of light you'll be in. A bright outfit looks different in dim club lighting. A dark outfit can disappear. Check in warm, dim light before you go.",
    "ethnic":      "Press the kurta specifically at the collar and the shoulder seams. These two areas define the shape of ethnic wear — a pressed collar reads as intentional; an unpressed one reads as last minute.",
    "gym":         "Buy the gym look as a set. Top and bottom from the same brand, same color family. The matching athletic set is the gym aesthetic — mixing random pieces creates the look of someone who doesn't own gym clothes.",
    "casual":      "Remove one thing you were going to wear. Test the outfit. If it improved — that was the signature move. Subtraction is often the most powerful styling decision.",
  };

  return occasionMoves[occasion] || "The final layer check: stand back from the mirror, 2 metres away. At that distance, you see what others see. Not the details — the whole. Ask: is the silhouette clear? Is the palette readable? If yes — you're done.";
}


// ─────────────────────────────────────────────
// SECTION 11: FINISHING MOVES
// ─────────────────────────────────────────────

const FINISHING_MOVES = {
  byOccasion: {
    "casual": [
      "The subtraction test: remove one accessory or layer. If the outfit looks better — that was your answer. Restraint is usually the last styling move.",
      "Bare ankles in casual contexts, even in mild weather. The exposed ankle between trouser and shoe gives the look lightness that covered ankles don't.",
      "One adjustment that casual dressing hides: posture. Casual clothes read well with good posture and sloppy with bad. This is the invisible styling move.",
    ],
    "office": [
      "The 5-point check before leaving: collar flat, shirt tucked, shoes clean, jacket sitting correctly at shoulders, no lint. Each takes 5 seconds. Combined they mean the difference between groomed and not.",
      "A pocket square in a blazer doesn't need a complicated fold. A TV fold — straight, flat, showing 1cm — is cleaner and more professional than any puff fold.",
      "The movement test: button the jacket. Now sit down. Stand up. Walk. If the jacket pulls anywhere in this sequence, it doesn't fit correctly for this context.",
    ],
    "date night": [
      "Fragrance: apply to the inner wrist and the base of the throat. Not the chest. The throat is where close conversation reveals it — naturally, not aggressively.",
      "Wear clothes you've worn before. New outfit anxiety shows physically — you fidget, adjust, don't move naturally. Wear something you know works.",
      "Check one last time that the shoes are clean. Not the rest of the outfit — the shoes. It's always the shoes.",
    ],
    "party": [
      "The single-statement rule: one bold element. Bold color, OR bold texture, OR bold accessory — never all three simultaneously. The statement needs silence around it to work.",
      "Movement test: dance once in front of the mirror before you leave. If anything shifts, bunches, restricts, or requires holding — fix it or change it.",
      "Venue lighting check: dim venues need lighter colors or metallics to register. You'll photograph as a dark shape against a dark background otherwise.",
    ],
    "ethnic": [
      "Press the kurta or ethnic piece at the collar and shoulder seams specifically. These define the silhouette — an unpressed collar reads as rushed.",
      "Footwear is the final check. The most beautifully styled ethnic look fails if the shoes are wrong. Check the mojari/jutti/kolhapuri last, as a deliberate decision.",
      "Dupatta or stole: don't let it just hang. Drape it with a choice — over one shoulder, over both, pinned. A chosen drape reads as styled. A hanging drape reads as afterthought.",
    ],
    "gym": [
      "Gym aesthetics are about cleanliness. Old, pilling athletic wear signals you don't respect the training. Clean, fresh gear signals the opposite.",
      "Shoes: running shoes for treadmill and general training. Sport-specific shoes for courts. The right shoe for the activity is part of the gym look.",
    ],
    "festival": [
      "Check for jewellery that creates sound — pieces that jingle together create noise that can read as excessive in certain contexts. Separate them or choose one.",
      "Kajal or kohl in ethnic contexts is not just cosmetic — it's part of the cultural language of the look. Its presence reads as intentional festive styling.",
    ],
  },
  universal: [
    "The lint roller test: run it once over the entire outfit before leaving. Lint, hair, and pet hair are invisible to you after 20 minutes with your clothes. They're visible to everyone else.",
    "The sitting test: sit down in the full outfit. Do the jeans or trousers ride down and expose the lower back? Does the jacket create a weird pull? Does the shirt untuck? Fix these before the event.",
    "The smell test: open a wardrobe, take out a piece, and wear it straight — the enclosed wardrobe smell is on it. Air pieces for 15 minutes before wearing. This is the forgotten hygiene of dressing.",
    "The side mirror check: most styling is done facing front. Walk past a side mirror — the side silhouette is what everyone else sees when you move through a room. Make sure it's right.",
  ],
};

function getFinishingMove(items, occasion) {
  const occasionMoves = FINISHING_MOVES.byOccasion[occasion] || FINISHING_MOVES.byOccasion["casual"];
  const primary   = occasionMoves[Math.floor(Math.random() * occasionMoves.length)];
  const secondary = FINISHING_MOVES.universal[Math.floor(Math.random() * FINISHING_MOVES.universal.length)];
  return { primary, secondary };
}


// ─────────────────────────────────────────────
// SECTION 12: DETECT PERSONALITY
// ─────────────────────────────────────────────

function detectOutfitPersonality(items, occasion, weather) {
  const colors = items.map(i => i.color).filter(Boolean);
  const names  = items.map(i => i.name).filter(Boolean);

  // Deterministic office archetype: navy shirt + beige chinos + brown loafers
  if (
    occasion === "office" &&
    names.some(n => ["shirt", "dress shirt"].includes(n)) &&
    names.includes("chinos") &&
    names.includes("loafers") &&
    colors.includes("navy") &&
    colors.includes("beige") &&
    colors.includes("brown")
  ) {
    return OUTFIT_PERSONALITIES["quiet authority"];
  }

  let bestMatch = null, bestScore = -1;

  for (const [key, personality] of Object.entries(OUTFIT_PERSONALITIES)) {
    let score = 0;

    // Color triggers
    personality.triggeredBy?.colors?.forEach(combo => {
      if (combo.includes("all-white") && colors.every(c => ["white","cream","ivory"].includes(c))) { score += 4; return; }
      if (combo.includes("all-black") && colors.every(c => ["black","charcoal","off-black"].includes(c))) { score += 4; return; }
      const matched = combo.every(c => colors.includes(c));
      if (matched) score += 3;
      const partial = combo.filter(c => colors.includes(c)).length;
      if (partial >= 1) score += partial;
    });

    // Item triggers
    personality.triggeredBy?.items?.forEach(combo => {
      const matched = combo.every(item => names.some(n => n.includes(item) || item.includes(n)));
      if (matched) score += 2;
      const partial = combo.filter(item => names.some(n => n.includes(item) || item.includes(n))).length;
      if (partial >= 1) score += partial * 0.5;
    });

    // Occasion boost
    const occasionBoosts = {
      "office": ["quiet authority","board meeting energy","stealth wealth","power casual"],
      "gym":    ["gym main character"],
      "ethnic": ["cultural power","festive fire","cultural power","quiet luxury india","indo western architect"],
      "festival":["festive fire","cultural power"],
      "date night":["date night precision","dark romanticism","clean confidence"],
      "party":  ["urban edge","dark romanticism","festive fire"],
      "casual": ["effortless cool","campus legend","off-duty creative","summer protagonist"],
    };
    if (occasionBoosts[occasion]?.includes(key)) score += 3;

    // Weather boost
    if (weather === "hot" && ["summer protagonist","south asian heat","golden hour"].includes(key)) score += 2;
    if (weather === "cold" && ["dark romanticism","monsoon mood","stealth wealth"].includes(key)) score += 2;

    if (score > bestScore) { bestScore = score; bestMatch = { key, personality }; }
  }

  return bestMatch?.personality || {
    vibe: "Your Own Signature",
    description: "A combination that defines a style rather than follows one. The most memorable outfits are the ones that feel like nobody else would have assembled them.",
    moodBoard: ["individual", "personal", "signature"],
    threeSecondRule: "Your specific combination registers as unique. That uniqueness is the impression.",
    wowReason: "Outfits that don't fit a named category are often the most memorable. They make people think 'I can't place that, but it looked great.'",
    culturalRef: "Every iconic style icon started by ignoring the categories.",
    youllBeRememberedFor: "The specific combination that was yours.",
    antiTip: "Don't try to make it fit a category. It doesn't — and that's its strength.",
  };
}


// ─────────────────────────────────────────────
// SECTION 13: THE WOW ASSEMBLER
// ─────────────────────────────────────────────

/**
 * Takes a raw outfit from fashionEngine and wraps it in
 * the complete styling intelligence layer.
 *
 * This is the function that transforms data into a product.
 */
function styleOutfit(rawOutfit, occasion = "casual", weather = "mid", userProfile = {}) {
  const { items, score, accessories } = rawOutfit;
  const stylistRoadmapNote = rawOutfit.fallbackVibeNote || rawOutfit.stylistRoadmapNote || null;

  const personality      = detectOutfitPersonality(items, occasion, weather);
  const threeSecond      = getThreeSecondBreakdown(items, personality);
  const colorStory       = getColorStory(items);
  const microStyling     = getMicroStyling(items, occasion, weather);
  const signatureMove    = getSignatureMove(items, occasion, weather);
  const antiTip          = getAntiTip(items, personality);
  const upgradePath      = getUpgradePath(items, score, occasion);
  const wearThreeWays    = getWearThreeWays(items);
  const finishingMove    = getFinishingMove(items, occasion);
  const photographersNote= getPhotographersNote(personality);
  const occasionTransition = getOccasionTransition(occasion, items);

  // The "You'll Feel" line
  const feelLines = {
    "Quiet Authority":         "Like the most prepared person in the room — which you probably are.",
    "Clean Confidence":        "Like yourself, dialled up exactly one notch. Not more.",
    "Effortless Cool":         "Like you weren't trying. Which is exactly the look.",
    "Urban Edge":              "Like the person others quietly clock when you walk in.",
    "Golden Hour":             "Warm, grounded, and like you belong somewhere beautiful.",
    "Dark Romanticism":        "Like you command space without asking for it.",
    "Summer Protagonist":      "Light, alive, and like this city was made for this outfit.",
    "Cultural Power":          "Rooted. Confident in where you come from and where you're going.",
    "Stealth Wealth":          "Expensive. Not flashy — expensive. The best version.",
    "Off-Duty Creative":       "Like an interesting person — which is better than looking like one.",
    "Date Night Precision":    "Present. The outfit is handled — you can focus on everything else.",
    "Festive Fire":            "Like a celebration. Because you are one.",
    "Campus Legend":           "Like yourself, specifically — not like you're trying to look like anyone else.",
    "Monsoon Mood":            "Warm, textured, and weather-smart — comfortable AND considered.",
    "Board Meeting Energy":    "Like the room is yours before you've opened your mouth.",
    "South Asian Heat":        "Intelligent about the climate — cool when everyone else is managing.",
    "Indo Western Architect":  "Like someone who understands two worlds and owns both.",
    "Gym Main Character":      "Disciplined. Like training is something you respect, not something you survive.",
    "Wedding House Energy":    "Appropriate in all the right ways, celebrated in all the right places.",
    "Quiet Luxury India":      "Like quality without announcement — the best kind.",
    "Athleisure Architect":    "Ready to move through any context — from active to casual without missing a step.",
    "Minimal Menace":          "Sharp. Intentionally, specifically sharp.",
    "The Returnee":            "Like you've been somewhere beautiful and brought good taste back.",
    "Power Casual":            "Capable. Relaxed but capable — which is rarer and more impressive than formal.",
  };

  const feelLine = feelLines[personality.vibe] ||
    "Like you made a deliberate choice — and that confidence carries.";

  // Build the 'why it works' narrative
  const goodChecks = score?.breakdown?.filter(b => b.score >= 8) || [];
  const primaryReason = goodChecks[0]?.reason || "";
  const whyItWorks = [
    colorStory?.story,
    primaryReason,
    personality.wowReason,
  ].filter(Boolean).join(" ");

  const normalizedHowToWear = (Array.isArray(microStyling) ? microStyling : [])
    .map((row) => ({
      item: row?.item || "item",
      tip: row?.tip || "",
    }))
    .filter((row) => row.tip)
    .slice(0, 3);

  const card = {
    vibe: personality.vibe,
    oneLine: personality.description,
    feelLine,
    theMove: signatureMove,
    howToWear: normalizedHowToWear,
    dont: antiTip,
    stylistRoadmapNote,
  };

  return {
    // Core
    items,
    score,
    accessories,

    // Identity
    outfitName: personality.vibe,
    description: personality.description,
    feelLine,
    moodBoard: personality.moodBoard,
    culturalRef: personality.culturalRef,
    youllBeRememberedFor: personality.youllBeRememberedFor,

    // Intelligence layers
    threeSecond,
    colorStory,
    whyItWorks,
    signatureMove,
    antiTip,
    microStyling,
    finishingMove,
    photographersNote,
    occasionTransition,
    upgradePath,
    wearThreeWays,
    card,
    visualRating: rawOutfit.visualRating || null,
    stylistRoadmapNote,

    // Validation
    wowReason: personality.wowReason,
  };
}

/**
 * Apply to all outfits from fashionEngine.
 */
function applyStyleIntelligence(rawOutfits, occasion, weather, userProfile = {}) {
  if (!Array.isArray(rawOutfits)) return [];
  return rawOutfits.map(outfit =>
    styleOutfit(outfit, occasion, weather, userProfile)
  );
}

// Shared occasion-to-vibe anchors used by generation and styling.
const OCCASION_VIBES = {
  casual: ["Effortless Cool", "Off-Duty Creative", "Clean Confidence"],
  office: ["Quiet Authority", "Clean Confidence", "Board Meeting Energy"],
  "business formal": ["Board Meeting Energy", "Quiet Authority", "Stealth Wealth"],
  party: ["Urban Edge", "Dark Romanticism", "Effortless Cool"],
  "date night": ["Date Night Precision", "Dark Romanticism", "Clean Confidence"],
  gym: ["Gym Main Character", "Athleisure Architect"],
  "wedding guest": ["Wedding House Energy", "Quiet Luxury India", "Cultural Power"],
  ethnic: ["Cultural Power", "Indo Western Architect", "Quiet Luxury India"],
  "pooja / puja": ["Cultural Power", "Quiet Luxury India"],
  festival: ["Festive Fire", "Cultural Power", "Wedding House Energy"],
};

// Canonical taxonomy bridge for ingestion and scraper alignment.
// Values are canonical keys, not display names.
const ITEM_FUZZY_MAP = {
  // TOPS
  "compression": "tshirt",
  "body fit": "tshirt",
  "polo shirt": "polo",
  "button down": "shirt",
  "button-down": "shirt",
  "button up": "shirt",
  "button-up": "shirt",
  "formal shirt": "shirt",
  "casual shirt": "shirt",
  "crewneck": "tshirt",
  "tee": "tshirt",
  "t shirt": "tshirt",
  "hooded": "hoodie",

  // BOTTOMS
  "sweatpants": "joggers",
  "slacks": "trousers",
  "denim": "jeans",
  "denim pants": "jeans",
  "dress pants": "trousers",
  "formal pants": "trousers",
  "chino pants": "chinos",
  "cords": "chinos",

  // OUTERWEAR
  "camel coat": "overcoat",
  "coat": "overcoat",
  "long coat": "overcoat",
  "puffer": "puffer_jacket",
  "down jacket": "puffer_jacket",
  "windcheater": "windbreaker",

  // FOOTWEAR
  "dress shoes": "oxford_shoes",
  "trainers": "sneakers",
  "tennis shoes": "sneakers",
  "athletic shoes": "sneakers",
  "sport shoes": "sneakers",
  "formal shoes": "derby_shoes",
  "flip-flops": "slides",
  "slippers": "slides",
};

// Converts canonical scraper tokens to fashionEngineV3 CLOTHING_ITEMS keys.
const CANONICAL_TO_ENGINE_ITEM = {
  tshirt: "t-shirt",
  polo: "polo shirt",
  shirt: "shirt",
  hoodie: "hoodie",
  joggers: "joggers",
  trousers: "trousers",
  jeans: "jeans",
  chinos: "chinos",
  slides: "slides",
  overcoat: "overcoat",
  puffer_jacket: "puffer jacket",
  windbreaker: "windbreaker",
  oxford_shoes: "oxford shoes",
  sneakers: "sneakers",
  derby_shoes: "derby shoes",
};


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  applyStyleIntelligence,
  styleOutfit,
  OCCASION_VIBES,
  ITEM_FUZZY_MAP,
  CANONICAL_TO_ENGINE_ITEM,
  detectOutfitPersonality,
  getThreeSecondBreakdown,
  getMicroStyling,
  getSignatureMove,
  getAntiTip,
  getUpgradePath,
  getWearThreeWays,
  getFinishingMove,
  getPhotographersNote,
  getColorStory,
  getOccasionTransition,
  OUTFIT_PERSONALITIES,
  MICRO_STYLING_DETAILED,
  SIGNATURE_MOVES: {},
  COLOR_STORIES,
  FINISHING_MOVES,
  WEAR_3_WAYS_TEMPLATES,
  ANTI_TIPS,
  PHOTOGRAPHERS_NOTES,
};


/*
// ── WHAT THE CARD NOW OUTPUTS ─────────────────────────────────

// Input: ["white shirt", "navy chinos", "brown loafers"], occasion: "office", weather: "mid"

// Output:
{
  outfitName: "Quiet Authority",
  description: "You don't announce yourself. You don't need to. This outfit reads as someone who has already arrived.",
  feelLine: "Like the most prepared person in the room — which you probably are.",
  moodBoard: ["boardroom confidence", "old money", "effortless polish"],
  culturalRef: "Mahendra Singh Dhoni in a navy suit at a press conference...",
  youllBeRememberedFor: "The fact that everything fit. The precision is what people notice.",

  threeSecond: {
    second1: "Color (0–1s): Neutral palette — reads as controlled and intentional.",
    second2: "Silhouette (1–2s): Clean, close silhouette — reads as precise.",
    second3: "Detail (2–3s): The precision of fit across every piece.",
    summary: "Authority registers before you open your mouth."
  },

  colorStory: {
    story: "The palette disappears into the silhouette — which means every proportion becomes visible.",
    emotion: "Composed"
  },

  signatureMove: "Add one terracotta or rust element — a belt, a watch strap. Navy and white is the canvas. The warm accent is the brushstroke.",

  antiTip: "Don't add a statement accessory to prove personality. The restraint IS the personality. A loud watch destroys it.",

  microStyling: [
    { item: "shirt", tip: "Top button undone only, sleeves rolled exactly twice to mid-forearm." },
    { item: "chinos", tip: "Front crease pressed in, clean ankle break, full tuck." },
    { item: "loafers", tip: "Bare ankle or no-show socks. Cuff chinos once to show full loafer." }
  ],

  upgradePath: {
    item: "A watch",
    why: "For office, a watch is the one accessory that signals you understand the register.",
    impact: "Adds the finishing element that formal wear requires."
  },

  wearThreeWays: {
    ways: [
      { context: "Business casual", instruction: "Blazer buttoned, white shirt underneath..." },
      { context: "Smart casual evening", instruction: "Blazer open, turtleneck underneath..." },
      { context: "Fashion-forward", instruction: "Oversized blazer, plain tee..." }
    ]
  },

  photographersNote: {
    setting: "Minimalist indoor space — white walls, clean architecture. Morning light.",
    bestAngle: "Straight on, eye level.",
    instagramNote: "Shoot against a concrete wall or glass office building exterior."
  },

  finishingMove: {
    primary: "5-point check: collar flat, shirt tucked, shoes clean, jacket at shoulders, no lint.",
    secondary: "The lint roller test: run it once over the entire outfit before leaving."
  }
}
*/
