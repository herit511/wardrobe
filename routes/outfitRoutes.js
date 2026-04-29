const express = require('express');
const router = express.Router();
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getColorName } = require('../utils/colors');
const { suggestOutfits, scoreOutfit, analyzeWardrobeGaps, scoreWardrobeVersatility, detectColorSeason, parseCLIPLabel, suggestFromCLIP, CLOTHING_ITEMS, INDIAN_FASHION, OCCASIONS, ITEM_FUZZY_MAP: ENGINE_ITEM_FUZZY_MAP } = require('../fashionEngineV3');
const { styleOutfit, ITEM_FUZZY_MAP: STYLE_ITEM_FUZZY_MAP, CANONICAL_TO_ENGINE_ITEM } = require('../fashionStylingEngine');
const fs = require('fs');
const path = require('path');

// Legacy route-level fuzzy map kept for backward compatibility.
const LEGACY_FUZZY_NAME_MAP = {
    'denim pants': 'jeans',
    'pants': 'trousers',
    'tennis shoes': 'sneakers',
    'dress pants': 'trousers',
    'button shirt': 'dress shirt',
    'button up': 'shirt',
    'pullover': 'sweater',
    'coat': 'overcoat',
    'flip-flops': 'flip flops',
    'grey sweatpants': 'joggers',
    'gray sweatpants': 'joggers',
    'camel coat': 'overcoat',
    'maroon sweater': 'sweater',
    'black body fit synthetic tee': 't-shirt',
};

function normalizeToken(value) {
    return String(value || '').toLowerCase().trim();
}

function toEngineKey(rawValue) {
    const raw = normalizeToken(rawValue);
    if (!raw) return '';

    if (CLOTHING_ITEMS[raw]) return raw;

    const asSpaced = raw.replace(/[_-]+/g, ' ');
    if (CLOTHING_ITEMS[asSpaced]) return asSpaced;

    const asHyphen = raw.replace(/_/g, '-');
    if (CLOTHING_ITEMS[asHyphen]) return asHyphen;

    const canonicalMapped = CANONICAL_TO_ENGINE_ITEM[raw] || CANONICAL_TO_ENGINE_ITEM[raw.replace(/[\s-]+/g, '_')];
    if (canonicalMapped && CLOTHING_ITEMS[canonicalMapped]) return canonicalMapped;

    const legacyMapped = LEGACY_FUZZY_NAME_MAP[raw];
    if (legacyMapped && CLOTHING_ITEMS[legacyMapped]) return legacyMapped;

    const styleFuzzyKey = Object.keys(STYLE_ITEM_FUZZY_MAP || {}).find(k => raw.includes(k) || k.includes(raw));
    if (styleFuzzyKey) {
        const canonical = STYLE_ITEM_FUZZY_MAP[styleFuzzyKey];
        const fromCanonical = CANONICAL_TO_ENGINE_ITEM[canonical] || canonical;
        const bridged = toEngineKey(fromCanonical);
        if (bridged && CLOTHING_ITEMS[bridged]) return bridged;
    }

    const engineFuzzyKey = Object.keys(ENGINE_ITEM_FUZZY_MAP || {}).find(k => raw.includes(k) || k.includes(raw));
    if (engineFuzzyKey) {
        const mapped = ENGINE_ITEM_FUZZY_MAP[engineFuzzyKey];
        if (mapped && CLOTHING_ITEMS[mapped]) return mapped;
    }

    const partialMatch = Object.keys(CLOTHING_ITEMS).find(key => raw.includes(key) || key.includes(raw));
    return partialMatch || '';
}

/**
 * Resolve a clothing name to a valid fashionEngine CLOTHING_ITEMS key.
 * Tries: exact match → fuzzy map → subCat map → raw name.
 */
function resolveEngineName(rawName, descriptor = '') {
    const primary = toEngineKey(rawName);
    if (primary) return primary;

    const secondary = toEngineKey(descriptor);
    if (secondary) return secondary;

    return '';
}

