const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "lifetrack-nepal-secret-key-2026";

// Protect Admin Routes via HTTP Cookie or Header Token
const protectAdmin = (req, res, next) => {
  const token = req.cookies?.adminToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized: No authentication cookie found"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401);
    return next(new Error("Not authorized: Authentication cookie invalid or expired"));
  }
};

module.exports = { protectAdmin, JWT_SECRET };
