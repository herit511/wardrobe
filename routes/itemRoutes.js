const express = require("express");
const router = express.Router();

const Item = require("../models/items");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require("multer");

const tempUpload = multer({ dest: path.join(os.tmpdir(), "uploads") });

const CLOTHING_NAME_MAP = {
  't-shirt': ['top', 'tshirt'],
  'graphic tee': ['top', 'tshirt'],
  'polo shirt': ['top', 'polo'],
  'shirt': ['top', 'shirt'],
  'dress shirt': ['top', 'shirt'],
  'blouse': ['top', 'shirt'],
  'tank top': ['top', 'vest'],
  'crop top': ['top', 'vest'],
  'sweater': ['outerwear', 'sweater'],
  'turtleneck': ['outerwear', 'sweater'],
  'hoodie': ['outerwear', 'hoodie'],
  'sweatshirt': ['outerwear', 'hoodie'],
  'jeans': ['bottom', 'jeans'],
  'slim jeans': ['bottom', 'jeans'],
  'straight jeans': ['bottom', 'jeans'],
  'wide leg jeans': ['bottom', 'jeans'],
  'chinos': ['bottom', 'trousers'],
  'trousers': ['bottom', 'trousers'],
  'shorts': ['bottom', 'shorts'],
  'cargo pants': ['bottom', 'cargo'],
  'joggers': ['bottom', 'joggers'],
  'sweatpants': ['bottom', 'joggers'],
  'jacket': ['outerwear', 'jacket'],
  'blazer': ['outerwear', 'blazer'],
  'suit jacket': ['outerwear', 'blazer'],
  'denim jacket': ['outerwear', 'jacket'],
  'leather jacket': ['outerwear', 'jacket'],
  'bomber jacket': ['outerwear', 'jacket'],
  'trench coat': ['outerwear', 'coat'],
  'overcoat': ['outerwear', 'coat'],
  'parka': ['outerwear', 'coat'],
  'cardigan': ['outerwear', 'sweater'],
  'vest': ['top', 'vest'],
  'ring': ['accessories', 'ring'],
  'chain': ['accessories', 'chain'],
  'watch': ['accessories', 'watch'],
  'belt': ['accessories', 'belt'],
  'cap': ['accessories', 'cap'],
  'sneakers': ['footwear', 'sneakers'],
  'white sneakers': ['footwear', 'sneakers'],
  'chunky sneakers': ['footwear', 'sneakers'],
  'loafers': ['footwear', 'formal_shoes'],
  'oxford shoes': ['footwear', 'formal_shoes'],
  'derby shoes': ['footwear', 'formal_shoes'],
  'chelsea boots': ['footwear', 'boots'],
  'ankle boots': ['footwear', 'boots'],
  'boots': ['footwear', 'boots'],
  'sandals': ['footwear', 'slides'],
  'slides': ['footwear', 'slides'],
  'heels': ['footwear', 'formal_shoes'],
  'block heels': ['footwear', 'formal_shoes'],
  'mules': ['footwear', 'slides'],
  'flip flops': ['footwear', 'slides'],
};

const COLOR_NAME_MAP = {
  'white': '#FFFFFF',
  'black': '#000000',
  'gray': '#808080',
  'light gray': '#D3D3D3',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'off-white': '#FAF9F6',
  'camel': '#C19A6B',
  'tan': '#D2B48C',
  'taupe': '#483C32',
  'charcoal': '#36454F',
  'brown': '#8B4513',
  'dark brown': '#654321',
  'navy': '#1B2A4A',
  'blue': '#0000FF',
  'light blue': '#ADD8E6',
  'royal blue': '#4169E1',
  'sky blue': '#87CEEB',
  'cobalt': '#0047AB',
  'denim': '#1560BD',
  'green': '#008000',
  'olive': '#808000',
  'khaki': '#F0E68C',
  'forest green': '#228B22',
  'sage': '#BCB88A',
  'mint': '#98FF98',
  'emerald': '#50C878',
  'red': '#FF0000',
  'dark red': '#8B0000',
  'crimson': '#DC143C',
  'maroon': '#800000',
  'burgundy': '#800020',
  'wine': '#722F37',
  'pink': '#FFC0CB',
  'hot pink': '#FF69B4',
  'blush': '#DE5D83',
  'mauve': '#E0B0FF',
  'rose': '#FF007F',
  'yellow': '#FFFF00',
  'mustard': '#FFDB58',
  'gold': '#FFD700',
  'orange': '#FFA500',
  'coral': '#FF7F50',
  'peach': '#FFCBA4',
  'rust': '#B7410E',
  'terracotta': '#E2725B',
  'purple': '#800080',
  'lavender': '#E6E6FA',
  'violet': '#8F00FF',
  'plum': '#DDA0DD',
  'lilac': '#C8A2C8',
};

