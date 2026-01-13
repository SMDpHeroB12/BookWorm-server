const mongoose = require("mongoose");

const libraryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    shelf: {
      type: String,
      enum: ["want", "current", "read"],
      default: "want",
      required: true,
    },

    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicates: same user can't add same book twice
libraryItemSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("LibraryItem", libraryItemSchema);
