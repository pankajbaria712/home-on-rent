const admin = require("firebase-admin");
const User = require("../models/User");

async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });
    if (!admin.apps.length)
      return res.status(500).json({ error: "Auth not initialized on server" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = decoded; // contains uid, email, etc.

    // Attach user profile (role/phone) if available
    let user = await User.findOne({ uid: decoded.uid }).lean();
    req.userProfile = user || null;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.userProfile || req.userProfile.role !== role) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { verifyAuth, requireRole };
