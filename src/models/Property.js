const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["apartment", "house", "studio", "pg", "other"],
      required: true,
      index: true,
    },
    rent: { type: Number, required: true, index: true },
    amenities: [{ type: String }],
    images: [{ type: String }], // URLs to /uploads/*
    ownerUid: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