const PATTERN_MAP = {
  'solid': 'solid',
  'striped': 'striped',
  'thin stripe': 'striped',
  'wide stripe': 'striped',
  'checkered': 'checked',
  'plaid': 'checked',
  'tartan': 'checked',
  'floral': 'printed',
  'small floral': 'printed',
  'graphic': 'graphic',
  'camo': 'printed',
  'animal': 'printed',
  'paisley': 'printed',
  'houndstooth': 'checked',
  'herringbone': 'checked',
  'pinstripe': 'striped',
  'polka': 'printed',
  'tie_dye': 'printed',
  'geometric': 'graphic',
  'abstract': 'graphic',
};

const OCCASION_VALUES = ['casual', 'office', 'business formal', 'party', 'date night', 'gym', 'wedding guest', 'ethnic', 'pooja / puja', 'festival'];
const WEATHER_VALUES = ['hot', 'mild', 'cold'];

const AI_ANALYSIS_PROMPT = `You are a fashion and clothing analysis expert. Analyze this clothing image and return ONLY a valid JSON object (no markdown, no backticks, no extra text). Do not guess.

Identify:
- "name": The specific item type. Must be one of: t-shirt, graphic tee, polo shirt, shirt, dress shirt, blouse, tank top, crop top, sweater, turtleneck, hoodie, sweatshirt, jeans, slim jeans, straight jeans, wide leg jeans, chinos, trousers, shorts, cargo pants, joggers, sweatpants, skirt, leggings, jacket, blazer, suit jacket, denim jacket, leather jacket, bomber jacket, trench coat, overcoat, parka, cardigan, vest, ring, chain, watch, belt, cap, sneakers, white sneakers, chunky sneakers, loafers, oxford shoes, derby shoes, chelsea boots, ankle boots, boots, sandals, slides, heels, flip flops, kurta, sherwani, nehru jacket, churidar, dhoti, mojari
- "color": The dominant color. Must be one of: white, black, gray, light gray, beige, cream, ivory, off-white, camel, tan, taupe, charcoal, brown, dark brown, navy, blue, light blue, royal blue, sky blue, cobalt, denim, green, olive, khaki, forest green, sage, mint, emerald, red, dark red, crimson, maroon, burgundy, wine, pink, hot pink, blush, mauve, rose, yellow, mustard, gold, orange, coral, peach, rust, terracotta, purple, lavender, violet, plum, lilac
- "pattern": Must be one of: solid, striped, thin stripe, wide stripe, checkered, plaid, tartan, floral, small floral, graphic, camo, animal, paisley, houndstooth, herringbone, pinstripe, polka, tie_dye, geometric, abstract
- "fit": Must be one of: slim, regular, relaxed, oversized, boxy
- "occasion": Array of suitable occasions. Pick from: casual, office, business formal, party, date night, gym, wedding guest, ethnic, pooja / puja, festival
- "weather": Array of suitable weather. Pick from: hot, mild, cold

Return ONLY the JSON object.`;

function cleanupUploadedFile(filePath) {
  if (filePath) {
    try { fs.unlinkSync(filePath); } catch (error) {}
  }
}

function mapAnalysisToItemData(analysis) {
  const name = String(analysis?.name || '').toLowerCase();
  const color = String(analysis?.color || '').toLowerCase();
  const pattern = String(analysis?.pattern || '').toLowerCase();
  const matchedName = CLOTHING_NAME_MAP[name] || ['top', 'tshirt'];

  const occasions = (Array.isArray(analysis?.occasion) ? analysis.occasion : [analysis?.occasion].filter(Boolean))
    .map((value) => String(value).toLowerCase())
    .filter((value) => OCCASION_VALUES.includes(value));

  const weather = (Array.isArray(analysis?.weather) ? analysis.weather : [analysis?.weather].filter(Boolean))
    .map((value) => String(value).toLowerCase())
    .filter((value) => WEATHER_VALUES.includes(value));

  return {
    category: matchedName[0],
    subCategory: matchedName[1],
    fit: ['slim', 'regular', 'relaxed', 'oversized', 'boxy'].includes(String(analysis?.fit || '').toLowerCase()) ? String(analysis.fit).toLowerCase() : undefined,
    color: COLOR_NAME_MAP[color] || String(analysis?.color || '').trim() || '#000000',
    pattern: PATTERN_MAP[pattern] || 'solid',
    occasion: occasions.length ? occasions : ['casual'],
    weather: weather.length ? weather : ['mild'],
    condition: 'good',
  };
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function analyzeClothingImage(filePath, mimeType = 'image/jpeg') {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new Error('Kimi API key not configured. Add KIMI_API_KEY to your .env file.');
  }

  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString('base64');

  const kimiResponse = await axios.post(
    'https://integrate.api.nvidia.com/v1/chat/completions',
    {
      model: 'meta/llama-3.2-90b-vision-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            },
            {
              type: 'text',
              text: AI_ANALYSIS_PROMPT
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 400
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 45000
    }
  );

  const content = kimiResponse.data?.choices?.[0]?.message?.content || '';
  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

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

    let insights;
    const content = await analyzeClothingImage(req.file.path, req.file.mimetype || 'image/jpeg');

    try {
      insights = content;
    } catch (parseErr) {
      console.error("[Kimi K2.5] Failed to parse JSON:", parseErr.message);
      return res.status(500).json({ success: false, message: "AI returned invalid format. Please try again." });
    }

    res.json({ success: true, data: insights });

  } catch (error) {
    console.error("Kimi K2.5 Analysis Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(503).json({ success: false, message: "Invalid Kimi API key. Check KIMI_API_KEY in your .env file." });
    }

    res.status(500).json({ success: false, message: `AI Analysis Failed: ${error.message}` });
  } finally {
    // Always cleanup temp file
    cleanupUploadedFile(req.file && req.file.path);
  }
});

