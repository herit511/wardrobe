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
