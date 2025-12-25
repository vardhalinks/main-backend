import express from "express";
import { protect } from "../middleware/auth.js";
import { Section } from "../models/Section.js";

const router = express.Router();

router.put("/hero", protect, async (req, res) => {
  try {
    const data = req.body || {};
    const updated = await Section.findOneAndUpdate(
      { key: "hero" },
      { key: "hero", ...data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, section: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
