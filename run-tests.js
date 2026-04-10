const { suggestOutfits } = require('./fashionEngine');

const tests = [
  {
    name: "TEST 1 — Gym + Cold",
    occasion: "gym",
    weather: "cold",
    wardrobe: [
      { name: "hoodie", color: "Gray" },
      { name: "dress trousers", color: "Charcoal" }, // Using dress trousers to definitively test formal block
      { name: "running shoes", color: "White" }
    ]
  },
  {
    name: "TEST 2 — Office + Hot",
    occasion: "office",
    weather: "hot",
    wardrobe: [
      { name: "dress shirt", color: "Blue" },
      { name: "shorts", color: "Beige" },
      { name: "white sneakers", color: "White" },
      { name: "loafers", color: "Brown" }
    ]
  },
  {
    name: "TEST 3 — Casual + Hot",
    occasion: "casual",
    weather: "hot",
    wardrobe: [
      { name: "t-shirt", color: "White" },
      { name: "shorts", color: "Beige" },
      { name: "white sneakers", color: "White" }
    ]
  },
  {
    name: "TEST 4 — Ethnic + Mid",
    occasion: "ethnic",
    weather: "mid",
    wardrobe: [
      { name: "kurta", color: "Navy" },
      { name: "churidar", color: "White" },
      { name: "mojari", color: "Brown" },
      { name: "dress shirt", color: "White" },
      { name: "jeans", color: "Dark Blue" },
      { name: "white sneakers", color: "White" }
    ]
  }
];

tests.forEach((t, i) => {
  console.log(`\n===========================================`);
  console.log(`${t.name}`);
  console.log(`===========================================`);
  const result = suggestOutfits(t.wardrobe, t.occasion, t.weather);
  
  if (result && result.error) {
    console.log(`\nRESULT ERROR: [${result.code}] ${result.error}`);
  } else if (result && result.length > 0) {
    console.log(`\nSUCCESSFULLY GENERATED ${result.length} OUTFIT(S)`);
    result.forEach((r, idx) => {
      console.log(`Outfit ${idx+1}:`, r.items.map(i => i.name));
    });
  } else {
    console.log(`\nRESULT: No outfits / empty array`);
  }
});
