const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    }],
    occasion: {
        type: String,
        required: true,
        trim: true
    },
    // AI Styling Metadata
    personality: {
        vibe: String,
        description: String
    },
    signatureMove: String,
    feelLine: String,
    colorStory: {
        story: String,
        emotion: String
    },
    microStyling: [{
        item: String,
        tip: String
    }],
    finishingMove: {
        primary: String,
        secondary: String
    },
    wowReason: String,
    // Generation Context
    generationContext: {
        weather: String,
        occasion: String,
        selectedVibe: String,
        relaxedMatch: { type: Boolean, default: false },
        confidence: Number
    },
    wornHistory: [{
        date: { type: Date, default: Date.now },
        notes: String
    }],
    isFavorite: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Outfit", outfitSchema);
