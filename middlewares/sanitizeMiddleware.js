const sanitize = require('mongo-sanitize');

// Middleware to sanitize request body and query parameters
const sanitizeInput = (req, res, next) => {
    // Sanitize request body
    req.body = sanitize(req.body);

    // Sanitize query parameters
    req.query = sanitize(req.query);

    next();
};

module.exports = { sanitizeInput };
