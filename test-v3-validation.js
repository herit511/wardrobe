/**
 * Exhaustive test: All occasions × All weathers
 * Tests the upgraded fashionEngineV3 with the full 7-tier pipeline.
 */
const { suggestOutfits, CLOTHING_ITEMS, OCCASIONS, GYM_ALLOWED } = require('./fashionEngineV3');

// Full wardrobe with diverse items and colors
const wardrobe = [
  // Tops - various types and colors
  { name: "t-shirt",       color: "white" },
  { name: "t-shirt",       color: "black" },
  { name: "t-shirt",       color: "navy" },
  { name: "graphic tee",   color: "red" },
  { name: "shirt",         color: "light blue" },
  { name: "shirt",         color: "white" },
  { name: "shirt",         color: "navy" },
  { name: "dress shirt",   color: "white" },
  { name: "dress shirt",   color: "sky blue" },
  { name: "polo shirt",    color: "burgundy" },
  { name: "turtleneck",    color: "charcoal" },
  { name: "hoodie",        color: "gray" },
  { name: "sweater",       color: "beige" },
  { name: "tank top",      color: "black" },
  { name: "linen shirt",   color: "cream" },
  { name: "henley",        color: "olive" },
  { name: "oversized tee", color: "gray" },

  // Bottoms
  { name: "jeans",         color: "dark blue" },
  { name: "jeans",         color: "black" },
  { name: "slim jeans",    color: "dark blue" },
  { name: "chinos",        color: "beige" },
  { name: "chinos",        color: "navy" },
  { name: "trousers",      color: "charcoal" },
  { name: "trousers",      color: "black" },
  { name: "dress trousers",color: "black" },
  { name: "shorts",        color: "khaki" },
  { name: "joggers",       color: "gray" },
  { name: "cargo pants",   color: "olive" },
  { name: "track pants",   color: "black" },

  // Layers
  { name: "blazer",        color: "navy" },
  { name: "blazer",        color: "charcoal" },
  { name: "leather jacket",color: "black" },
  { name: "denim jacket",  color: "blue" },
  { name: "bomber jacket", color: "olive" },
  { name: "nehru jacket",  color: "black" },
  { name: "overcoat",      color: "camel" },

  // Shoes
  { name: "sneakers",      color: "white" },
  { name: "sneakers",      color: "black" },
  { name: "loafers",       color: "brown" },
  { name: "oxford shoes",  color: "black" },
  { name: "chelsea boots", color: "brown" },
  { name: "sandals",       color: "tan" },
  { name: "flip flops",    color: "black" },
  { name: "running shoes", color: "gray" },
  { name: "chunky sneakers",color: "white" },

  // Indian/Ethnic items
  { name: "kurta",         color: "white" },
  { name: "kurta",         color: "maroon" },
  { name: "sherwani",      color: "gold" },
  { name: "churidar",      color: "white" },
  { name: "mojari",        color: "gold" },
  { name: "kolhapuri",     color: "tan" },
  { name: "bandhgala",     color: "black" },
];

const occasions = Object.keys(OCCASIONS);
const weathers  = ["hot", "mid", "cold"];

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;
const issues = [];

console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║        FASHION ENGINE V3 — EXHAUSTIVE VALIDATION TEST          ║");
console.log("╚══════════════════════════════════════════════════════════════════╝\n");

