const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/me", verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    role: req.user.role,
  });
});

module.exports = router;
