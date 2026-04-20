const express = require("express");
const {
  listExams,
  getExamQuestions,
  submitExam,
  getMyAttempts,
  getAttemptById,
} = require("../controllers/examController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/list", listExams);

router.use(verifyToken);
router.get("/questions", getExamQuestions);
router.post("/submit", submitExam);
router.get("/attempts", getMyAttempts);
router.get("/attempt/:attemptId", getAttemptById);

module.exports = router;
