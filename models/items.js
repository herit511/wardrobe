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
        enum: ["top", "bottom", "footwear", "outerwear", "accessories"],
        trim: true
    },
    subCategory: {
        type: String,
        required: true,
        enum: [
            "shirt",
            "tshirt",
            "vest",
            "polo",
            "jeans",
            "trousers",
            "cargo",
            "shorts",
            "sneakers",
            "formal_shoes",
            "boots",
            "slides",
            "sport",
            "coat",
            "blazer",
            "hoodie",
            "jacket",
            "sweater",
            "ring",
            "chain",
            "watch",
            "belt",
            "cap"
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
            enum: ["casual", "office", "party", "date night", "gym", "ethnic", "business formal", "wedding guest", "pooja / puja", "festival"]
        }],
        required: true,
    },
    weather: {
        type: [{
            type: String,
            enum: ["hot", "mild", "cold"]
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
    lastWorn: {
        type: Date,
        default: null
    },
    wearCount: {
        type: Number,
        default: 0
    },
    isLaundry: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        required: true,
    }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);