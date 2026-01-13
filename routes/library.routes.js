const express = require("express");
const LibraryItem = require("../models/LibraryItem");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

/* USER — get my library (with populated book) */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const items = await LibraryItem.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .populate("bookId");
    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to fetch library" });
  }
});

/* USER — add to library OR update shelf/progress */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { bookId, shelf, progress } = req.body || {};
    if (!bookId) return res.status(400).json({ message: "bookId required" });

    const payload = {
      userId: req.user.id,
      bookId,
      shelf: shelf || "want",
      progress: typeof progress === "number" ? progress : 0,
    };

    const updated = await LibraryItem.findOneAndUpdate(
      { userId: req.user.id, bookId },
      payload,
      { upsert: true, new: true, runValidators: true }
    ).populate("bookId");

    res.status(200).json(updated);
  } catch (e) {
    res.status(400).json({ message: "Failed to save library item" });
  }
});

/* USER — remove from library */
router.delete("/:bookId", verifyToken, async (req, res) => {
  try {
    await LibraryItem.findOneAndDelete({
      userId: req.user.id,
      bookId: req.params.bookId,
    });
    res.json({ message: "Removed from library" });
  } catch {
    res.status(500).json({ message: "Failed to remove item" });
  }
});

module.exports = router;
