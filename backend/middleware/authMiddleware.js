const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Check if the header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token is not valid (Bearer format expected)' });
    }
    const token = authHeader.substring(7, authHeader.length); // Extract token part

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user payload (e.g., { userId: '...', role: '...' }) to request object
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
