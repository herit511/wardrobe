const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["top", "bottom", "footwear", "outerwear"],
        trim: true
    },
    subCategory: {
        type: String,
        required: true,
        enum: [
            "shirt",
            "tshirt",
            "vest",
            "jeans",
            "trousers",
            "cargo",
            "shorts",
            "sneakers",
            "formal_shoes",
            "boots",
            "slides",
            "coat",
            "blazer",
            "hoodie",
            "jacket",
            "sweater"
        ],
        trim: true
    },
    fit: {
        type: String,
        enum: ["slim", "regular", "relaxed", "oversized", "boxy"],
        trim: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    pattern: {
        type: String,
        enum: ["solid", "striped", "checked", "graphic", "printed"],
        trim: true
    },
    occasion: {
        type: [{
            type: String,
            enum: ["casual", "party", "office", "streetwear", "gym", "ethnic"]
        }],
        required: true,
    },
    season: {
        type: [{
            type: String,
            enum: ["summer", "monsoon", "winter", "all_season"]
        }],        
        required: true,
    },
    condition: {
        type: String,
        required: true,
        enum: ["new", "good", "worn"],
        trim: true
    },
    userPreferenceScore: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        required: true,
    }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);