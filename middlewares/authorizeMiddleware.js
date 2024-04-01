// authorizeMiddleware.js
const authorize = (req, res, next) => {
    // Check if user is authorized (Example: based on role or permissions)
    if (req.user && req.user.role === 'admin') {
        next(); // User is authorized (admin), continue to next middleware/route handler
    } else {
        res.status(403).json({ message: 'Unauthorized' }); // User is not authorized, send forbidden error
    }
};

module.exports = authorize;
