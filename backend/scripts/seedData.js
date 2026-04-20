const dotenv = require("dotenv");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Question = require("../src/models/Question");
const Exam = require("../src/models/Exam");

dotenv.config();

const SUBJECT_SPLIT = [
  { subject: "Mathematics", count: 80 },
  { subject: "Physics", count: 40 },
  { subject: "Chemistry", count: 40 },
];

const buildMathQuestion = (i, year) => {
  const a = (year % 100) + i + 3;
  const b = (i % 9) + 2;
  const correct = 4 * a * b;

  return {
    question: `If a = ${a} and b = ${b}, then (a + b)^2 - (a - b)^2 equals?`,
    options: [
      `${correct}`,
      `${2 * a * b}`,
      `${a * b}`,
      `${(a + b) * (a - b)}`,
    ],
    answer: 0,
    subject: "Mathematics",
    year,
  };
};

const buildPhysicsQuestion = (i, year) => {
  const u = (i % 25) + 5;
  const t = (i % 6) + 2;
  const a = 2;
  const s = u * t + 0.5 * a * t * t;

  return {
    question: `A particle starts with velocity ${u} m/s and acceleration 2 m/s^2. Displacement after ${t} s is?`,
    options: [`${s} m`, `${u * t} m`, `${u + a * t} m`, `${0.5 * a * t * t} m`],
    answer: 0,
    subject: "Physics",
    year,
  };
};

const buildChemistryQuestion = (i, year) => {
  const period = (i % 4) + 2;
  const atomicNumber = period * 10 + (i % 9) + 1;
  const valency = (i % 4) + 1;

  return {
    question: `For a representative element with atomic number ${atomicNumber}, the likely valency is?`,
    options: [`${valency}`, `${valency + 1}`, `${valency + 2}`, `${valency - 1}`],
    answer: 0,
    subject: "Chemistry",
    year,
  };
};

const createQuestionBySubject = (subject, index, year) => {
  if (subject === "Mathematics") return buildMathQuestion(index, year);
  if (subject === "Physics") return buildPhysicsQuestion(index, year);
  return buildChemistryQuestion(index, year);
};

const generateExamQuestions = (year) => {
  const result = [];
  let index = 1;

  for (const entry of SUBJECT_SPLIT) {
    for (let i = 0; i < entry.count; i += 1) {
      result.push(createQuestionBySubject(entry.subject, index, year));
      index += 1;
    }
  }

  return result;
};

const seed = async () => {
  await connectDB();

  const years = [2024, 2023];
  const allQuestions = years.flatMap((year) => generateExamQuestions(year));

  await Question.deleteMany({});
  await Exam.deleteMany({});

  const createdQuestions = await Question.insertMany(allQuestions);

  for (const year of years) {
    const questionIds = createdQuestions
      .filter((q) => q.year === year)
      .map((q) => q._id);

    await Exam.create({
      title: `EAMCET ${year} Full Test`,
      year,
      durationMinutes: 180,
      subjects: ["Mathematics", "Physics", "Chemistry"],
      questionIds,
      isPublished: true,
    });
  }

  if (process.env.ADMIN_EMAIL) {
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (admin) {
      admin.role = "admin";
      await admin.save();
    } else {
      await User.create({
        name: "Exam Admin",
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        role: "admin",
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log("Seed completed. Exams and questions inserted successfully.");
  process.exit(0);
};

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", error.message);
  process.exit(1);
});
