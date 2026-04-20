const express = require("express");
const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUploadQuestions,
  createExam,
  updateExam,
  deleteExam,
  getAllExams,
  getAllQuestions,
  getAllAttempts,
} = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken, isAdmin);
router.post("/question", createQuestion);
router.put("/question/:id", updateQuestion);
router.delete("/question/:id", deleteQuestion);
router.post("/questions/bulk", bulkUploadQuestions);
router.get("/questions", getAllQuestions);
router.post("/exam", createExam);
router.put("/exam/:id", updateExam);
router.delete("/exam/:id", deleteExam);
router.get("/exams", getAllExams);
router.get("/attempts", getAllAttempts);

module.exports = router;
