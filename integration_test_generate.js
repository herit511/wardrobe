const { suggestOutfits } = require('./fashionEngineV3');
const { styleOutfit } = require('./fashionStylingEngine');

async function run() {
  const wardrobe = [
    { name: 'shirt', color: 'white', pattern: 'solid' },
    { name: 'trousers', color: 'charcoal', pattern: 'solid' },
    { name: 'white sneakers', color: 'white', pattern: 'solid' },
    { name: 'blazer', color: 'navy', pattern: 'solid' }
  ];

  console.log('Running suggestOutfits for office/mid...');
  const raw = suggestOutfits(wardrobe, 'office', 'mid', {});
  if (!raw || raw.success === false) {
    console.log('Advisor feedback:', raw?.advisorFeedback || raw);
    process.exit(0);
  }

  const outfits = Array.isArray(raw) ? raw : raw.data || [];
  console.log('Outfits returned:', outfits.length);
  if (outfits.length > 0) {
    const styled = outfits.map(o => styleOutfit(o, 'office', 'mid', {}));
    console.log('Styled sample:', styled[0]?.card ? styled[0].card : styled[0]);
  }
}

run();