function getHardMappedItem(rawDescriptor, fallbackName, colorName) {
    const descriptor = String(rawDescriptor || '').toLowerCase().trim();
    const color = String(colorName || '').toLowerCase().trim();

    if (descriptor.includes('black body fit synthetic tee')) {
        return { name: 't-shirt', fabric: 'jersey', occasionOk: ['gym'] };
    }
    if (descriptor.includes('grey sweatpants') || descriptor.includes('gray sweatpants')) {
        return { name: 'joggers' };
    }
    if (descriptor.includes('camel coat') || (fallbackName === 'overcoat' && color === 'camel')) {
        return { name: 'overcoat' };
    }
    if (descriptor.includes('maroon sweater') || (fallbackName === 'sweater' && color === 'maroon')) {
        return { name: 'sweater', fabricWeight: 'medium' };
    }
    return null;
}

// ============================================
// GET /api/outfits/taxonomy-audit — Report taxonomy synchronization status
// Returns engine keys, fuzzy maps and writes a machine-readable report to repo root
// ============================================
router.get('/taxonomy-audit', auth, async (req, res, next) => {
    try {
        const engineKeys = Object.keys(CLOTHING_ITEMS || {}).sort();
        const styleFuzzy = STYLE_ITEM_FUZZY_MAP || {};
        const engineFuzzy = ENGINE_ITEM_FUZZY_MAP || {};
        const canonical = CANONICAL_TO_ENGINE_ITEM || {};

        // Build reverse index: engineKey -> aliases
        const aliasIndex = {};
        Object.entries(styleFuzzy).forEach(([k, v]) => {
            const eng = canonical[v] || v;
            if (!aliasIndex[eng]) aliasIndex[eng] = [];
            aliasIndex[eng].push(k);
        });
        Object.entries(engineFuzzy).forEach(([k, v]) => {
            const eng = v;
            if (!aliasIndex[eng]) aliasIndex[eng] = [];
            aliasIndex[eng].push(k);
        });

        const report = {
            generatedAt: new Date().toISOString(),
            engineKeys,
            styleFuzzy,
            engineFuzzy,
            canonicalBridge: canonical,
            aliases: aliasIndex,
        };

        const outPath = path.resolve(__dirname, '..', 'taxonomy_sync_report.json');
        fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

        res.json({ success: true, path: outPath, reportSummary: { engineKeyCount: engineKeys.length } });
    } catch (error) {
        next(error);
    }
});

// ============================================
// GET /api/outfits — List saved outfits
// ============================================
router.get('/', auth, async (req, res, next) => {
    try {
        const outfits = await Outfit.find({ userId: req.user.id })
            .populate('items')
            .sort('-createdAt');

        res.json({ success: true, count: outfits.length, data: outfits });
    } catch (error) {
        next(error);
    }
});

