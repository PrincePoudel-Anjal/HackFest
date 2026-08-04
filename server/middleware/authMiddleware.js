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

// Protect Patient Routes & Decode JWT Payload into req.user
const protectPatient = (req, res, next) => {
  let token = req.cookies?.patientToken || req.cookies?.token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // If query string has birthCertificateNumber, allow req.user fallback
    if (req.query.birthCertificateNumber || req.query.healthId) {
      req.user = {
        birthCertificateNumber: req.query.birthCertificateNumber,
        healthId: req.query.healthId,
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized: Missing Bearer Token or cookie authentication.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (req.query.birthCertificateNumber || req.query.healthId) {
      req.user = {
        birthCertificateNumber: req.query.birthCertificateNumber,
        healthId: req.query.healthId,
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: "Not authorized: Invalid or expired token.",
    });
  }
};

module.exports = { protectAdmin, protectPatient, JWT_SECRET };
