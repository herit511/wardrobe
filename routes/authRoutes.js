const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const auth = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validation');

// ============================================
// POST /api/auth/forgot-password
// ============================================
router.post('/forgot-password', async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Hash OTP and set to resetPasswordToken field
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        console.log('\n=============================================');
        console.log('PASSWORD RESET OTP GENERATED');
        console.log(`Your 4-digit code is: ${otp}`);
        console.log('=============================================\n');

        res.status(200).json({ success: true, message: 'OTP sent (Check server console)' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/auth/reset-password
// ============================================
router.put('/reset-password', async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        // Set new password (saved hook will hash it)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// POST /api/auth/register — Create a new user
// ============================================
router.post('/register', registerRules, validate, async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Create JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        );
    } catch (error) {
        next(error);
    }
});

// ============================================
// POST /api/auth/login — Authenticate user & get token
// ============================================
router.post('/login', loginRules, validate, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Create JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        );
    } catch (error) {
        next(error);
    }
});

// ============================================
// GET /api/auth/me — Get logged in user profile
// ============================================
router.get('/me', auth, async (req, res, next) => {
    try {
        // Find user by id from token payload, exclude password
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/auth/profile — Update name and email
// ============================================
router.put('/profile', auth, async (req, res, next) => {
    try {
        const { name, email } = req.body;
        
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) return res.status(400).json({ success: false, message: 'Email already in use' });
            user.email = email;
        }

        if (name) user.name = name;

        await user.save();
        res.json({ success: true, message: 'Profile updated', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/auth/password — Change password
// ============================================
router.put('/password', auth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

        if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/auth/preferences — Update style DNA & preferences
// ============================================
router.put('/preferences', auth, async (req, res, next) => {
    try {
        const { styleDna, preferences } = req.body;
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (styleDna) user.styleDna = { ...user.styleDna, ...styleDna };
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();
        res.json({ success: true, message: 'Preferences updated', data: user });
    } catch (error) {
        next(error);
    }
});

// ============================================
// DELETE /api/auth/account — Delete account and data
// ============================================
router.delete('/account', auth, async (req, res, next) => {
    try {
        // Find user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Delete all user's items and outfits
        await Item.deleteMany({ userId: req.user.id });
        await Outfit.deleteMany({ userId: req.user.id });
        
        // Delete user
        await User.findByIdAndDelete(req.user.id);

        res.json({ success: true, message: 'Account and all data deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