// ============================================
// POST /api/items/bulk-preview — Analyze many items without saving
// ============================================
router.post("/bulk-preview", auth, tempUpload.array("images", 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload at least one image." });
    }

    const drafts = [];

    for (let index = 0; index < req.files.length; index += 1) {
      const file = req.files[index];
      try {
        const analysis = await analyzeClothingImage(file.path, file.mimetype || 'image/jpeg');
        const mapped = mapAnalysisToItemData(analysis);

        drafts.push({
          clientId: `${Date.now()}-${index}`,
          fileName: file.originalname,
          imageUrl: file.path,
          ...mapped,
        });
      } finally {
        cleanupUploadedFile(file.path);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Analyzed ${drafts.length} item${drafts.length === 1 ? '' : 's'}.`,
      data: drafts,
      summary: {
        total: req.files.length,
        analyzed: drafts.length,
      },
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => cleanupUploadedFile(file.path));
    }
    next(error);
  }
});

// ============================================
// POST /api/items/bulk-save — Save reviewed items after preview
// ============================================
router.post("/bulk-save", auth, upload.array("images", 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload at least one image." });
    }

    const drafts = parseJsonArray(req.body.items);

    if (!drafts.length) {
      return res.status(400).json({ success: false, message: "No reviewed items were provided." });
    }

    if (drafts.length !== req.files.length) {
      return res.status(400).json({ success: false, message: "The number of reviewed items must match the uploaded images." });
    }

    const createdItems = [];

    for (let index = 0; index < req.files.length; index += 1) {
      const file = req.files[index];
      const draft = drafts[index] || {};

      try {
        const newItem = new Item({
          userId: req.user.id,
          category: draft.category,
          subCategory: draft.subCategory,
          fit: draft.fit,
          color: draft.color,
          pattern: draft.pattern,
          occasion: Array.isArray(draft.occasion) && draft.occasion.length ? draft.occasion : ['casual'],
          weather: Array.isArray(draft.weather) && draft.weather.length ? draft.weather : ['mild'],
          condition: draft.condition || 'good',
          imageUrl: file.path || file.secure_url || file.url,
        });

        await newItem.save();
        createdItems.push(newItem);
      } finally {
        cleanupUploadedFile(file.path);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Saved ${createdItems.length} item${createdItems.length === 1 ? '' : 's'} to your closet.`,
      data: createdItems,
      summary: {
        total: req.files.length,
        saved: createdItems.length,
      },
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => cleanupUploadedFile(file.path));
    }
    next(error);
  }
});

// Backwards-compatible legacy bulk route kept for existing clients.
router.post("/bulk", auth, tempUpload.array("images", 20), async (req, res, next) => {
  try {
    const previewResponse = await Promise.all(
      (req.files || []).map(async (file, index) => {
        try {
          const analysis = await analyzeClothingImage(file.path, file.mimetype || 'image/jpeg');
          return {
            clientId: `${Date.now()}-${index}`,
            fileName: file.originalname,
            imageUrl: file.path,
            ...mapAnalysisToItemData(analysis),
          };
        } finally {
          cleanupUploadedFile(file.path);
        }
      })
    );

    return res.status(200).json({
      success: true,
      message: `Analyzed ${previewResponse.length} item${previewResponse.length === 1 ? '' : 's'}.`,
      data: previewResponse,
      summary: { total: previewResponse.length, analyzed: previewResponse.length },
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => cleanupUploadedFile(file.path));
    }
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