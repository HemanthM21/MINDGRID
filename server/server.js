// server/server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

// Load env variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// ------------------------------------
// Ensure uploads folder exists
// ------------------------------------
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📁 uploads/ directory created");
}

// ------------------------------------
// Middleware
// ------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple logger
app.use((req, res, next) => {
  console.log(`${req.method} → ${req.path}`);
  next();
});

// ------------------------------------
// Test AI Route
// ------------------------------------
const { analyzeDocument, calculatePriority } = require("./services/aiService");

app.post("/api/test/ai", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const analysis = await analyzeDocument(text);
    const priority = calculatePriority(analysis);

    res.json({ success: true, analysis, priority });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------
// Test OCR Route
// ------------------------------------
const upload = require("./middleware/upload");
const { extractTextFromImage } = require("./services/ocrService");

app.post("/api/test/ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Upload an image with name 'file'",
      });
    }

    const extractedText = await extractTextFromImage(req.file.path);

    res.json({ success: true, extractedText });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------
// Main API Routes
// ------------------------------------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/reminders", require("./routes/reminderRoutes"));
app.use("/api/journal", require("./routes/journal"));

// ------------------------------------
// Root Route
// ------------------------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 LifeOS API is running!",
  });
});

// ------------------------------------
// Health Check
// ------------------------------------
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    time: new Date().toISOString(),
  });
});

// ------------------------------------
// 404 Handler
// ------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ------------------------------------
// Global Error Handler
// ------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ success: false, message: err.message });
});

// ------------------------------------
// Start Server
// ------------------------------------
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
═══════════════════════════════════
🚀 LifeOS Backend Running
🔌 Port: ${PORT}
🌍 Env: ${process.env.NODE_ENV || "development"}
═══════════════════════════════════
`);
});

// ------------------------------------
// Graceful Shutdown
// ------------------------------------
process.on("SIGINT", () => {
  console.log("\n🔌 Server stopped");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.log("🔌 Server terminated");
  server.close(() => process.exit(0));
});
