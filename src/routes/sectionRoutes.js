// backend/src/routes/sectionRoutes.js
import express from "express";
import { Section } from "../models/Section.js";
import { protect } from "../middleware/auth.js";
import { apiKeyProtect } from "../middleware/apiKeyAuth.js";

const router = express.Router();

// GET all sections (public)
router.get("/", async (req, res) => {
  try {
    const sections = await Section.find().sort({ key: 1 });
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all sections (protected via API key) - useful for landing page to pull latest
router.get("/public", apiKeyProtect, async (req, res) => {
  try {
    const sections = await Section.find().sort({ key: 1 });
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET one section by key (public)
router.get("/:key", async (req, res) => {
  try {
    const section = await Section.findOne({ key: req.params.key });
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE/UPDATE section (admin only)
router.put("/:key", protect, async (req, res) => {
  try {
    const { title, subtitle, content, imageUrl, extraData } = req.body;

    let section = await Section.findOne({ key: req.params.key });

    if (!section) {
      section = await Section.create({
        key: req.params.key,
        title,
        subtitle,
        content,
        imageUrl,
        extraData
      });
    } else {
      section.title = title ?? section.title;
      section.subtitle = subtitle ?? section.subtitle;
      section.content = content ?? section.content;
      section.imageUrl = imageUrl ?? section.imageUrl;
      section.extraData = extraData ?? section.extraData;
      await section.save();
    }

    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
