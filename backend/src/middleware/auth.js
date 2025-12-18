const jwt = require('jsonwebtoken');

module.exports = function auth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const [, token] = hdr.split(' ');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload; // must contain id

      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};
