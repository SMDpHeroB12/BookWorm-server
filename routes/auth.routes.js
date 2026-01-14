const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const jwt = require("jsonwebtoken");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, photo } = req.body || {};

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    //  Strong password validation (single source of truth)
    const errors = [];
    if (password.length < 6) errors.push("minimum 6 characters");
    if (!/[A-Z]/.test(password)) errors.push("1 uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("1 lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("1 number");

    if (errors.length) {
      return res.status(400).json({
        message: `Weak password: ${errors.join(", ")}`,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Duplicate email
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password (bcrypt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      photo: photo ? String(photo).trim() : "",
      role: "user",
    });

    return res.status(201).json({
      message: "User registered successfully ✅",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (err) {
    console.log("REGISTER ERROR", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR ", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
