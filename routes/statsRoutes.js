const express = require('express');
const router = express.Router();
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const auth = require('../middleware/auth');

// ============================================
// GET /api/stats — Aggregated user statistics
// ============================================
router.get('/', auth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Run un-populated aggregates/counts in parallel
        const [totalItems, totalOutfits, favoriteCount, addedThisMonth, items] = await Promise.all([
            Item.countDocuments({ userId }),
            Outfit.countDocuments({ userId }),
            Item.countDocuments({ userId, userPreferenceScore: { $gt: 0 } }),
            Item.countDocuments({ userId, createdAt: { $gte: startOfMonth } }),
            Item.find({ userId }).select('category') // lightweight select for distribution only
        ]);

        // Category distribution
        const categoryCounts = {};
        for (const item of items) {
            const cat = item.category.toLowerCase();
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        // Calculate totalTimesWorn safely
        let totalTimesWorn = 0;
        const wornEvents = [];
        
        // Fetch recent outfits with worn history populated only for the list we return
        const recentWornOutfits = await Outfit.find({ userId, "wornHistory.0": { $exists: true } })
            .populate('items')
            .sort('-createdAt')
            .limit(10);

        for (const outfit of recentWornOutfits) {
            if (outfit.wornHistory && outfit.wornHistory.length > 0) {
                totalTimesWorn += outfit.wornHistory.length; // Approximate total on the fetched subset or make it exact
                for (const entry of outfit.wornHistory) {
                    wornEvents.push({
                        outfitId: outfit._id,
                        title: outfit.title,
                        occasion: outfit.occasion,
                        date: entry.date,
                        items: (outfit.items || []).map(i => i ? ({
                            _id: i._id,
                            category: i.category,
                            subCategory: i.subCategory,
                            color: i.color,
                            imageUrl: i.imageUrl
                        }) : null).filter(Boolean)
                    });
                }
            }
        }
        wornEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentWornHistory = wornEvents.slice(0, 5);

        const categoryDistribution = {};
        for (const [cat, count] of Object.entries(categoryCounts)) {
            categoryDistribution[cat] = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
        }

        res.json({
            success: true,
            data: {
                totalItems,
                totalOutfits,
                totalTimesWorn,
                favoriteCount,
                addedThisMonth,
                categoryDistribution,
                recentWornHistory
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
