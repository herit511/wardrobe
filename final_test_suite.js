const fashionEngine = require("./fashionEngineV3.js");

const testWardrobe = [
  { name: "t-shirt", formality: 1, color: "white", role: "top", category: "basics" },
  { name: "shorts", formality: 1, color: "beige", role: "bottom", category: "bottoms" },
  { name: "sneakers", formality: 1, color: "white", role: "shoes", category: "footwear" },
  { name: "hoodie", formality: 2, color: "grey", role: "layer", category: "layers" },
  { name: "joggers", formality: 1, color: "black", role: "bottom", category: "bottoms" },
  { name: "running shoes", formality: 1, color: "black", role: "shoes", category: "footwear" },
  { name: "jeans", formality: 2, color: "blue", role: "bottom", category: "bottoms" },
  { name: "blouse", formality: 3, color: "white", role: "top", category: "tops" },
  { name: "dress pants", formality: 4, color: "black", role: "bottom", category: "bottoms" },
  { name: "loafers", formality: 4, color: "black", role: "shoes", category: "footwear" },
  { name: "kurta", formality: 3, color: "navy", role: "top", category: "ethnic" },
  { name: "churidar", formality: 3, color: "cream", role: "bottom", category: "ethnic" },
  { name: "mojari", formality: 3, color: "gold", role: "shoes", category: "footwear" }
];

function showResult(result, testName) {
  if (result?.success === false || result?.error) {
    console.log(`${testName}: ${result.code} - ${result.error}`);
  } else {
    const arr = Array.isArray(result) ? result : (result?.data || []);
    if (arr.length > 0) {
      const outfit = arr[0];
      const items = outfit.items.map(i => i.name).join(" + ");
      const score = outfit.score.totalScore;
      console.log(`${testName}: ${items} [Score: ${score}] ✅`);
      return;
    }
    console.log(`${testName}: No results`);
  }
}

console.log("\n=== TEST 1: Gym + Cold ===");
const test1 = fashionEngine.suggestOutfits(testWardrobe, "gym", "cold");
showResult(test1, "TEST 1");

console.log("\n=== TEST 2: Office + Hot ===");
const test2 = fashionEngine.suggestOutfits(testWardrobe, "office", "hot");
showResult(test2, "TEST 2");

console.log("\n=== TEST 3: Casual + Hot ===");
const test3 = fashionEngine.suggestOutfits(testWardrobe, "casual", "hot");
showResult(test3, "TEST 3");

console.log("\n=== TEST 4: Ethnic + Mid ===");
const test4 = fashionEngine.suggestOutfits(testWardrobe, "ethnic", "mid");
showResult(test4, "TEST 4");
