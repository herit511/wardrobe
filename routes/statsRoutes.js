const express = require('express');
const router = express.Router();
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const auth = require('../middleware/auth');

const TREND_FEEDS = [
    { source: 'Vogue', url: 'https://www.vogue.com/feed/rss' },
    { source: 'GQ', url: 'https://www.gq.com/feed/rss' },
    { source: 'Who What Wear', url: 'https://www.whowhatwear.com/rss.xml' }
];

function stripHtml(value = '') {
    return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeEntities(value = '') {
    return String(value)
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function extractTag(block, tag) {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (!match) return '';
    return decodeEntities(stripHtml(match[1].replace(/<!\[CDATA\[|\]\]>/g, '')));
}

function parseRssItems(xml = '', source = 'Unknown') {
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    return itemMatches.slice(0, 8).map((item) => {
        const title = extractTag(item, 'title');
        const description = extractTag(item, 'description');
        const link = extractTag(item, 'link');
        const pubDate = extractTag(item, 'pubDate');
        return {
            title,
            description,
            link,
            source,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
        };
    }).filter((entry) => entry.title);
}

function generateTrendInsight(title = '', description = '') {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('tailor') || text.includes('structured') || text.includes('blazer')) {
        return 'Add one structured piece to elevate everyday combinations.';
    }
    if (text.includes('neutral') || text.includes('beige') || text.includes('monochrome')) {
        return 'Neutral layering is rising; build depth using texture contrast.';
    }
    if (text.includes('denim') || text.includes('jeans')) {
        return 'Denim remains strong; pair with refined footwear for balance.';
    }
    if (text.includes('color') || text.includes('bold') || text.includes('statement')) {
        return 'Use one statement color with grounded basics for controlled impact.';
    }
    return 'Track this movement and test it with one adaptable piece first.';
}

function getFallbackTrendTips() {
    return [
        {
            title: 'Monochrome Layering Momentum',
            source: 'Wardrobe AI',
            link: '',
            publishedAt: new Date().toISOString(),
            insight: 'Build tonal outfits using one color family and varied textures.',
        },
        {
            title: 'Relaxed Tailoring Continues',
            source: 'Wardrobe AI',
            link: '',
            publishedAt: new Date().toISOString(),
            insight: 'Combine loose tailoring with minimal accessories for modern polish.',
        },
        {
            title: 'Quiet Luxury Neutrals Persist',
            source: 'Wardrobe AI',
            link: '',
            publishedAt: new Date().toISOString(),
            insight: 'Focus on fit quality and subtle color harmony over loud branding.',
        },
    ];
}

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
        
        // Fetch all outfits that have been worn to calculate sum
        const allWornOutfits = await Outfit.find({ userId, "wornHistory.0": { $exists: true } }).populate('items').sort('-createdAt');

        for (const outfit of allWornOutfits) {
            if (outfit.wornHistory && outfit.wornHistory.length > 0) {
                totalTimesWorn += outfit.wornHistory.length; 
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

// ============================================
// GET /api/stats/trend-tips — Live fashion trend tips
// ============================================
router.get('/trend-tips', auth, async (req, res, next) => {
    try {
        const feedResponses = await Promise.allSettled(
            TREND_FEEDS.map(async (feed) => {
                const response = await fetch(feed.url, {
                    headers: {
                        'User-Agent': 'WardrobeAI/1.0',
                        'Accept': 'application/rss+xml, application/xml, text/xml'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed feed: ${feed.source}`);
                }

                const xml = await response.text();
                return parseRssItems(xml, feed.source);
            })
        );

        const merged = feedResponses
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => result.value);

        const filtered = merged
            .filter((item) => {
                const text = `${item.title} ${item.description}`.toLowerCase();
                return /(trend|style|fashion|wardrobe|outfit|runway|tailor|color|denim)/.test(text);
            })
            .map((item) => ({
                title: item.title,
                source: item.source,
                link: item.link,
                publishedAt: item.publishedAt,
                insight: generateTrendInsight(item.title, item.description),
            }))
            .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
            .slice(0, 6);

        const data = filtered.length > 0 ? filtered : getFallbackTrendTips();

        res.json({
            success: true,
            updatedAt: new Date().toISOString(),
            data,
        });
    } catch (error) {
        const fallback = getFallbackTrendTips();
        res.json({
            success: true,
            updatedAt: new Date().toISOString(),
            data: fallback,
        });
    }
});

module.exports = router;
