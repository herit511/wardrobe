const fs = require('fs');
const path = require('path');
const engine = require('./fashionEngineV3');
const styling = require('./fashionStylingEngine');

function buildReport() {
  const CLOTHING_ITEMS = engine.CLOTHING_ITEMS || {};
  const ENGINE_ITEM_FUZZY_MAP = engine.ITEM_FUZZY_MAP || {};
  const STYLE_ITEM_FUZZY_MAP = styling.ITEM_FUZZY_MAP || {};
  const CANONICAL_TO_ENGINE_ITEM = styling.CANONICAL_TO_ENGINE_ITEM || {};

  const engineKeys = Object.keys(CLOTHING_ITEMS).sort();

  const aliasIndex = {};
  Object.entries(STYLE_ITEM_FUZZY_MAP).forEach(([k, v]) => {
    const eng = CANONICAL_TO_ENGINE_ITEM[v] || v;
    if (!aliasIndex[eng]) aliasIndex[eng] = [];
    aliasIndex[eng].push(k);
  });
  Object.entries(ENGINE_ITEM_FUZZY_MAP).forEach(([k, v]) => {
    const eng = v;
    if (!aliasIndex[eng]) aliasIndex[eng] = [];
    aliasIndex[eng].push(k);
  });

  const report = {
    generatedAt: new Date().toISOString(),
    engineKeys,
    canonicalBridge: CANONICAL_TO_ENGINE_ITEM,
    aliases: aliasIndex,
    styleFuzzyCount: Object.keys(STYLE_ITEM_FUZZY_MAP).length,
    engineFuzzyCount: Object.keys(ENGINE_ITEM_FUZZY_MAP).length,
  };

  const outPath = path.resolve(__dirname, 'taxonomy_sync_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Wrote taxonomy sync report to', outPath);
}

buildReport();
