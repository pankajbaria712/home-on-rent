const express = require("express");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");
const Property = require("../models/Property");
const { verifyAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Multer setup: 5 images max, 5MB each, only jpg/png
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, Date.now() + "_" + safe);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.mimetype))
    return cb(new Error("Only .jpg and .png allowed"));
  cb(null, true);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Search properties: /api/properties?city=...&type=...&minRent=..&maxRent=..
router.get("/", async (req, res) => {
  const { city = "", type, minRent, maxRent } = req.query;
  const q = {};
  if (city) q.city = new RegExp("^" + city + "$", "i");
  if (type) q.type = type;
  if (minRent || maxRent) {
    q.rent = {};
    if (minRent) q.rent.$gte = Number(minRent);
    if (maxRent) q.rent.$lte = Number(maxRent);
  }
  const items = await Property.find(q)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ items });
});

// Add property (owner only)
router.post(
  "/",
  verifyAuth,
  requireRole("owner"),
  upload.array("images", 5),
  body("title").isString().isLength({ min: 3 }),
  body("address").isString().isLength({ min: 5 }),
  body("city").isString().isLength({ min: 2 }),
  body("type").isIn(["apartment", "house", "studio", "pg", "other"]),
  body("rent").isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { title, address, city, type, rent, amenities } = req.body;
      const images = (req.files || []).map(
        (f) => "/uploads/" + path.basename(f.path)
      );
      const amenArr = (amenities ? amenities.split(",") : [])
        .map((a) => a.trim())
        .filter(Boolean);

      const item = await Property.create({
        title,
        address,
        city,
        type,
        rent: Number(rent),
        amenities: amenArr,
        images,
        ownerUid: req.auth.uid,
      });
      res.status(201).json({ item });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create property" });
    }
  }
);

// Property details
router.get("/:id", async (req, res) => {
  try {
    const item = await Property.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  } catch (e) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// Contact owner: reveals phone number (requires login, any role)
const User = require("../models/User");
router.get("/:id/contact", verifyAuth, async (req, res) => {
  try {
    const item = await Property.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    const owner = await User.findOne({ uid: item.ownerUid }).lean();
    if (!owner) return res.status(404).json({ error: "Owner not found" });
    res.json({ phone: owner.phone });
  } catch (e) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

module.exports = router;
