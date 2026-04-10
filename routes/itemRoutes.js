const express = require("express");
const router = express.Router();

const Item = require("../models/items");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");
const axios = require("axios");
const fs = require("fs");
const multer = require("multer");
const FormData = require("form-data");

const tempUpload = multer({ dest: "uploads/" });

// Local ML service URL (replaces Google Gemini)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const {
  validate,
  createItemRules,
  updateItemRules,
  idParamRule,
  listQueryRules,
} = require("../middleware/validation");

// Note: Gemini removed — using local ML service at ML_SERVICE_URL

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
// POST /api/items/analyze — Analyze image with local ML service
// ============================================
router.post("/analyze", auth, tempUpload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided for analysis." });
    }

    // Build multipart form to send to the local ML service
    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path), {
      filename: req.file.originalname || "upload.jpg",
      contentType: req.file.mimetype,
    });

    // Call local ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000, // 30 second timeout
    });

    const insights = mlResponse.data;
    console.log(`\n[ML Service Analyze] Response:`, JSON.stringify(insights, null, 2));
    res.json({ success: true, data: insights });

    // Cleanup local temp file
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error("ML Service Analysis Error:", error.message);
    if (req.file && req.file.path) { try { fs.unlinkSync(req.file.path); } catch(e) {} }

    // If ML service is down, return a helpful message
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "AI Analysis service is not running. Start it with: cd ml_service && python -m uvicorn main:app --port 8000"
      });
    }

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