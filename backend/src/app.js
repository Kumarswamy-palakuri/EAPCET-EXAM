const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : null,
      "http://localhost:5173"
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Server running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