// ============================================
// GET /api/outfits/generate — Generate outfits using fashionEngine
// ============================================
router.get('/generate', auth, async (req, res, next) => {
    try {
        const { occasion, temperature, preferredSubCategory } = req.query;

        if (!occasion || !temperature) {
            return res.status(400).json({ success: false, message: 'Occasion and temperature are required' });
        }

        // Convert UI string to engine scale ('Hot' -> 'hot', etc)
        const tempToWeather = { 'hot': 'hot', 'mild': 'mid', 'cold': 'cold' };
        const normalizedTemperature = String(temperature || '').toLowerCase().trim();
        const weather = tempToWeather[normalizedTemperature] || 'mid';

        // Map occasion string to fashionEngine v2 key
        const occasionMap = {
            'casual': 'casual', 'party': 'party', 'office': 'office',
            'formal': 'office', 'interview': 'office', 'gym': 'gym',
            'college': 'casual', 'beach': 'casual', 'streetwear': 'casual',
            'smart-casual': 'office', 'ethnic': 'ethnic', 'date night': 'date night',
            'business formal': 'business formal', 'wedding guest': 'wedding guest', 
            'pooja / puja': 'pooja / puja', 'festival': 'festival'
        };
        const normalizedOccasion = String(occasion || '').toLowerCase().trim();
        const engineOccasion = occasionMap[normalizedOccasion] || 'casual';

        const user = await User.findById(req.user.id);
        const userProfile = user?.styleDna || {};

        // Get user's clean wardrobe items (exclude laundry)
        const userItems = await Item.find({ userId: req.user.id, isLaundry: { $ne: true } });

        if (userItems.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Not enough items in your closet to generate outfits. Please add at least 3 items.'
            });
        }

        // Map DB items → fashionEngine format { name, color, pattern }
        // The fashionEngine uses the new Gemini prompt's vocabulary (e.g. "t-shirt", "jeans", "sneakers")
        const subCatToEngineName = {
            // tops
            'shirt': 'shirt', 'tshirt': 't-shirt', 'polo': 'polo shirt', 'vest': 'vest',
            // bottoms
            'jeans': 'jeans', 'trousers': 'trousers', 'cargo': 'cargo pants',
            'shorts': 'shorts',
            // footwear
            'sneakers': 'sneakers', 'formal_shoes': 'oxford shoes', 'boots': 'boots',
            'slides': 'slides', 'sport': 'sneakers',
            // outerwear
            'coat': 'overcoat', 'blazer': 'blazer', 'hoodie': 'hoodie',
            'jacket': 'jacket', 'sweater': 'sweater',
            // accessories
            'ring': 'ring', 'chain': 'chain', 'watch': 'watch',
            'belt': 'belt', 'cap': 'cap',
        };

        // Map DB hex color → color name for fashionEngine
        const hexToColorName = (hex) => {
            const name = getColorName(hex);
            return name ? name.toLowerCase() : 'black';
        };

        const incompatibleItems = [];
        const wardrobeForEngine = userItems.map(item => {
            const rawSubCategory = item.subCategory || item.sub_category || '';
            const rawName = subCatToEngineName[rawSubCategory] || String(rawSubCategory || '').replace('_', ' ');
            const colorName = hexToColorName(item.color);

            const descriptorCandidates = [
                rawName,
                `${colorName} ${rawName}`,
                rawSubCategory,
                `${colorName} ${rawSubCategory || ''}`,
                item.name,
                item.title,
                item.label,
                item.detectedLabel,
                item.aiLabel,
            ].filter(Boolean).join(' ');

            const baseResolved = resolveEngineName(rawName, descriptorCandidates);
            const hardMapped = getHardMappedItem(descriptorCandidates, baseResolved, colorName);
            const resolvedName = hardMapped?.name || baseResolved || '';

            // Integrity gate: every item must resolve into engine taxonomy before suggestOutfits.
            if (!resolvedName || !CLOTHING_ITEMS[resolvedName]) {
                const incompatibleName = item.name || item.title || rawSubCategory || 'unknown';
                console.error(`CRITICAL ERROR: Incompatible Item: ${incompatibleName}. Sync Required.`);
                incompatibleItems.push({
                    itemId: item._id,
                    original: incompatibleName,
                    subCategory: rawSubCategory,
                });
            }

            return {
                name: resolvedName,
                color: colorName,
                pattern: item.pattern || 'solid',
                fabric: hardMapped?.fabric,
                fabricWeight: hardMapped?.fabricWeight,
                occasionOk: hardMapped?.occasionOk,
                userPreferenceScore: item.userPreferenceScore || 0,
                _dbItem: item,
            };
        });

        if (incompatibleItems.length > 0) {
            return res.status(422).json({
                success: false,
                code: 'taxonomy_sync_required',
                message: 'Taxonomy integrity check failed. Incompatible wardrobe items detected.',
                incompatibleItems,
            });
        }

        // Safety check 1: Must have at least one top and one bottom
        const hasTops = wardrobeForEngine.some(i => CLOTHING_ITEMS[i.name]?.role === 'top');
        const hasBottoms = wardrobeForEngine.some(i => CLOTHING_ITEMS[i.name]?.role === 'bottom');
        if (!hasTops || !hasBottoms) {
            return res.status(400).json({
                success: false,
                message: 'Upload at least one top and one bottom to generate outfit combinations.'
            });
        }

        let finalWardrobeForEngine = [...wardrobeForEngine];
        let preferredAccessoryItems = []; // Track accessories to inject later

        let preferences = [];
        if (preferredSubCategory) {
            if (Array.isArray(preferredSubCategory)) {
                preferences = preferredSubCategory;
            } else if (typeof preferredSubCategory === 'string') {
                preferences = preferredSubCategory.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        if (preferences.length > 0) {
            console.log(`[fashionEngine] User has ${preferences.length} preferences: ${preferences.join(', ')}`);
            preferences.forEach(pref => {
                const rawName = subCatToEngineName[pref] || pref.replace('_', ' ');
                const resolvedName = resolveEngineName(rawName);
                const prefRole = CLOTHING_ITEMS[resolvedName]?.role;

                if (prefRole === 'accessory') {
                    // Accessories are NOT part of outfit composition — engine handles them separately.
                    // So instead of pruning, we collect matching accessories to inject into every outfit.
                    const matchingAccs = wardrobeForEngine.filter(i => {
                        const iRawName = subCatToEngineName[i._dbItem.subCategory] || i._dbItem.subCategory.replace('_', ' ');
                        const iResolved = resolveEngineName(iRawName);
                        return iResolved === resolvedName || i._dbItem.subCategory === pref;
                    });
                    preferredAccessoryItems = [...preferredAccessoryItems, ...matchingAccs];
                    console.log(`[fashionEngine] Preferred accessory: "${resolvedName}" — found ${matchingAccs.length} matching items to inject`);
                } else {
                    console.log(`[fashionEngine] Preferred standard category: "${resolvedName}" (role: ${prefRole || 'unknown'})`);
                    const beforeCount = finalWardrobeForEngine.length;
                    finalWardrobeForEngine = finalWardrobeForEngine.filter(i => {
                        const iRawName = subCatToEngineName[i._dbItem.subCategory] || i._dbItem.subCategory.replace('_', ' ');
                        const iResolved = resolveEngineName(iRawName);
                        
                        const iRole = CLOTHING_ITEMS[iResolved]?.role;

                        // 1. Literal subCategory string equality — absolute match
                        if (i._dbItem.subCategory === pref) return true;

                        // 2. If roles match, it MUST be the preferred one to survive
                        if (prefRole && iRole && prefRole === iRole) {
                            return iResolved === resolvedName;
                        }

                        // 3. Fallback: if role resolution is missing, keep it for safety unless it's a known conflict
                        return true;
                    });
                    console.log(`[fashionEngine] Pruning complete for ${pref}: ${beforeCount} -> ${finalWardrobeForEngine.length} items`);
                }
            });
        }

        // Call the fashionEngine (NOT Gemini)
        console.log(`\n[fashionEngine] Calling suggestOutfits() with ${finalWardrobeForEngine.length} items, occasion=${engineOccasion}, weather=${weather}`);
        console.log(`[fashionEngine] Wardrobe items:`, finalWardrobeForEngine.map(i => ({ name: i.name, color: i.color, pattern: i.pattern })));
        const raw = suggestOutfits(finalWardrobeForEngine, engineOccasion, weather, userProfile);
        
        // Handle Error / No Outfits pass
        if (!raw || raw.success === false || raw.error) {
            console.log(`[fashionEngine] suggestOutfits failed to find matches. Advisor mode enabled.`);
            const advisorFeedback = raw?.advisorFeedback || {
                message: raw?.message || raw?.error || 'No outfits found.',
                topRecommendation: 'Try a different occasion/weather or add a few versatile basics.',
                reasonCodes: raw?.code ? [raw.code] : []
            };
            return res.status(200).json({
                success: false,
                mode: 'advisor',
                advisorFeedback,
                message: advisorFeedback.message
            });
        }

        const outfitsToStyle = Array.isArray(raw) ? raw : (raw.data || []);
        console.log(`[fashionEngine] suggestOutfits returned ${outfitsToStyle.length} outfit(s)`);

        // Apply styling intelligence
        const styledOutfits = outfitsToStyle.map(outfit => styleOutfit(outfit, engineOccasion, weather, userProfile));
        console.log("Styled outfit card:", 
          JSON.stringify(styledOutfits[0]?.card, null, 2));

        if (styledOutfits.length === 0) {
            const emptyGaps = analyzeWardrobeGaps(finalWardrobeForEngine, engineOccasion, weather, userProfile);
            return res.status(200).json({
                success: false,
                mode: 'advisor',
                message: 'Empty wardrobe results.',
                advisorFeedback: {
                    message: 'Add more items to unlock combinations.',
                    missingCategories: emptyGaps.gaps,
                    topRecommendation: emptyGaps.topRecommendation,
                    reasonCodes: emptyGaps.reasonCodes,
                    suggestedItems: Array.isArray(emptyGaps.suggestedItems) && emptyGaps.suggestedItems.length > 0
                        ? emptyGaps.suggestedItems
                        : emptyGaps.gaps.map((gap) => ({
                            tip: gap.split(' — ')[0],
                            reason: gap.includes(' — ') ? gap.split(' — ')[1] : 'This will open up new outfit possibilities.'
                        }))
                }
            });
        }

        // Map fashionEngine output → frontend expected format
        const buildDisplayName = (color, name) => {
            const rawColor = String(color || '').trim();
            const rawName = String(name || '').trim();
            if (!rawName) return rawColor;

            const colorLower = rawColor.toLowerCase();
            const nameLower = rawName.toLowerCase();
            if (colorLower && (nameLower === colorLower || nameLower.startsWith(`${colorLower} `))) {
                return rawName;
            }
            return [rawColor, rawName].filter(Boolean).join(' ');
        };

        const generatedOutfits = styledOutfits.map((outfit, index) => {
            const outfitItems = outfit.items.map(item => {
                const dbItem = item._dbItem;
                let typeStr = 'Accessory';
                if (dbItem) {
                    if (['top', 'tops'].includes(dbItem.category.toLowerCase())) typeStr = 'Top';
                    if (['bottom', 'bottoms'].includes(dbItem.category.toLowerCase())) typeStr = 'Bottom';
                    if (dbItem.category.toLowerCase() === 'footwear') typeStr = 'Shoes';
                    if (dbItem.category.toLowerCase() === 'outerwear') typeStr = 'Outerwear';
                }
                return {
                    type: typeStr,
                    name: buildDisplayName(item.color, item.name),
                    color: dbItem ? dbItem.color : '#000000',
                    imageUrl: dbItem ? dbItem.imageUrl : '',
                    _id: dbItem ? dbItem._id : null,
                };
            });

            // Inject preferred accessory items into the outfit
            if (preferredAccessoryItems.length > 0) {
                preferredAccessoryItems.forEach(accItem => {
                    outfitItems.push({
                        type: 'Accessory',
                        name: buildDisplayName(accItem.color, accItem.name),
                        color: accItem._dbItem ? accItem._dbItem.color : '#000000',
                        imageUrl: accItem._dbItem ? accItem._dbItem.imageUrl : '',
                        _id: accItem._dbItem ? accItem._dbItem._id : null,
                    });
                });
            }

            // Also include engine-suggested accessories (if no preferred was set)
            if (preferredAccessoryItems.length === 0 && outfit.accessories && outfit.accessories.length > 0) {
                outfit.accessories.forEach(acc => {
                    // Engine accessories are name strings like "watch" — find matching wardrobe item
                    const matchingWardrobeItem = wardrobeForEngine.find(w => w.name === acc || w.name === acc.name);
                    if (matchingWardrobeItem) {
                        outfitItems.push({
                            type: 'Accessory',
                            name: buildDisplayName(matchingWardrobeItem.color, matchingWardrobeItem.name),
                            color: matchingWardrobeItem._dbItem ? matchingWardrobeItem._dbItem.color : '#000000',
                            imageUrl: matchingWardrobeItem._dbItem ? matchingWardrobeItem._dbItem.imageUrl : '',
                            _id: matchingWardrobeItem._dbItem ? matchingWardrobeItem._dbItem._id : null,
                        });
                    }
                });
            }

            // Convert fashionEngine score (0-10) to a percentage
            const matchPercent = Math.round(outfit.score.totalScore * 10);

            return {
                id: `gen-engine-${Date.now()}-${index}`,
                title: outfit.outfitName || outfit.score.outfitName || `${occasion} Style ${index + 1}`,
                match: matchPercent,
                tags: [occasion, outfit.score.grade],
                explanation: outfit.explanation || `Score: ${outfit.score.totalScore}/10. ${outfit.score.tips?.[0] || ''}`,
                items: outfitItems,
                warnings: outfit.warnings || [],
                breakdown: outfit.score.breakdown || {},
                tips: outfit.score.tips || [],
                // Styled attributes
                description: outfit.description,
                feelLine: outfit.feelLine,
                colorStory: outfit.colorStory,
                signatureMove: outfit.signatureMove,
                microStyling: outfit.microStyling,
                finishingMove: outfit.finishingMove,
                trends: outfit.trends,
                wowReason: outfit.wowReason,
                moodBoard: outfit.moodBoard,
                card: outfit.card,
                threeSecond: outfit.threeSecond,
                relaxedMatch: outfit.relaxedMatch,
                relaxationReasons: outfit.relaxationReasons,
                confidence: outfit.confidence,
                accessories: outfit.accessories || []
            };
        });

        const engineGaps = analyzeWardrobeGaps(finalWardrobeForEngine, engineOccasion, weather, userProfile);
        const engineVersatility = scoreWardrobeVersatility(finalWardrobeForEngine);
        
        let culturalContext = null;
        if (engineOccasion === 'festival') {
            culturalContext = { type: 'festival', data: INDIAN_FASHION.festivalColors };
        } else if (engineOccasion === 'ethnic' || engineOccasion === 'pooja / puja') {
            culturalContext = { type: 'ethnic', data: OCCASIONS[engineOccasion].keyRules };
        }

        res.json({ success: true, count: generatedOutfits.length, data: generatedOutfits, gaps: engineGaps, versatility: engineVersatility, culturalContext });
    } catch (error) {
        next(error);
    }
});

