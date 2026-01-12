const express = require("express");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard",
    admin: req.user,
  });
});

module.exports = router;
