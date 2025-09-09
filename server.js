const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

const app = express();

// Connect MongoDB
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/home_on_rent";
mongoose
  .connect(mongoUri, {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error", err);
    process.exit(1);
  });

// Firebase Admin initialization
try {
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credsPath || !fs.existsSync(credsPath)) {
    console.warn(
      "⚠️  Firebase service account file not found. Set GOOGLE_APPLICATION_CREDENTIALS to your JSON path."
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(require(path.resolve(credsPath))),
    });
    console.log("✅ Firebase Admin initialized");
  }
} catch (e) {
  console.error("❌ Firebase Admin init failed:", e);
}

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const userRoutes = require("./src/routes/users");
const propertyRoutes = require("./src/routes/properties");

// Firebase admin & token verify
const verifyFirebase = require('./src/middleware/verifyFirebase');

app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

// Fallback to index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
