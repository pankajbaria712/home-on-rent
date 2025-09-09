const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.join(__dirname, "..", process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : path.join(__dirname, "..", "firebase_serviceaccount.json");

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
  console.log("✅ Firebase Admin initialized using:", serviceAccountPath);
} catch (e) {
  console.error("❌ Service account file not found at:", serviceAccountPath);
  throw e;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
