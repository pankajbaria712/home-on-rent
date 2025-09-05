const express = require("express");
const { body, validationResult } = require("express-validator");
const { verifyAuth } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Initialize user profile (first login) or update role/phone
router.post(
  "/init",
  verifyAuth,
  body("role").isIn(["owner", "renter"]).withMessage("Invalid role"),
  body("phone")
    .isString()
    .isLength({ min: 8, max: 16 })
    .withMessage("Invalid phone"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { role, phone } = req.body;
    const email = req.auth.email || "";
    const uid = req.auth.uid;

    let user = await User.findOneAndUpdate(
      { uid },
      { uid, email, role, phone },
      { new: true, upsert: true }
    );
    return res.json({ user });
  }
);

// Get current user's profile
router.get("/me", verifyAuth, async (req, res) => {
  return res.json({ user: req.userProfile });
});

module.exports = router;