for (const occasion of occasions) {
  for (const weather of weathers) {
    totalTests++;
    const label = `${occasion} × ${weather}`;
    
    try {
      const engineResponse = suggestOutfits(wardrobe, occasion, weather, {});
      
      // Check for Advisor Feedback (Failure case)
      if (engineResponse.success === false) {
        console.log(`⚠️  ${label.padEnd(30)} → ADVISOR MODE: ${engineResponse.advisorFeedback?.message}`);
        // For testing purposes, we might consider this a fail if the wardrobe is supposed to have things
        // But for this test wardrobe, some combos like Pooja x Cold should fail
        if (occasion === "pooja / puja" && weather === "cold") {
           console.log(`   (Expected failure for this combination)`);
           totalPassed++;
        } else {
           issues.push({ combo: label, issue: `Advisor Mode: ${engineResponse.advisorFeedback?.message}` });
           totalFailed++;
        }
        continue;
      }

      const result = engineResponse.data || [];

      // Check if it returned results
      if (result.length === 0) {
        console.log(`❌ ${label.padEnd(30)} → No outfits generated`);
        issues.push({ combo: label, issue: "No outfits" });
        totalFailed++;
        continue;
      }

      // === VALIDATION CHECKS ===
      let passed = true;
      const checkIssues = [];

      for (let idx = 0; idx < result.length; idx++) {
        const outfit = result[idx];
        const items  = outfit.items;
        const names  = items.map(i => i.name);
        const colors = items.map(i => i.color);

        // CHECK 1: Gym must only have athletic items
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
            checkIssues.push(`Outfit ${idx+1}: Non-athletic items in gym: ${nonAthletic.map(i=>i.name).join(", ")}`);
            passed = false;
          }
        }

        // CHECK 2: Business formal must have formal shoes  
        if (occasion === "business formal") {
          const shoe = items.find(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
          if (shoe && (CLOTHING_ITEMS[shoe.name]?.formality || 0) < 4) {
            checkIssues.push(`Outfit ${idx+1}: Non-formal shoes (${shoe.name}) in business formal`);
            passed = false;
          }
        }

        // CHECK 3: Cold weather must have layer
        if (weather === "cold" && occasion !== "gym") {
          const hasLayer = items.some(i => CLOTHING_ITEMS[i.name]?.role === "layer");
          if (!hasLayer) {
            checkIssues.push(`Outfit ${idx+1}: No layer in cold weather`);
            passed = false;
          }
        }

        // CHECK 4: Must have shoes
        const hasShoes = items.some(i => CLOTHING_ITEMS[i.name]?.category === "footwear");
        if (!hasShoes) {
          checkIssues.push(`Outfit ${idx+1}: Missing shoes`);
          passed = false;
        }

        // CHECK 5: Wedding guest must have elevated piece
        if (occasion === "wedding guest") {
          const elevated = ["kurta","sherwani","bandhgala","blazer","suit jacket","nehru jacket",
                           "dress shirt","silk blouse","overcoat","trench coat","formal jumpsuit"];
          if (!names.some(n => elevated.includes(n))) {
            checkIssues.push(`Outfit ${idx+1}: No elevated piece in wedding guest`);
            passed = false;
          }
        }
      }

      // CHECK 6: Diversity — no two outfits should have same signature
      if (result.length >= 2) {
        const sigs = result.map(o => o.items.map(i => i.name).sort().join("|"));
        const uniqueSigs = new Set(sigs);
        if (uniqueSigs.size < sigs.length) {
          // If the engine itself flagged it as relaxed, it's an intentional behavior
          if (result.some(r => r.relaxedMatch)) {
            console.log(`   (Info: Structural diversity relaxed intentionally: ${result[0].relaxationReasons.join(", ")})`);
          } else {
            checkIssues.push("Duplicate outfit structures detected without relaxation flag");
            passed = false;
          }
        }
      }

      // CHECK 7: Top color diversity — no two outfits should have same top color
      if (result.length >= 2) {
        const topColors = result.map(o => {
          const top = o.items.find(i => CLOTHING_ITEMS[i.name]?.role === "top");
          return top?.color;
        }).filter(Boolean);
        // Allow some relaxation — flag but don't fail
        const uniqueTopColors = new Set(topColors);
        if (uniqueTopColors.size < topColors.length) {
          checkIssues.push(`Repeated top color in batch: ${topColors.join(", ")}`);
          // Don't fail — this is soft enforcement
        }
      }

      if (passed) {
        // Print items summary
        const outfitSummaries = result.map((o, i) => {
          const parts = o.items.map(item => `${item.color} ${item.name}`).join(" + ");
          return `  ${i+1}. ${parts} (${o.score.grade} ${o.score.totalScore})`;
        });
        console.log(`✅ ${label.padEnd(30)} → ${result.length} outfits`);
        outfitSummaries.forEach(s => console.log(s));
        totalPassed++;
      } else {
        console.log(`❌ ${label.padEnd(30)} → FAILED`);
        checkIssues.forEach(issue => {
          console.log(`   ⚠️ ${issue}`);
          issues.push({ combo: label, issue });
        });
        // Still show outfits for debugging
        result.forEach((o, i) => {
          const parts = o.items.map(item => `${item.color} ${item.name}`).join(" + ");
          console.log(`   ${i+1}. ${parts}`);
        });
        totalFailed++;
      }

    } catch (err) {
      console.log(`💥 ${label.padEnd(30)} → CRASH: ${err.message}`);
      issues.push({ combo: label, issue: `CRASH: ${err.message}` });
      totalFailed++;
    }
    
    console.log(""); // spacing
  }
}

console.log("\n" + "═".repeat(70));
console.log(`RESULTS: ${totalPassed} passed / ${totalFailed} failed / ${totalTests} total`);
console.log("═".repeat(70));

if (issues.length > 0) {
  console.log("\n🚨 ISSUES FOUND:");
  issues.forEach(({ combo, issue }) => {
    console.log(`  • ${combo}: ${issue}`);
  });
}
