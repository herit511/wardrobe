const express = require("express");
const router = express.Router();

const Item = require("../models/items");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");
const axios = require("axios");
const fs = require("fs");
const multer = require("multer");

const tempUpload = multer({ dest: "uploads/" });


const {
  validate,
  createItemRules,
  updateItemRules,
  idParamRule,
  listQueryRules,
} = require("../middleware/validation");


// ============================================
// GET /api/items — List all items with filters
// ============================================
router.get("/", auth, listQueryRules, validate, async (req, res, next) => {
  try {
    const {
      category, subCategory, color, occasion, weather, condition,
      sort = "-createdAt",
      page,
      limit,
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    // Build filter object scoped to user
    const filter = { userId: req.user.id };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (color) filter.color = { $regex: color, $options: "i" };
    if (occasion) filter.occasion = occasion;
    if (weather) filter.weather = weather;
    if (condition) filter.condition = condition;
    if (req.query.isLaundry !== undefined) {
      if (req.query.isLaundry === 'true') {
        filter.isLaundry = true;
      } else {
        filter.isLaundry = { $ne: true }; // matches false, null, and missing!
      }
    }

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /api/items/:id — Get single item
// ============================================
router.get("/:id", auth, idParamRule, validate, async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// ============================================
// POST /api/items/analyze — Analyze image with Kimi K2.5 Vision
// ============================================
router.post("/analyze", auth, tempUpload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided for analysis." });
    }

    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      if (req.file && req.file.path) try { fs.unlinkSync(req.file.path); } catch(e) {}
      return res.status(503).json({ success: false, message: "Kimi API key not configured. Add KIMI_API_KEY to your .env file." });
    }

    // Read the image and convert to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    // Build the vision request (via NVIDIA NIM)
    const kimiResponse = await axios.post(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        model: "meta/llama-3.2-90b-vision-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}` }
              },
              {
                type: "text",
                text: `You are a fashion and clothing analysis expert. Analyze this clothing image and return ONLY a valid JSON object (no markdown, no backticks, no extra text). Do not guess.

Identify:
- "name": The specific item type. Must be one of: t-shirt, graphic tee, polo shirt, shirt, dress shirt, blouse, tank top, crop top, sweater, turtleneck, hoodie, sweatshirt, jeans, slim jeans, straight jeans, wide leg jeans, chinos, trousers, shorts, cargo pants, joggers, sweatpants, skirt, leggings, jacket, blazer, suit jacket, denim jacket, leather jacket, bomber jacket, trench coat, overcoat, parka, cardigan, vest, sneakers, white sneakers, chunky sneakers, loafers, oxford shoes, derby shoes, chelsea boots, ankle boots, boots, sandals, slides, heels, flip flops, kurta, sherwani, nehru jacket, churidar, dhoti, mojari
- "color": The dominant color. Must be one of: white, black, gray, light gray, beige, cream, ivory, off-white, camel, tan, taupe, charcoal, brown, dark brown, navy, blue, light blue, royal blue, sky blue, cobalt, denim, green, olive, khaki, forest green, sage, mint, emerald, red, dark red, crimson, maroon, burgundy, wine, pink, hot pink, blush, mauve, rose, yellow, mustard, gold, orange, coral, peach, rust, terracotta, purple, lavender, violet, plum, lilac
- "pattern": Must be one of: solid, striped, thin stripe, wide stripe, checkered, plaid, tartan, floral, small floral, graphic, camo, animal, paisley, houndstooth, herringbone, pinstripe, polka, tie_dye, geometric, abstract
- "fit": Must be one of: slim, regular, relaxed, oversized, boxy
- "occasion": Array of suitable occasions. Pick from: casual, office, business formal, party, date night, gym, wedding guest, ethnic, pooja / puja, festival
- "weather": Array of suitable weather. Pick from: hot, mild, cold

Return ONLY the JSON object.`
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 400
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 45000
      }
    );

    // Parse the response
    let insights;
    const content = kimiResponse.data?.choices?.[0]?.message?.content || "";
    console.log(`\n[Kimi K2.5 Analyze] Raw response:`, content);

    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      insights = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[Kimi K2.5] Failed to parse JSON:", parseErr.message);
      return res.status(500).json({ success: false, message: "AI returned invalid format. Please try again." });
    }

    console.log(`[Kimi K2.5 Analyze] Parsed:`, JSON.stringify(insights, null, 2));
    res.json({ success: true, data: insights });

  } catch (error) {
    console.error("Kimi K2.5 Analysis Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(503).json({ success: false, message: "Invalid Kimi API key. Check KIMI_API_KEY in your .env file." });
    }

    res.status(500).json({ success: false, message: `AI Analysis Failed: ${error.message}` });
  } finally {
    // Always cleanup temp file
    if (req.file && req.file.path) { try { fs.unlinkSync(req.file.path); } catch(e) {} }
  }
});

