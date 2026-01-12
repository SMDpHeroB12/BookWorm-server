const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { verifyToken } = require("./middlewares/auth.middleware");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// connect database
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("BookWorm Server is running...");
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API Health Server is running" });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected data accessed ✅",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
