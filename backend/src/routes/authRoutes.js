const express = require("express");
const {
  googleLogin,
  getCurrentUser,
  logout,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/google", googleLogin);
router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", logout);

module.exports = router;
