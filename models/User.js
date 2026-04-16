const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    styleDna: {
        gender: { type: String, enum: ['Man', 'Woman', 'Other'], default: 'Woman' },
        archetypes: [String],
        preferredColors: [String],
        preferredFit: String,
        brands: [String],
        undertone: { type: String, default: '' },
        skinDepth: { type: String, default: '' },
        bodyType: { type: String, default: '' },
        archetype: { type: String, default: '' }
    },
    preferences: {
        dailySuggestion: { type: Boolean, default: true },
        weeklyTips: { type: Boolean, default: true },
        trendAlerts: { type: Boolean, default: false }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
