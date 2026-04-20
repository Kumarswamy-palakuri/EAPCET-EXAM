const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

const shuffle = (input) => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const listExams = async (_req, res) => {
  const exams = await Exam.find({ isPublished: true })
    .select("title year durationMinutes subjects createdAt")
    .sort({ year: -1 });

  return res.status(200).json({ exams });
};

const getExamQuestions = async (req, res) => {
  const { examId, mode = "full", subject, randomize = "true", year } = req.query;

  let exam;
  if (examId) {
    exam = await Exam.findById(examId);
  } else if (year) {
    exam = await Exam.findOne({ year: Number(year), isPublished: true });
  } else {
    exam = await Exam.findOne({ isPublished: true }).sort({ year: -1 });
  }

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  const baseFilter = {};
  if (mode === "subject" && subject) {
    baseFilter.subject = subject;
  }

  let questions = [];

  if (exam.questionIds.length > 0) {
    questions = await Question.find({
      _id: { $in: exam.questionIds },
      ...baseFilter,
    }).lean();
  } else {
    questions = await Question.find({
      year: exam.year,
      ...baseFilter,
    }).lean();
  }

  const shouldRandomize = randomize !== "false";
  const orderedQuestions = shouldRandomize ? shuffle(questions) : questions;
  const limitedQuestions = orderedQuestions.slice(0, 160);

  return res.status(200).json({
    exam: {
      _id: exam._id,
      title: exam.title,
      year: exam.year,
      durationMinutes: exam.durationMinutes,
      totalQuestions: limitedQuestions.length,
      subjects: exam.subjects,
    },
    questions: limitedQuestions.map((q, index) => ({
      _id: q._id,
      questionNumber: index + 1,
      question: q.question,
      options: q.options,
      subject: q.subject,
      year: q.year,
      examType: q.examType,
    })),
  });
};

const submitExam = async (req, res) => {
  const { examId, responses = [], startedAt, durationTakenSeconds } = req.body;

  if (!examId) {
    return res.status(400).json({ message: "examId is required" });
  }

  if (!Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ message: "responses must be a non-empty array" });
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  const questionIds = [
    ...new Set(
      responses
        .map((r) => r.questionId)
        .filter(Boolean)
        .map((id) => id.toString())
    ),
  ];

  const questions = await Question.find({ _id: { $in: questionIds } }).lean();
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  const subjectRollup = {};
  const answerSnapshots = [];
  const incorrectQuestionIds = [];
  let score = 0;

  for (const response of responses) {
    const question = questionMap.get(String(response.questionId));
    if (!question) {
      continue;
    }

    const selectedOption =
      Number.isInteger(response.selectedOption) &&
      response.selectedOption >= 0 &&
      response.selectedOption <= 3
        ? response.selectedOption
        : null;

    const answered = selectedOption !== null;
    const isCorrect = answered && selectedOption === question.answer;
    const subject = question.subject || "General";

    if (!subjectRollup[subject]) {
      subjectRollup[subject] = {
        subject,
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
      };
    }

    subjectRollup[subject].total += 1;

    if (!answered) {
      subjectRollup[subject].unanswered += 1;
    } else if (isCorrect) {
      subjectRollup[subject].correct += 1;
      score += 1;
    } else {
      subjectRollup[subject].incorrect += 1;
      incorrectQuestionIds.push(question._id);
    }

    answerSnapshots.push({
      question: question._id,
      selectedOption,
      visited: Boolean(response.visited),
      answered,
      markedForReview: Boolean(response.markedForReview),
      isCorrect,
    });
  }

  const totalQuestions = answerSnapshots.length;
  const accuracy = totalQuestions ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;
  const calculatedDuration = startedAt
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      )
    : 0;

  const attempt = await Attempt.create({
    user: req.user._id,
    exam: exam._id,
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    submittedAt: new Date(),
    durationTakenSeconds:
      Number.isFinite(durationTakenSeconds) && durationTakenSeconds >= 0
        ? durationTakenSeconds
        : calculatedDuration,
    answers: answerSnapshots,
    score,
    totalQuestions,
    accuracy,
    subjectStats: Object.values(subjectRollup),
    incorrectQuestionIds,
  });

  const reviewQuestions = await Question.find({
    _id: { $in: incorrectQuestionIds },
  }).lean();

  return res.status(201).json({
    message: "Exam submitted successfully",
    attemptId: attempt._id,
    result: {
      score,
      totalQuestions,
      accuracy,
      subjectStats: Object.values(subjectRollup),
      incorrectQuestions: reviewQuestions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        subject: q.subject,
      })),
    },
  });
};

const getMyAttempts = async (req, res) => {
  const attempts = await Attempt.find({ user: req.user._id })
    .populate("exam", "title year")
    .sort({ createdAt: -1 });

  return res.status(200).json({ attempts });
};

const getAttemptById = async (req, res) => {
  const { attemptId } = req.params;

  const attempt = await Attempt.findById(attemptId)
    .populate("exam", "title year durationMinutes")
    .populate("answers.question", "question options answer subject");

  if (!attempt) {
    return res.status(404).json({ message: "Attempt not found" });
  }

  const isOwner = String(attempt.user) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.status(200).json({ attempt });
};

module.exports = {
  listExams,
  getExamQuestions,
  submitExam,
  getMyAttempts,
  getAttemptById,
};
