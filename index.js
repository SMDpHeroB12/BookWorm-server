const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// connect database
connectDB();

app.get("/", (req, res) => {
  res.send("BookWorm Server is running...");
});
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API Health Server is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
