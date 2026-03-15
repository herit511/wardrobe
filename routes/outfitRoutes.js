const express = require('express');
const router = express.Router();
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const auth = require('../middleware/auth');
const { getColorName } = require('../utils/colors');

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
        const { occasion = 'Casual' } = req.query;

        // Get user's active wardrobe
        const userItems = await Item.find({ userId: req.user.id });
        
        if (userItems.length < 3) {
             return res.status(400).json({ 
                 success: false, 
                 message: 'Not enough items in your closet to generate outfits. Please add at least 3 items.' 
             });
        }

        // Categorize items
        const tops = userItems.filter(i => i.category.toLowerCase() === 'top' || i.category.toLowerCase() === 'tops');
        const bottoms = userItems.filter(i => i.category.toLowerCase() === 'bottom' || i.category.toLowerCase() === 'bottoms');
        const footwear = userItems.filter(i => i.category.toLowerCase() === 'footwear');

        if (tops.length === 0 || bottoms.length === 0 || footwear.length === 0) {
             return res.status(400).json({ 
                 success: false, 
                 message: 'To generate an outfit, you need at least 1 Top, 1 Bottom, and 1 Footwear in your closet.' 
             });
        }

        // Simple mock generator logic
        const generatedOutfits = [];
        const usedCombos = new Set();
        
        // Try to create up to 3 outfits
        let attempts = 0;
        while (generatedOutfits.length < 3 && attempts < 20) {
            attempts++;
            
            // Pick random items
            const top = tops[Math.floor(Math.random() * tops.length)];
            const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
            const shoe = footwear[Math.floor(Math.random() * footwear.length)];

            const comboId = `${top._id}-${bottom._id}-${shoe._id}`;
            if (usedCombos.has(comboId)) continue;
            
            usedCombos.add(comboId);

            const topColorName = getColorName(top.color);
            const bottomColorName = getColorName(bottom.color);

            generatedOutfits.push({
                id: `gen-${Date.now()}-${generatedOutfits.length}`,
                title: `${occasion} Style ${generatedOutfits.length + 1}`,
                match: Math.floor(Math.random() * 20) + 80, // Random match % 80-100
                tags: [occasion, top.season[0] || 'All Season'],
                explanation: `A stylish ${occasion.toLowerCase()} pairing. The ${topColorName.toLowerCase()} ${top.subCategory.replace('_', ' ')} works perfectly with the ${bottomColorName.toLowerCase()} ${bottom.subCategory.replace('_', ' ')}.`,
                items: [
                    { 
                        type: 'Top', 
                        name: `${topColorName} ${top.subCategory.replace('_', ' ')}`, 
                        color: top.color,
                        imageUrl: top.imageUrl,
                        _id: top._id
                    },
                    { 
                        type: 'Bottom', 
                        name: `${bottomColorName} ${bottom.subCategory.replace('_', ' ')}`, 
                        color: bottom.color,
                        imageUrl: bottom.imageUrl,
                        _id: bottom._id
                    },
                    { 
                        type: 'Shoes', 
                        name: `${getColorName(shoe.color)} ${shoe.subCategory.replace('_', ' ')}`, 
                        color: shoe.color,
                        imageUrl: shoe.imageUrl,
                        _id: shoe._id
                    }
                ]
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

module.exports = router;
