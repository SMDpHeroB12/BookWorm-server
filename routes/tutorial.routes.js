const express = require("express");
const Tutorial = require("../models/Tutorial");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/* PUBLIC — list tutorials */
router.get("/", async (req, res) => {
  try {
    const tutorials = await Tutorial.find().sort({ createdAt: -1 });
    res.json(tutorials);
  } catch {
    res.status(500).json({ message: "Failed to fetch tutorials" });
  }
});

/* ADMIN — create tutorial */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, youtubeUrl, description } = req.body || {};
    if (!title || !youtubeUrl) {
      return res
        .status(400)
        .json({ message: "Title and youtubeUrl are required" });
    }

    const tutorial = await Tutorial.create({ title, youtubeUrl, description });
    res.status(201).json(tutorial);
  } catch {
    res.status(400).json({ message: "Failed to create tutorial" });
  }
});

/* ADMIN — update tutorial */
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, youtubeUrl, description } = req.body || {};
    if (!title || !youtubeUrl) {
      return res
        .status(400)
        .json({ message: "Title and youtubeUrl are required" });
    }

    const updated = await Tutorial.findByIdAndUpdate(
      req.params.id,
      { title, youtubeUrl, description },
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Tutorial not found" });
    res.json(updated);
  } catch {
    res.status(400).json({ message: "Failed to update tutorial" });
  }
});

/* ADMIN — delete tutorial */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Tutorial.findByIdAndDelete(req.params.id);
    res.json({ message: "Tutorial deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete tutorial" });
  }
});

module.exports = router;
