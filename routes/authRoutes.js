const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Item = require('../models/items');
const Outfit = require('../models/Outfit');
const auth = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validation');

let otpMailer = null;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildOtpEmailContent(otpCode) {
    const safeOtp = escapeHtml(otpCode);
    return {
        subject: 'Wardrobe AI password reset code',
        text: `Your Wardrobe AI OTP is ${otpCode}. It expires in 10 minutes. If you did not request this, ignore this email.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1B2A4A;max-width:560px;margin:0 auto;">
                <h2 style="margin-bottom:8px;">Password Reset Code</h2>
                <p style="margin-top:0;">Use this one-time code to reset your Wardrobe AI password:</p>
                <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:14px 18px;background:#FFF5EC;border:1px solid #E8DDD0;border-radius:10px;display:inline-block;">
                    ${safeOtp}
                </div>
                <p style="margin-top:14px;">This code expires in <strong>10 minutes</strong>.</p>
                <p style="margin-top:14px;color:#6B7B8D;">If you did not request this, you can safely ignore this email.</p>
            </div>
        `,
    };
}

function getOtpMailer() {
    if (otpMailer) return otpMailer;

    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        SMTP_SECURE,
        SMTP_SERVICE,
    } = process.env;

    // SMTP_USER and SMTP_PASS are only needed for the SMTP fallback path.
    if (!SMTP_USER || !SMTP_PASS) {
        return null;
    }

    const baseConfig = SMTP_SERVICE
        ? { service: SMTP_SERVICE }
        : {
            host: SMTP_HOST || 'smtp.gmail.com',
            port: Number(SMTP_PORT || 587),
            secure: String(SMTP_SECURE || 'false').toLowerCase() === 'true',
        };

    otpMailer = nodemailer.createTransport({
        ...baseConfig,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    return otpMailer;
}

async function sendOtpEmail(toEmail, otpCode) {
    const mailContent = buildOtpEmailContent(otpCode);

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL;

    if (resendApiKey && resendFrom) {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: resendFrom,
                to: [toEmail],
                subject: mailContent.subject,
                text: mailContent.text,
                html: mailContent.html,
            }),
        });

        if (response.ok) {
            return;
        }

        const errorBody = await response.text();
        throw new Error(`Resend failed (${response.status}): ${errorBody}`);
    }

    const transporter = getOtpMailer();
    if (!transporter) {
        throw new Error('OTP email provider is not configured. Set RESEND_API_KEY + RESEND_FROM for production, or SMTP_USER + SMTP_PASS for SMTP fallback.');
    }

    const fromEmail = process.env.SMTP_FROM || `Wardrobe AI <${process.env.SMTP_USER}>`;

    const mail = {
        from: fromEmail,
        to: toEmail,
        subject: mailContent.subject,
        text: mailContent.text,
        html: mailContent.html,
    };

    await transporter.sendMail(mail);
}

// ============================================
// POST /api/auth/forgot-password
// ============================================
router.post('/forgot-password', async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        // Always return generic message to avoid account enumeration.
        if (!user) {
            return res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Hash OTP and set to resetPasswordToken field
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        try {
            await sendOtpEmail(user.email, otp);
        } catch (mailErr) {
            // Roll back token if email delivery fails, so stale codes are not left behind.
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            const authFailure = String(mailErr.message || '').toLowerCase().includes('invalid login')
                || String(mailErr.message || '').toLowerCase().includes('badcredentials')
                || String(mailErr.code || '').toLowerCase().includes('eauth');

            if (authFailure) {
                return res.status(503).json({
                    success: false,
                    message: 'Email service login failed. Update SMTP_USER and SMTP_PASS. For Gmail, use a 16-character App Password (not your normal Gmail password).'
                });
            }

            return res.status(503).json({
                success: false,
                message: 'OTP email could not be sent. Check SMTP settings and try again.'
            });
        }

        res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/auth/reset-password
// ============================================
router.put('/reset-password', async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const otp = String(req.body.otp || '').trim();
        const newPassword = String(req.body.newPassword || '');

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
        }

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
