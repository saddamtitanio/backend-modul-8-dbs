// TODO: Implement JWT authentication middleware
// 1. Extract token from Authorization header (Bearer TOKEN)
// 2. Verify token using JWT_SECRET
// 3. Attach user info to req.user
// 4. Apply this middleware to routes that require authentication (user update, transaction, item create/update)

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Access token is required', 401));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid or expired token', 401));
    }
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  });
};

module.exports = { authenticateToken };
