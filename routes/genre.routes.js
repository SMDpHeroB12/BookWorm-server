const express = require("express");
const Genre = require("../models/Genre");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/* PUBLIC — get all genres */
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch {
    res.status(500).json({ message: "Failed to fetch genres" });
  }
});

/* ADMIN — create genre */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: "Genre name required" });

    const exists = await Genre.findOne({ name: name.trim() });
    if (exists)
      return res.status(400).json({ message: "Genre already exists" });

    const genre = await Genre.create({ name: name.trim() });
    res.status(201).json(genre);
  } catch {
    res.status(400).json({ message: "Failed to create genre" });
  }
});

/* ADMIN — update genre */
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ message: "Genre name required" });

    const updated = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Genre not found" });
    res.json(updated);
  } catch {
    res.status(400).json({ message: "Failed to update genre" });
  }
});

/* ADMIN — delete genre */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    res.json({ message: "Genre deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete genre" });
  }
});

module.exports = router;
