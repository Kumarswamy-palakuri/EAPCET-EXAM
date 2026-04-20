const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4,
        message: "Each question must have exactly 4 options.",
      },
      required: true,
    },
    answer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    examType: {
      type: String,
      default: "EAMCET",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
