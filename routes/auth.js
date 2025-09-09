// routes/auth.js
const express = require("express");
const Joi = require("joi");
const admin = require("firebase-admin");
const router = express.Router();

// Load service account (place firebase_serviceaccount.json in project root)
const serviceAccount = require("../firebase_serviceaccount.json");

// Initialize Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
});

const idTokenSchema = Joi.object({
  idToken: Joi.string().required(),
});

// 1) Register route (server creates the user)
// NOTE: You can also create users on the client using Firebase client SDK. Creating on server is fine too.
router.post("/register", async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password, firstName, lastName } = req.body;

    // create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Optionally: set custom claims or save additional data in Firestore/DB here

    res.status(201).json({
      message: "User registered successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (err) {
    // handle common errors (email already in use)
    res.status(500).json({ message: err.message });
  }
});

// 2) Exchange ID token (obtained on client after sign-in) for a session cookie
// This gives you server-side session (HTTP-only cookie) for browser requests.
router.post("/sessionLogin", async (req, res) => {
  try {
    const { error } = idTokenSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const idToken = req.body.idToken;
    // Set cookie to expire in 5 days
    const expiresIn = 5 * 24 * 60 * 60 * 1000;

    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("session", sessionCookie, options);
    res.status(200).json({ message: "Session cookie created" });
  } catch (err) {
    res.status(401).json({
      message: "Invalid ID token or session creation failed",
      error: err.message,
    });
  }
});

// 3) Verify ID token directly (alternative to session cookie)
// Useful for APIs where frontend sends bearer token
router.post("/verifyToken", async (req, res) => {
  try {
    const { error } = idTokenSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const decoded = await admin.auth().verifyIdToken(req.body.idToken);
    res.json({ valid: true, decoded });
  } catch (err) {
    res.status(401).json({ valid: false, message: err.message });
  }
});

// 4) Logout (clear session cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.json({ message: "Logged out" });
});

module.exports = router;
