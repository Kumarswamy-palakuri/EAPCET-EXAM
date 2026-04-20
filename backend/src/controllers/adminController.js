const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

const createQuestion = async (req, res) => {
  const { question, options, answer, subject, year } = req.body;

  if (!question || !options || answer === undefined || !subject || !year) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!Array.isArray(options) || options.length !== 4) {
    return res.status(400).json({ message: "options must contain exactly 4 values" });
  }

  const created = await Question.create({ question, options, answer, subject, year });
  return res.status(201).json({ question: created });
};

const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const updated = await Question.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!updated) {
    return res.status(404).json({ message: "Question not found" });
  }

  return res.status(200).json({ question: updated });
};

const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const removed = await Question.findByIdAndDelete(id);

  if (!removed) {
    return res.status(404).json({ message: "Question not found" });
  }

  await Exam.updateMany({ questionIds: removed._id }, { $pull: { questionIds: removed._id } });
  return res.status(200).json({ message: "Question deleted" });
};

const bulkUploadQuestions = async (req, res) => {
  const { questions = [] } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "questions must be a non-empty array" });
  }

  const normalized = questions.map((q) => ({
    question: q.question,
    options: q.options,
    answer: q.answer,
    subject: q.subject,
    year: q.year,
    examType: q.examType || "EAMCET",
  }));

  const created = await Question.insertMany(normalized);
  return res.status(201).json({
    message: `${created.length} questions uploaded`,
    count: created.length,
    insertedIds: created.map(q => q._id)
  });
};

const createExam = async (req, res) => {
  const {
    title,
    year,
    durationMinutes = 180,
    subjects = [],
    questionIds = [],
    isPublished = true,
  } = req.body;

  if (!title || !year) {
    return res.status(400).json({ message: "title and year are required" });
  }

  const exam = await Exam.create({
    title,
    year,
    durationMinutes,
    subjects,
    questionIds,
    isPublished,
  });

  return res.status(201).json({ exam });
};

const updateExam = async (req, res) => {
  const { id } = req.params;
  const updated = await Exam.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!updated) {
    return res.status(404).json({ message: "Exam not found" });
  }

  return res.status(200).json({ exam: updated });
};

const deleteExam = async (req, res) => {
  const { id } = req.params;
  const removed = await Exam.findByIdAndDelete(id);

  if (!removed) {
    return res.status(404).json({ message: "Exam not found" });
  }

  return res.status(200).json({ message: "Exam deleted" });
};

const getAllExams = async (req, res) => {
  const exams = await Exam.find().sort({ createdAt: -1 });
  return res.status(200).json({ exams });
};

const getAllQuestions = async (req, res) => {
  const { subject, year } = req.query;
  const filter = {};

  if (subject) filter.subject = subject;
  if (year) filter.year = Number(year);

  const questions = await Question.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({ questions });
};

const getAllAttempts = async (_req, res) => {
  const attempts = await Attempt.find()
    .populate("user", "name email role")
    .populate("exam", "title year")
    .sort({ createdAt: -1 });

  return res.status(200).json({ attempts });
};

module.exports = {
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
};
