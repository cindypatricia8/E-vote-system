const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 
/**
 * Protects routes by verifying the JWT.
 * If the token is valid attaches the user document to the request object.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token from the header 
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by the ID 
            req.user = await User.findById(decoded.id).select('-passwordHash');
            
            if (!req.user) {
                return res.status(401).json({ message: 'User not found.' });
            }
            next();

        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    // If there's no token at all
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

/**
 * Restrict to roles for security
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.roles[0])) { 
            return res.status(403).json({ message: 'You do not have permission to perform this action.' });
        }
        next();
    };
};


module.exports = { protect, restrictTo };