// ============================================
// POST /api/outfits — Save a generated outfit
// ============================================
router.post('/', auth, async (req, res, next) => {
    try {
        const { title, items, occasion, isFavorite } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Outfit must contain items.' });
        }

        const newOutfit = await Outfit.create({
            userId: req.user.id,
            title: title || 'Saved Outfit',
            items,
            occasion: occasion || 'Casual',
            isFavorite: isFavorite || false,
            // Styling Metadata
            personality: req.body.personality,
            signatureMove: req.body.signatureMove,
            feelLine: req.body.feelLine,
            colorStory: req.body.colorStory,
            microStyling: req.body.microStyling,
            finishingMove: req.body.finishingMove,
            wowReason: req.body.wowReason,
            // Generation Context
            generationContext: req.body.generationContext || {
                weather: req.body.weather,
                occasion: occasion,
                selectedVibe: req.body.selectedVibe,
                relaxedMatch: req.body.relaxedMatch,
                confidence: req.body.confidence
            }
        });

        // If this is a manual outfit (we'll pass a flag or just assume custom logic means it's manual)
        // Let's increment userPreferenceScore of the items to feed the AI
        if (req.body.isManual) {
            await Item.updateMany(
                { _id: { $in: items }, userId: req.user.id },
                { $inc: { userPreferenceScore: 1 } }
            );
        }

        res.status(201).json({ success: true, data: newOutfit });
    } catch (error) {
        next(error);
    }
});

