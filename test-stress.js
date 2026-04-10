/**
 * Stress Test for Fashion AI Engine V3
 * Tests edge-case wardrobes and advisor/relaxed-match behavior.
 */
const { suggestOutfits } = require('./fashionEngineV3');

const SCENARIOS = [
  {
    name: "Scenario 1: Minimal Wardrobe (1 top, 1 bottom, 1 shoe)",
    wardrobe: [
      { name: "t-shirt", color: "white" },
      { name: "jeans", color: "blue" },
      { name: "sneakers", color: "white" }
    ],
    occasion: "casual",
    weather: "mid",
    expected: "success"
  },
  {
    name: "Scenario 2: Goth Style (Only Dark Colors)",
    wardrobe: [
      { name: "kurta", color: "black" },
      { name: "churidar", color: "black" },
      { name: "mojari", color: "black" }
    ],
    occasion: "pooja / puja",
    weather: "mid",
    expected: "advisor" // Should reject black for Puja
  },
  {
    name: "Scenario 3: Vacation Mode (No Formal Items)",
    wardrobe: [
      { name: "t-shirt", color: "white" },
      { name: "shorts", color: "khaki" },
      { name: "flip flops", color: "black" }
    ],
    occasion: "office",
    weather: "hot",
    expected: "advisor" // Should reject for office formality
  },
  {
    name: "Scenario 4: Bare Feet (No Shoes)",
    wardrobe: [
      { name: "shirt", color: "white" },
      { name: "chinos", color: "beige" }
    ],
    occasion: "casual",
    weather: "mid",
    expected: "advisor"
  }
];

console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║               FASHION ENGINE V3 — STRESS TESTS                 ║");
console.log("╚══════════════════════════════════════════════════════════════════╝\n");

SCENARIOS.forEach(sc => {
  console.log(`Running: ${sc.name}`);
  const result = suggestOutfits(sc.wardrobe, sc.occasion, sc.weather);
  
  if (sc.expected === "success") {
    if (result.success) {
      console.log(`✅ Success: Generated ${result.data.length} outfits.`);
      if (result.data[0].relaxedMatch) {
        console.log(`   (Relaxed Match Triggered: ${result.data[0].relaxationReasons.join(", ")})`);
      }
    } else {
      console.log(`❌ Failed: Expected success but got Advisor Mode.`);
      console.log(`   Message: ${result.advisorFeedback?.message}`);
    }
  } else if (sc.expected === "advisor") {
    if (!result.success && result.advisorFeedback) {
      console.log(`✅ Success: Correctly triggered Advisor Mode.`);
      console.log(`   Message: ${result.advisorFeedback.message}`);
      // Safely access gaps/missingCategories - check names against implementation
      const gaps = result.advisorFeedback.missingCategories || [];
      console.log(`   Gaps: ${gaps.join(", ")}`);
    } else {
      console.log(`❌ Failed: Expected Advisor Mode but got success.`);
      if (result.success) {
         console.log(`   Generated: ${result.data.map(o => o.items.map(i => i.name).join("+")).join(" | ")}`);
      }
    }
  }
  console.log("-".repeat(70));
});
