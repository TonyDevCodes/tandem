function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, error: `Only ${role}s can perform this action` });
    }
    next();
  };
}

module.exports = requireRole;