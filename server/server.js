const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authMiddleware = require("./middleware/authMiddleware");
const resumeAnalyzerRoutes = require("./routes/resumeAnalyzerRoutes");

require("dotenv").config({ override: true });
console.log("GEMINI KEY =", process.env.GEMINI_API_KEY);

const resumeRoutes = require("./routes/resumeRoutes");

const authRoutes = require("./routes/authRoutes");

const interviewRoutes = require("./routes/interviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

app.use("/api/resume", resumeRoutes);

app.use("/api/analyze", resumeAnalyzerRoutes);

app.use("/api/interview", interviewRoutes);

app.use("/api/dashboard", dashboardRoutes);


// mongodb connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch((err) => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/dashboard", authMiddleware, (req, res) => {

  res.json({
    message: "Welcome to dashboard 🔥",
    user: req.user
  });

});