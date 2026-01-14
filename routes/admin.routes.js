const express = require("express");
const User = require("../models/User");
const Book = require("../models/Book");
const Review = require("../models/Review");

const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/* ADMIN — dashboard */
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard",
    admin: req.user,
  });
});

// GET /api/admin/stats
router.get("/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [totalUsers, totalBooks, pendingReviews] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Review.countDocuments({ status: "pending" }),
    ]);

    res.json({ totalUsers, totalBooks, pendingReviews });
  } catch (e) {
    res.status(500).json({ message: "Failed to load stats" });
  }
});

/* ADMIN — list all users */
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("_id name email role createdAt");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ADMIN — update a user's role */
router.patch("/users/:id/role", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body || {};

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be user or admin" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("_id name email role");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated ✅", user: updated });
  } catch {
    res.status(500).json({ message: "Failed to update role" });
  }
});

module.exports = router;
