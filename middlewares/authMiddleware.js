// authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Extract JWT token from request headers or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' }); // No token provided, send unauthorized error
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user information to request object
        next(); // User is authenticated, continue to next middleware/route handler
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Unauthorized' }); // Invalid token, send unauthorized error
    }
};

module.exports = authenticate;
