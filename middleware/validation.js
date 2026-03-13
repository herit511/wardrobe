const { body, param, query, validationResult } = require("express-validator");

// Middleware to check validation results and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Valid enum values (matching the Item schema)
const CATEGORIES = ["top", "bottom", "footwear", "outerwear"];
const SUB_CATEGORIES = [
  "shirt", "tshirt", "vest",
  "jeans", "trousers", "cargo", "shorts",
  "sneakers", "formal_shoes", "boots", "slides",
  "coat", "blazer", "hoodie", "jacket", "sweater",
];
const FITS = ["slim", "regular", "relaxed", "oversized", "boxy"];
const PATTERNS = ["solid", "striped", "checked", "graphic", "printed"];
const OCCASIONS = ["casual", "party", "office", "streetwear", "gym", "ethnic"];
const SEASONS = ["summer", "monsoon", "winter", "all_season"];
const CONDITIONS = ["new", "good", "worn"];

// Validation rules for creating an item
const createItemRules = [
  body("category")
    .trim()
    .notEmpty().withMessage("Category is required")
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  body("subCategory")
    .trim()
    .notEmpty().withMessage("Sub-category is required")
    .isIn(SUB_CATEGORIES).withMessage(`Sub-category must be one of: ${SUB_CATEGORIES.join(", ")}`),

  body("fit")
    .optional()
    .trim()
    .isIn(FITS).withMessage(`Fit must be one of: ${FITS.join(", ")}`),

  body("color")
    .trim()
    .notEmpty().withMessage("Color is required"),

  body("pattern")
    .optional()
    .trim()
    .isIn(PATTERNS).withMessage(`Pattern must be one of: ${PATTERNS.join(", ")}`),

  body("occasion")
    .notEmpty().withMessage("Occasion is required")
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      for (const v of arr) {
        if (!OCCASIONS.includes(v)) {
          throw new Error(`Invalid occasion: ${v}. Must be one of: ${OCCASIONS.join(", ")}`);
        }
      }
      return true;
    }),

  body("season")
    .notEmpty().withMessage("Season is required")
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      for (const v of arr) {
        if (!SEASONS.includes(v)) {
          throw new Error(`Invalid season: ${v}. Must be one of: ${SEASONS.join(", ")}`);
        }
      }
      return true;
    }),

  body("condition")
    .trim()
    .notEmpty().withMessage("Condition is required")
    .isIn(CONDITIONS).withMessage(`Condition must be one of: ${CONDITIONS.join(", ")}`),
];

// Validation rules for updating an item (all fields optional)
const updateItemRules = [
  body("category")
    .optional()
    .trim()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  body("subCategory")
    .optional()
    .trim()
    .isIn(SUB_CATEGORIES).withMessage(`Sub-category must be one of: ${SUB_CATEGORIES.join(", ")}`),

  body("fit")
    .optional()
    .trim()
    .isIn(FITS).withMessage(`Fit must be one of: ${FITS.join(", ")}`),

  body("color")
    .optional()
    .trim()
    .notEmpty().withMessage("Color cannot be empty"),

  body("pattern")
    .optional()
    .trim()
    .isIn(PATTERNS).withMessage(`Pattern must be one of: ${PATTERNS.join(", ")}`),

  body("occasion")
    .optional()
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      for (const v of arr) {
        if (!OCCASIONS.includes(v)) {
          throw new Error(`Invalid occasion: ${v}. Must be one of: ${OCCASIONS.join(", ")}`);
        }
      }
      return true;
    }),

  body("season")
    .optional()
    .custom((value) => {
      const arr = Array.isArray(value) ? value : [value];
      for (const v of arr) {
        if (!SEASONS.includes(v)) {
          throw new Error(`Invalid season: ${v}. Must be one of: ${SEASONS.join(", ")}`);
        }
      }
      return true;
    }),

  body("condition")
    .optional()
    .trim()
    .isIn(CONDITIONS).withMessage(`Condition must be one of: ${CONDITIONS.join(", ")}`),

  body("userPreferenceScore")
    .optional()
    .isNumeric().withMessage("Preference score must be a number"),
];

// Validate MongoDB ObjectId param
const idParamRule = [
  param("id")
    .isMongoId().withMessage("Invalid item ID format"),
];

// Query filter validation for GET all
const listQueryRules = [
  query("category").optional().isIn(CATEGORIES).withMessage(`Invalid category filter`),
  query("subCategory").optional().isIn(SUB_CATEGORIES).withMessage(`Invalid sub-category filter`),
  query("occasion").optional().isIn(OCCASIONS).withMessage(`Invalid occasion filter`),
  query("season").optional().isIn(SEASONS).withMessage(`Invalid season filter`),
  query("condition").optional().isIn(CONDITIONS).withMessage(`Invalid condition filter`),
  query("color").optional().trim(),
  query("sort").optional().isIn(["createdAt", "-createdAt", "userPreferenceScore", "-userPreferenceScore"]).withMessage("Invalid sort field"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

module.exports = {
  validate,
  createItemRules,
  updateItemRules,
  idParamRule,
  listQueryRules,
};
