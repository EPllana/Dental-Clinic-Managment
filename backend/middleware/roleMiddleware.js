// roleMiddleware.js
// This middleware assumes it runs AFTER authMiddleware, so req.user is populated.

module.exports = function(allowedRoles) {
  return function(req, res, next) {
    if (!req.user || !req.user.role) {
      // This case should ideally be caught by authMiddleware if token is invalid/missing
      return res.status(403).json({ message: 'Access denied. User role not available.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
    }
    next(); // User has the required role, proceed
  };
};