// ============================================
// POST /api/outfits/:id/wear — Track an outfit being worn
// ============================================
router.post('/:id/wear', auth, async (req, res, next) => {
    try {
        const outfit = await Outfit.findOne({ _id: req.params.id, userId: req.user.id });

        if (!outfit) {
            return res.status(404).json({ success: false, message: 'Outfit not found.' });
        }

        outfit.wornHistory.push({ date: new Date() });
        await outfit.save();

        // Look at constituent items to update wearCount and potentially send to laundry
        if (outfit.items && outfit.items.length > 0) {
            const items = await Item.find({ _id: { $in: outfit.items }, userId: req.user.id });
            const bulkOps = [];
            
            for (const item of items) {
                const isExempt = ['footwear', 'accessories'].includes(item.category.toLowerCase());
                let newWearCount = (item.wearCount || 0) + 1;
                let newIsLaundry = item.isLaundry || false;

                // Don't modify items already in laundry
                if (newIsLaundry) continue;

                if (!isExempt) {
                    if (newWearCount >= 3) {
                        newIsLaundry = true;
                        newWearCount = 0; // reset
                    }
                }

                bulkOps.push({
                    updateOne: {
                        filter: { _id: item._id },
                        update: { $set: { wearCount: newWearCount, isLaundry: newIsLaundry, lastWorn: new Date() } }
                    }
                });
            }

            if (bulkOps.length > 0) {
                await Item.bulkWrite(bulkOps);
            }
        }

        res.json({ success: true, data: outfit });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/outfits/:id/favorite — Toggle outfit favorite
// ============================================
router.put('/:id/favorite', auth, async (req, res, next) => {
    try {
        const outfit = await Outfit.findOne({ _id: req.params.id, userId: req.user.id });
        if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found.' });

        outfit.isFavorite = !outfit.isFavorite;
        await outfit.save();
        res.json({ success: true, data: outfit });
    } catch (error) { next(error); }
});
// ============================================
// DELETE /api/outfits/:id — Delete a saved outfit
// ============================================
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const outfit = await Outfit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!outfit) {
            return res.status(404).json({ success: false, message: 'Outfit not found.' });
        }

        res.json({ success: true, message: 'Outfit removed.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
