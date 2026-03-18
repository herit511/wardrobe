const express = require('express');
const router = express.Router();
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getColorName } = require('../utils/colors');
const { suggestOutfits, parseCLIPLabel, CLOTHING_ITEMS } = require('../fashionEngine');

// Fuzzy-match mapping for common Gemini mismatches
const FUZZY_NAME_MAP = {
    'denim pants': 'jeans',
    'pants': 'trousers',
    'tennis shoes': 'sneakers',
    'dress pants': 'trousers',
    'button shirt': 'dress shirt',
    'button up': 'shirt',
    'pullover': 'sweater',
    'coat': 'overcoat',
    'flip-flops': 'flip flops',
};

/**
 * Resolve a clothing name to a valid fashionEngine CLOTHING_ITEMS key.
 * Tries: exact match → fuzzy map → subCat map → raw name.
 */
function resolveEngineName(rawName) {
    if (CLOTHING_ITEMS[rawName]) return rawName;
    if (FUZZY_NAME_MAP[rawName]) return FUZZY_NAME_MAP[rawName];
    // Try partial match against CLOTHING_ITEMS keys
    const lower = rawName.toLowerCase();
    const partialMatch = Object.keys(CLOTHING_ITEMS).find(key => lower.includes(key) || key.includes(lower));
    return partialMatch || rawName;
}

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
        const { occasion = 'casual', temperature = 'mild' } = req.query;

        // Map temperature → season for fashionEngine
        const tempToSeason = { hot: 'summer', warm: 'summer', mild: 'spring', cool: 'fall', cold: 'winter' };
        const season = tempToSeason[temperature.toLowerCase()] || 'spring';

        // Map occasion string to fashionEngine key
        const occasionMap = {
            'casual': 'casual', 'party': 'party', 'office': 'smart-casual',
            'formal': 'formal', 'interview': 'interview', 'gym': 'gym',
            'college': 'college', 'beach': 'beach', 'streetwear': 'casual',
            'smart-casual': 'smart-casual', 'ethnic': 'party',
        };
        const engineOccasion = occasionMap[occasion.toLowerCase()] || 'casual';

        // Get user's wardrobe items
        const userItems = await Item.find({ userId: req.user.id });

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
            'shirt': 'shirt', 'tshirt': 't-shirt', 'vest': 'vest',
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

        const wardrobeForEngine = userItems.map(item => {
            const rawName = subCatToEngineName[item.subCategory] || item.subCategory.replace('_', ' ');
            return {
                name: resolveEngineName(rawName),
                color: hexToColorName(item.color),
                pattern: item.pattern || 'solid',
                _dbItem: item,
            };
        });

        // Safety check 1: Must have at least one top and one bottom
        const hasTops = wardrobeForEngine.some(i => CLOTHING_ITEMS[i.name]?.role === 'top');
        const hasBottoms = wardrobeForEngine.some(i => CLOTHING_ITEMS[i.name]?.role === 'bottom');
        if (!hasTops || !hasBottoms) {
            return res.status(400).json({
                success: false,
                message: 'Upload at least one top and one bottom to generate outfit combinations.'
            });
        }

        // Call the fashionEngine
        const engineResults = suggestOutfits(wardrobeForEngine, engineOccasion, season);

        // Safety check 3: Empty results
        if (!engineResults || engineResults.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No outfit combinations found. Try uploading more items or switching the occasion.'
            });
        }

        // Map fashionEngine output → frontend expected format
        const generatedOutfits = engineResults.map((outfit, index) => {
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
                    name: `${item.color} ${item.name}`,
                    color: dbItem ? dbItem.color : '#000000',
                    imageUrl: dbItem ? dbItem.imageUrl : '',
                    _id: dbItem ? dbItem._id : null,
                };
            });

            // Convert fashionEngine score (0-10) to a percentage
            const matchPercent = Math.round(outfit.score.totalScore * 10);

            return {
                id: `gen-engine-${Date.now()}-${index}`,
                title: outfit.score.outfitName || `${occasion} Style ${index + 1}`,
                match: matchPercent,
                tags: [occasion, outfit.score.grade],
                explanation: outfit.explanation || `Score: ${outfit.score.totalScore}/10. ${outfit.score.tips?.[0] || ''}`,
                items: outfitItems,
            };
        });

        res.json({ success: true, count: generatedOutfits.length, data: generatedOutfits });
    } catch (error) {
        next(error);
    }
});

// ============================================
// POST /api/outfits — Save a generated outfit
// ============================================
router.post('/', auth, async (req, res, next) => {
    try {
        const { title, items, occasion } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Outfit must contain items.' });
        }

        const newOutfit = await Outfit.create({
            userId: req.user.id,
            title: title || 'Saved Outfit',
            items,
            occasion: occasion || 'Casual'
        });

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

        res.json({ success: true, data: outfit });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/outfits/:id/favorite — Toggle favorite status
// ============================================
router.put('/:id/favorite', auth, async (req, res, next) => {
    try {
        const outfit = await Outfit.findOne({ _id: req.params.id, userId: req.user.id });

        if (!outfit) {
            return res.status(404).json({ success: false, message: 'Outfit not found.' });
        }

        outfit.isFavorite = !outfit.isFavorite;
        await outfit.save();

        res.json({ success: true, data: outfit });
    } catch (error) {
        next(error);
    }
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
