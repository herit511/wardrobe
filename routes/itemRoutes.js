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
      category, subCategory, color, occasion, season, condition,
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
    if (season) filter.season = season;
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

    const prompt = `
      You are an expert fashion stylist AI. Look at the attached clothing image.
      Analyze the image and return a JSON object with the following exact keys, choosing values strictly from the arrays provided below.
      Return ONLY valid JSON. Do not return markdown, backticks, or other text.
      
      Valid constraints:
      "category": ["top", "bottom", "footwear", "outerwear", "accessories"]
      "subCategory": ["shirt", "tshirt", "vest", "jeans", "trousers", "cargo", "shorts", "sneakers", "formal_shoes", "boots", "slides", "sport", "coat", "blazer", "hoodie", "jacket", "sweater", "ring", "chain", "watch", "belt", "cap"]
      "fit": ["slim", "regular", "relaxed", "oversized", "boxy"]
      "pattern": ["solid", "striped", "checked", "graphic", "printed"]
      "season": ["summer", "monsoon", "winter", "all_season"]
      "color": Provide the closest hex code (e.g. #000000) based on the primary color.
      
      Expected JSON format:
      {
        "category": "top",
        "subCategory": "tshirt",
        "color": "#ff0000",
        "pattern": "solid",
        "fit": "regular",
        "season": ["summer", "all_season"]
      }
      
      CRITICAL: For the "color" field, you MUST return a valid 6-character hex code starting with #. Do NOT return color names like "red", "black", or "navy". Only return the hex code. For "season", return an array containing one or more valid constraints based on the weather the item is suited for.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean any potential markdown string wrappers from Gemini
    let cleanedText = responseText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const insights = JSON.parse(cleanedText);

    // Ultimate fallback for color just in case Gemini disobeys the prompt and sends a word
    if (insights.color && !insights.color.startsWith('#')) {
      // rough fallback map
      const colorMap = {
        'black': '#000000', 'white': '#ffffff', 'red': '#ff0000', 'blue': '#0000ff', 'green': '#008000',
        'yellow': '#ffff00', 'navy': '#000080', 'grey': '#808080', 'gray': '#808080', 'brown': '#a52a2a',
        'pink': '#ffc0cb', 'purple': '#800080', 'orange': '#ffa500'
      };
      insights.color = colorMap[insights.color.toLowerCase()] || '#000000';
    }

    res.json({ success: true, data: insights });

    // Cleanup local temp file
    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    res.status(500).json({ success: false, message: "AI Analysis Failed." });
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
      pattern, occasion, season, condition,
    } = req.body;

    // Ensure occasion and season are arrays
    const occasionArr = Array.isArray(occasion) ? occasion : [occasion];
    const seasonArr = Array.isArray(season) ? season : [season];

    const newItem = new Item({
      userId: req.user.id,
      category,
      subCategory,
      fit,
      color,
      pattern,
      occasion: occasionArr,
      season: seasonArr,
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
      "occasion", "season", "condition", "userPreferenceScore",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Ensure occasion and season are stored as arrays
        if (field === "occasion" || field === "season") {
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