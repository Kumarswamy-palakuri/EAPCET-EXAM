const mongoose = require("mongoose");

const answerSnapshotSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOption: {
      type: Number,
      default: null,
    },
    visited: {
      type: Boolean,
      default: false,
    },
    answered: {
      type: Boolean,
      default: false,
    },
    markedForReview: {
      type: Boolean,
      default: false,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const subjectStatSchema = new mongoose.Schema(
  {
    subject: String,
    total: Number,
    correct: Number,
    incorrect: Number,
    unanswered: Number,
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    durationTakenSeconds: {
      type: Number,
      default: 0,
    },
    answers: {
      type: [answerSnapshotSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    subjectStats: {
      type: [subjectStatSchema],
      default: [],
    },
    incorrectQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
