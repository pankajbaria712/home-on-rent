// middleware/verifyFirebaseToken.js
const admin = require("firebase-admin");

module.exports = async (req, res, next) => {
  try {
    // prefer Authorization: Bearer <ID_TOKEN>
    let idToken = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      idToken = authHeader.split("Bearer ")[1];
    } else if (req.cookies && req.cookies.session) {
      // If you used session cookies, verify them
      const sessionCookie = req.cookies.session;
      // session cookie is already the session, verify it
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true /* checkRevoked */);
      req.user = decodedClaims;
      return next();
    } else {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};
