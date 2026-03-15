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

        // Run all queries in parallel
        const [items, outfits] = await Promise.all([
            Item.find({ userId }),
            Outfit.find({ userId }).populate('items').sort('-createdAt')
        ]);

        // Total counts
        const totalItems = items.length;
        const totalOutfits = outfits.length;

        // Count total times outfits have been worn
        const totalTimesWorn = outfits.reduce((sum, o) => sum + (o.wornHistory ? o.wornHistory.length : 0), 0);

        // Category distribution
        const categoryCounts = {};
        for (const item of items) {
            const cat = item.category.toLowerCase();
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        const categoryDistribution = {};
        for (const [cat, count] of Object.entries(categoryCounts)) {
            categoryDistribution[cat] = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
        }

        // Recent outfit history — last 5 worn events
        const wornEvents = [];
        for (const outfit of outfits) {
            if (outfit.wornHistory && outfit.wornHistory.length > 0) {
                for (const entry of outfit.wornHistory) {
                    wornEvents.push({
                        outfitId: outfit._id,
                        title: outfit.title,
                        occasion: outfit.occasion,
                        date: entry.date,
                        items: outfit.items.map(i => ({
                            _id: i._id,
                            category: i.category,
                            subCategory: i.subCategory,
                            color: i.color,
                            imageUrl: i.imageUrl
                        }))
                    });
                }
            }
        }
        wornEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentWornHistory = wornEvents.slice(0, 5);

        // Favorite items count
        const favoriteCount = items.filter(i => i.userPreferenceScore > 0).length;

        // Items added this month
        const now = new Date();
        const addedThisMonth = items.filter(i => {
            const d = new Date(i.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

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
