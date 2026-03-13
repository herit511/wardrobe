const express = require("express");
const router = express.Router();

const Item = require("../models/items");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");
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