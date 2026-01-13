const express = require("express");
const Book = require("../models/Book");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/* PUBLIC — get all books */
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

/* PUBLIC — get single book */
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch {
    res.status(500).json({ message: "Failed to fetch book" });
  }
});

/* ADMIN — create book */
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const book = new Book({
      ...req.body,
      createdBy: req.user.id,
    });

    await book.save();
    res.status(201).json(book);
  } catch {
    res.status(400).json({ message: "Failed to create book" });
  }
});

/* ADMIN — delete book */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete book" });
  }
});

/* ADMIN — update book */
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, author, genre, description, coverImage } = req.body || {};

    if (!title || !author || !genre || !description || !coverImage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, genre, description, coverImage },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Book not found" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update book" });
  }
});

module.exports = router;
