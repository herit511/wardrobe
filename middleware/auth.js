const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    // Check if no header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        // Use a secret from env, or a fallback for dev
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        
        // Add user payload to request
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

module.exports = auth;
