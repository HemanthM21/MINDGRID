// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

// ============================================
// LOAD ENV
// ============================================
dotenv.config();
connectDB();

const app = express();

// ============================================
// CREATE UPLOADS FOLDER
// ============================================
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📁 uploads/ folder created");
}

// ============================================
// CORS FIX (IMPORTANT FOR VERCEL + LOCALHOST)
// ============================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mindgrid-three.vercel.app",
      process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
  })
);

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// AI TEST ROUTE
// ============================================
const { analyzeDocument, calculatePriority } = require('./services/aiService');

app.post('/api/test/ai', async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const analysis = await analyzeDocument(text);
    const priority = calculatePriority(analysis);

    res.status(200).json({ success: true, analysis, priority });
  } catch (err) {
    next(err);
  }
});

// ============================================
// OCR TEST ROUTE
// ============================================
const upload = require('./middleware/upload');
const { extractTextFromImage } = require('./services/ocrService');

app.post('/api/test/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Upload an image with field name "file"',
      });
    }

    const extractedText = await extractTextFromImage(req.file.path);

    res.status(200).json({ success: true, extractedText });
  } catch (err) {
    console.error("OCR Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/journal', require('./routes/journal'));

// ============================================
// ROOT ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 LifeOS API is running',
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ============================================
// START SERVER
// ============================================
// Use process.env.PORT for Render/Vercel
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
-----------------------------------------
🚀 LifeOS Backend Running
📌 PORT: ${PORT}
🌍 ENV: ${process.env.NODE_ENV || "development"}
-----------------------------------------
`);
});
