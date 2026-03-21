const express = require("express");
const router = express.Router();

const Item = require("../models/items");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================
// GET /api/items — List all items with filters
// ============================================
router.get("/", auth, listQueryRules, validate, async (req, res, next) => {
  try {
    const {
      category, subCategory, color, occasion, weather, condition,
      sort = "-createdAt",
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object scoped to user
    const filter = { userId: req.user.id };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (color) filter.color = { $regex: color, $options: "i" };
    if (occasion) filter.occasion = occasion;
    if (weather) filter.weather = weather;
    if (condition) filter.condition = condition;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
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
// POST /api/items/analyze — Analyze image with Gemini AI
// ============================================
router.post("/analyze", auth, tempUpload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided for analysis." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "Gemini API key is missing on the server." });
    }

    // Convert local file to generative part
    const fileToGenerativePart = (path, mimeType) => {
      return {
        inlineData: {
          data: Buffer.from(fs.readFileSync(path)).toString("base64"),
          mimeType
        },
      };
    };

    const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);

    const prompt = `Analyze this clothing item image. Respond ONLY with a valid JSON object — no markdown, no explanation, no backticks. Use this exact structure:
{
  "name": "<closest match from: t-shirt, graphic tee, polo shirt, shirt, dress shirt, blouse, tank top, crop top, sweater, turtleneck, hoodie, sweatshirt, jeans, slim jeans, straight jeans, wide leg jeans, chinos, trousers, shorts, cargo pants, joggers, sweatpants, skirt, mini skirt, midi skirt, maxi skirt, leggings, jacket, blazer, suit jacket, denim jacket, leather jacket, bomber jacket, trench coat, overcoat, parka, cardigan, vest, sneakers, white sneakers, chunky sneakers, loafers, oxford shoes, derby shoes, chelsea boots, ankle boots, boots, sandals, slides, heels, block heels, mules, flip flops>",
  "color": "<closest match from: white, black, gray, light gray, beige, cream, ivory, off-white, camel, tan, taupe, charcoal, brown, dark brown, navy, blue, light blue, royal blue, sky blue, cobalt, denim, green, olive, khaki, forest green, sage, mint, emerald, red, dark red, crimson, maroon, burgundy, wine, pink, hot pink, blush, mauve, rose, yellow, mustard, gold, orange, coral, peach, rust, terracotta, purple, lavender, violet, plum, lilac>",
  "pattern": "<closest match from: solid, striped, thin stripe, wide stripe, checkered, plaid, tartan, floral, small floral, graphic, camo, animal, paisley, houndstooth, herringbone, pinstripe, polka, tie_dye, geometric, abstract>",
  "fit": "<closest match from: slim, regular, relaxed, oversized, boxy>",
  "occasion": ["<choices from: casual, office, party, date night, gym, ethnic>"],
  "weather": ["<choices from: hot, mild, cold>"]
}
Only return the JSON. If you cannot identify the item clearly, make your best guess. Try to provide 1-2 relevant occasions and 1-2 relevant weather types.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean any potential markdown string wrappers from Gemini
    let cleanedText = responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim();

    let insights;
    try {
      insights = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Gemini returned non-JSON response:", cleanedText);
      // Cleanup local temp file
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(422).json({ success: false, message: "Could not read this item — try a clearer photo." });
    }

    console.log(`\n[Gemini Analyze] Clean JSON response:`, JSON.stringify(insights, null, 2));
    res.json({ success: true, data: insights });

    // Cleanup local temp file
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    if (req.file && req.file.path) { try { fs.unlinkSync(req.file.path); } catch(e) {} }
    res.status(500).json({ success: false, message: `AI Analysis Failed: ${error.message}` });
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
// PUT /api/items/:id/favorite — Toggle favorite (lightweight, no multer)
// ============================================
router.put("/:id/favorite", auth, idParamRule, validate, async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.userPreferenceScore = item.userPreferenceScore > 0 ? 0 : 1;
    await item.save();

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
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