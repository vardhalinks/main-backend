import express from "express";
import { protect } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "No image data provided" });
    const result = await cloudinary.uploader.upload(image, { folder: "landing-page-admin", resource_type: "auto" });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Image upload failed", error: err.message });
  }
});

export default router;
