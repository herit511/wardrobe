const express = require('express');
const router = express.Router();
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getColorName } = require('../utils/colors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
// GET /api/outfits/generate — Generate outfits based on wardrobe
// ============================================
router.get('/generate', auth, async (req, res, next) => {
    try {
        const { occasion = 'Casual', temperature = 'mild' } = req.query;

        // Get user and their wardrobe
        const [user, userItems] = await Promise.all([
            User.findById(req.user.id),
            Item.find({ userId: req.user.id })
        ]);
        
        if (userItems.length < 3) {
             return res.status(400).json({ 
                 success: false, 
                 message: 'Not enough items in your closet to generate outfits. Please add at least 3 items.' 
             });
        }

        const tops = userItems.filter(i => i.category.toLowerCase() === 'top' || i.category.toLowerCase() === 'tops');
        const bottoms = userItems.filter(i => i.category.toLowerCase() === 'bottom' || i.category.toLowerCase() === 'bottoms');
        const footwear = userItems.filter(i => i.category.toLowerCase() === 'footwear');
        const outerwear = userItems.filter(i => i.category.toLowerCase() === 'outerwear');
        const accessories = userItems.filter(i => i.category.toLowerCase() === 'accessories');

        if (tops.length === 0 || bottoms.length === 0 || footwear.length === 0) {
             return res.status(400).json({ 
                 success: false, 
                 message: 'To generate an outfit, you need at least 1 Top, 1 Bottom, and 1 Footwear in your closet.' 
             });
        }

        // --- SMARTSCORE ENGINE ---
        const preferredColors = user?.styleDna?.preferredColors || [];
        const preferredFit = user?.styleDna?.preferredFit || '';
        const archetypes = user?.styleDna?.archetypes || ['Modern'];

        let generatedOutfits = [];
        let aiSuccess = false;

        // --- GEMINI 2.5 PRO AI ENGINE ---
        // Only trigger true AI if they have a healthy amount of items to prevent AI from struggling to pick 3 unique outfits
        if (userItems.length >= 5 && process.env.GEMINI_API_KEY) {
            try {
                // Compress the wardrobe to save tokens
                const compressItem = (i) => ({ id: i._id, type: i.category, sub: i.subCategory, color: i.color, fit: i.fit, pattern: i.pattern });
                
                const wardrobe = {
                    tops: tops.map(compressItem),
                    bottoms: bottoms.map(compressItem),
                    footwear: footwear.map(compressItem),
                    outerwear: outerwear.map(compressItem),
                    accessories: accessories.map(compressItem)
                };

                const prompt = `
You are an expert personal fashion stylist. I need you to create exactly 3 unique outfit combinations from the provided JSON Wardrobe.
The user needs an outfit for a ${occasion} occasion in ${temperature} weather.
Their preferred fit is ${preferredFit || 'any'} and they lean towards a ${archetypes[0]} aesthetic.
Their favorite colors are ${preferredColors.join(', ')}.

Rules:
1. Every outfit MUST have exactly 1 'top', exactly 1 'bottom', and exactly 1 'footwear'.
2. You MAY optionally include 1 'outerwear' and/or 1 'accessories' if it elevates the outfit and fits the weather.
3. Every outfit must be completely unique. Try not to reuse the exact same top and bottom.
4. Return ONLY a raw JSON array containing exactly 3 objects. NO MARKDOWN. NO BACKTICKS. NO TEXT OUTSIDE JSON.

JSON Schema:
[
  {
    "explanation": "A highly descriptive, creative 1-sentence fashion explanation of why these specific pieces go together for this occasion and weather.",
    "items": ["id1", "id2", "id3", "id4"] // Array of the exact ID strings of the items you chose
  }
]

Wardrobe:
${JSON.stringify(wardrobe)}
                `;

                const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                
                const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                let aiChoices;
                try {
                    aiChoices = JSON.parse(cleanedText);
                } catch (parseErr) {
                    console.error("Failed to parse Gemini JSON:", cleanedText);
                    throw parseErr;
                }

                if (Array.isArray(aiChoices) && aiChoices.length > 0) {
                    generatedOutfits = aiChoices.map((choice, index) => {
                        // Rehydrate the IDs back into full DB items
                        const hydratedItems = choice.items.map(id => userItems.find(ui => ui._id.toString() === id)).filter(Boolean);
                        
                        // Convert to frontend's expected format Docs array
                        const outfitItemsDocs = hydratedItems.map(item => {
                            let typeStr = 'Accessory';
                            if (['top', 'tops'].includes(item.category.toLowerCase())) typeStr = 'Top';
                            if (['bottom', 'bottoms'].includes(item.category.toLowerCase())) typeStr = 'Bottom';
                            if (item.category.toLowerCase() === 'footwear') typeStr = 'Shoes';
                            if (item.category.toLowerCase() === 'outerwear') typeStr = 'Outerwear';

                            return {
                                type: typeStr,
                                name: `${getColorName(item.color)} ${item.subCategory.replace('_', ' ')}`,
                                color: item.color,
                                imageUrl: item.imageUrl,
                                _id: item._id
                            };
                        });

                        // Calculate an artificial match score based on AI rank (1st is highest)
                        const score = 95 - (index * 5); 

                        return {
                            id: `gen-ai-${Date.now()}-${index}`,
                            title: `${occasion} Style ${index + 1}`,
                            match: score,
                            tags: [occasion, 'AI Styled'],
                            explanation: choice.explanation,
                            items: outfitItemsDocs
                        };
                    });
                    
                    // Validate that the AI successfully rehydrated at least top, bottom, and shoe
                    const isValidOutfit = generatedOutfits.every(o => o.items.find(i => i.type === 'Top') && o.items.find(i => i.type === 'Bottom') && o.items.find(i => i.type === 'Shoes'));
                    if (isValidOutfit && generatedOutfits.length > 0) {
                        aiSuccess = true;
                    }
                }
            } catch (err) {
                console.error("\n===========================");
                console.error("GEMINI OUTFIT GEN ERROR:");
                console.error(err.message);
                if (err.response) console.error(err.response.data);
                console.error("===========================\n");
            }
        }

        // --- FALLBACK RANDOM PERMUTATION ENGINE ---
        if (!aiSuccess) {
            console.log("Using Fallback Random Permutation Engine");
            const permutations = [];
            for (let i = 0; i < 50; i++) {
                const top = tops[Math.floor(Math.random() * tops.length)];
                const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
                const shoe = footwear[Math.floor(Math.random() * footwear.length)];
                
                let outer = null;
                let acc = null;
                
                if (outerwear.length > 0 && Math.random() > 0.5) {
                    outer = outerwear[Math.floor(Math.random() * outerwear.length)];
                }
                if (accessories.length > 0 && Math.random() > 0.4) {
                    acc = accessories[Math.floor(Math.random() * accessories.length)];
                }
                
                const comboId = `${top._id}-${bottom._id}-${shoe._id}${outer ? '-' + outer._id : ''}${acc ? '-' + acc._id : ''}`;
                
                if (!permutations.find(p => p.comboId === comboId)) {
                    permutations.push({ comboId, top, bottom, shoe, outer, acc });
                }
            }

            const scoredOutfits = permutations.map(combo => {
                let score = 0;
                let matchedReasons = [];

                const items = [combo.top, combo.bottom, combo.shoe];
                if (combo.outer) items.push(combo.outer);
                if (combo.acc) items.push(combo.acc);

                if (preferredColors.length > 0) {
                    const colorMatch = items.some(item => preferredColors.includes(item.color));
                    if (colorMatch) {
                        score += 30;
                        matchedReasons.push('incorporating your favorite colors');
                    }
                }

                if (preferredFit && Math.random() > 0.5) {
                    score += 20;
                    matchedReasons.push(`a nice ${preferredFit.toLowerCase()} silhouette`);
                }

                let weatherBonus = 0;
                items.forEach(item => {
                    if (!item.season || item.season.length === 0) return;
                    if (temperature === 'hot' && (item.season.includes('summer') || item.season.includes('all_season'))) weatherBonus += 10;
                    else if (temperature === 'cold' && (item.season.includes('winter') || item.season.includes('all_season'))) weatherBonus += 10;
                    else if (temperature === 'mild' && (item.season.includes('all_season') || item.season.includes('monsoon') || item.season.includes('summer'))) weatherBonus += 10;
                });

                if (weatherBonus > 15) {
                    score += 25;
                    if (temperature === 'hot') matchedReasons.push('perfect for the warm weather');
                    if (temperature === 'cold') matchedReasons.push('cozy for the chilly weather');
                }

                score += Math.floor(Math.random() * 20);
                return { ...combo, score, matchedReasons };
            });

            scoredOutfits.sort((a, b) => b.score - a.score);
            const topCombos = scoredOutfits.slice(0, 3);

            generatedOutfits = topCombos.map((combo, index) => {
                const topColorName = getColorName(combo.top.color);
                const bottomColorName = getColorName(combo.bottom.color);
                
                let explanation = `A stylish ${occasion.toLowerCase()} pairing. The ${topColorName.toLowerCase()} ${combo.top.subCategory.replace('_', ' ')} works perfectly with the ${bottomColorName.toLowerCase()} ${combo.bottom.subCategory.replace('_', ' ')}.`;
                
                if (combo.matchedReasons.length > 0) {
                    const archStr = archetypes.length > 0 ? archetypes[0] : 'Chic';
                    explanation = `A perfect ${occasion} look ${combo.matchedReasons.join(' and ')}, right aligned with your ${archStr} DNA.`;
                }

                const outfitItemsDocs = [
                    { type: 'Top', name: `${topColorName} ${combo.top.subCategory.replace('_', ' ')}`, color: combo.top.color, imageUrl: combo.top.imageUrl, _id: combo.top._id },
                    { type: 'Bottom', name: `${bottomColorName} ${combo.bottom.subCategory.replace('_', ' ')}`, color: combo.bottom.color, imageUrl: combo.bottom.imageUrl, _id: combo.bottom._id },
                    { type: 'Shoes', name: `${getColorName(combo.shoe.color)} ${combo.shoe.subCategory.replace('_', ' ')}`, color: combo.shoe.color, imageUrl: combo.shoe.imageUrl, _id: combo.shoe._id }
                ];
                if (combo.outer) outfitItemsDocs.push({ type: 'Outerwear', name: `${getColorName(combo.outer.color)} ${combo.outer.subCategory.replace('_', ' ')}`, color: combo.outer.color, imageUrl: combo.outer.imageUrl, _id: combo.outer._id });
                if (combo.acc) outfitItemsDocs.push({ type: 'Accessory', name: `${getColorName(combo.acc.color)} ${combo.acc.subCategory.replace('_', ' ')}`, color: combo.acc.color, imageUrl: combo.acc.imageUrl, _id: combo.acc._id });

                return {
                    id: `gen-fallback-${Date.now()}-${index}`,
                    title: `${occasion} Style ${index + 1}`,
                    match: Math.min(100, 60 + combo.score), 
                    tags: [occasion, archetypes[0] || 'Modern'],
                    explanation: explanation,
                    items: outfitItemsDocs
                };
            });
        }

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