// ============================================
// POST /api/items — Create new item
// ============================================
router.post("/", auth, upload.single("image"), createItemRules, validate, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required. Upload a photo of the clothing item.",
      });
    }

    const imageUrl = req.file.path || req.file.secure_url || req.file.url;

    const {
      category, subCategory, fit, color,
      pattern, occasion, weather, condition,
    } = req.body;

    // Ensure occasion and weather are arrays
    const occasionArr = Array.isArray(occasion) ? occasion : [occasion];
    const weatherArr = Array.isArray(weather) ? weather : [weather];

    const newItem = new Item({
      userId: req.user.id,
      category,
      subCategory,
      fit,
      color,
      pattern,
      occasion: occasionArr,
      weather: weatherArr,
      condition,
      imageUrl,
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Item added to your closet!",
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
});
// ============================================
// PUT /api/items/:id/favorite — Toggle favorite
// ============================================
router.put("/:id/favorite", auth, idParamRule, validate, async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    item.userPreferenceScore = item.userPreferenceScore > 0 ? 0 : 1;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

// ============================================
// PUT /api/items/:id/laundry — Toggle laundry
// ============================================
router.put("/:id/laundry", auth, idParamRule, validate, async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const isExempt = ['footwear', 'accessories'].includes(item.category.toLowerCase());
    if (isExempt) return res.json({ success: true, data: item });

    item.isLaundry = !item.isLaundry;
    if (!item.isLaundry) {
      item.wearCount = 0;
    }
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});


// ============================================
// PUT /api/items/:id — Update item
// ============================================
router.put("/:id", auth, idParamRule, upload.single("image"), updateItemRules, validate, async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Build update object from only provided fields
    const updates = {};
    const allowedFields = [
      "category", "subCategory", "fit", "color", "pattern",
      "occasion", "weather", "condition", "userPreferenceScore",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Ensure occasion and weather are stored as arrays
        if (field === "occasion" || field === "weather") {
          updates[field] = Array.isArray(req.body[field])
            ? req.body[field]
            : [req.body[field]];
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    // If a new image is uploaded, delete the old one from Cloudinary
    if (req.file) {
      // Extract public_id from old Cloudinary URL
      const oldUrl = item.imageUrl;
      if (oldUrl) {
        const publicId = extractPublicId(oldUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
      updates.imageUrl = req.file.path;
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETE /api/items/:id — Delete item
// ============================================
router.delete("/:id", auth, idParamRule, validate, async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Delete image from Cloudinary
    if (item.imageUrl) {
      const publicId = extractPublicId(item.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    res.json({
      success: true,
      message: "Item removed from your closet",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Helper: Extract Cloudinary public_id from URL
// ============================================
function extractPublicId(url) {
  try {
    // Cloudinary URLs look like: https://res.cloudinary.com/.../upload/v123/wardrobe_items/filename.jpg
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    // Remove version prefix (v1234567890/) if present
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
}

module.exports = router;