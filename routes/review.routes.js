const express = require("express");
const Review = require("../models/Review");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/* USER — submit review (pending) */
router.post("/books/:bookId", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    const review = await Review.create({
      bookId: req.params.bookId,
      userId: req.user.id,
      rating,
      comment,
      status: "pending",
    });

    res.status(201).json({
      message: "Review submitted for moderation ✅",
      review,
    });
  } catch {
    res.status(400).json({ message: "Failed to submit review" });
  }
});

/* PUBLIC — get approved reviews for a book */
router.get("/books/:bookId", async (req, res) => {
  try {
    const reviews = await Review.find({
      bookId: req.params.bookId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .select("rating comment createdAt");
    res.json(reviews);
  } catch {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

/* ADMIN — list pending reviews */
router.get("/pending", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("bookId", "title")
      .populate("userId", "email");
    res.json(reviews);
  } catch {
    res.status(500).json({ message: "Failed to fetch pending reviews" });
  }
});

/* ADMIN — approve review */
router.patch("/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Review not found" });

    res.json({ message: "Review approved ✅" });
  } catch {
    res.status(500).json({ message: "Failed to approve review" });
  }
});

/* ADMIN — delete review */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

module.exports = router;
