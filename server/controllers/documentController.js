// server/controllers/documentController.js

const Document = require("../models/Document");
const Reminder = require("../models/Reminder");
const { extractTextFromImage } = require("../services/ocrService");
const { analyzeDocument, calculatePriority } = require("../services/aiService");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

/* ============================================================
   📌 UPLOAD + OCR + AI ANALYSIS + SAVE DOCUMENT
   POST /api/documents/upload
   ============================================================ */
exports.uploadDocument = async (req, res) => {
  try {
    console.log("\n=======================================");
    console.log("📄 New Upload Request Received");
    console.log("=======================================\n");

    // 1️⃣ Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload an image or PDF.",
      });
    }

    const filePath = req.file.path;
    console.log("📌 Uploaded File Saved At:", filePath);

    // 2️⃣ OCR Extraction
    console.log("🔍 Running OCR...");
    let extractedText = "";
    try {
      extractedText = await extractTextFromImage(filePath);
      if (!extractedText || extractedText.trim().length === 0) {
        console.warn("⚠️ OCR returned empty text");
        extractedText = "Text could not be extracted.";
      }
    } catch (ocrErr) {
      console.error("OCR Error (Non-fatal):", ocrErr.message);
      extractedText = "OCR process failed.";
    }

    console.log("📝 OCR Completed — Text Length:", extractedText.length);

    // 3️⃣ AI Analysis (Gemini with Local Fallback)
    console.log("🤖 Sending text to AI...");
    let analysis = {};
    try {
      analysis = await analyzeDocument(extractedText);
    } catch (aiErr) {
      console.error("AI Service Error:", aiErr.message);
      analysis = {}; // Will fall back to defaults
    }
    console.log("🤖 AI Analysis Result:", analysis);

    // 4️⃣ SANITIZE DATA (Critical for Mongoose Validation)
    // Enums must match models/Document.js exactly
    const validCategories = ['Financial', 'Government', 'Health', 'Personal', 'Vehicle'];
    const validTypes = ['bill', 'id', 'certificate', 'medicine', 'insurance', 'vehicle', 'warranty', 'other'];

    let safeCategory = analysis.category || "Personal";

    // Map invalid categories to valid ones
    if (!validCategories.includes(safeCategory)) {
      console.warn(`⚠️ Invalid Category '${safeCategory}' mapping to 'Personal'`);
      if (['Utilities', 'Utility', 'Work', 'Academic'].includes(safeCategory)) safeCategory = 'Financial';
      else safeCategory = 'Personal';
    }

    let safeType = analysis.documentType || "other";
    if (!validTypes.includes(safeType)) {
      safeType = "other";
    }

    // Sanitize Amount
    let safeAmount = analysis.amount;
    if (typeof safeAmount === 'string') {
      // Remove currency symbols, leave dots and digits
      const num = parseFloat(safeAmount.replace(/[^0-9.]/g, ''));
      safeAmount = isNaN(num) ? null : num;
    }

    // 5️⃣ Priority
    const priority = calculatePriority({ ...analysis, dueDate: analysis.dueDate });

    // 6️⃣ Save Document to MongoDB
    console.log("💾 Saving to MongoDB...");
    const document = await Document.create({
      user: req.user.id,
      fileName: req.file.originalname,
      fileUrl: filePath,
      extractedData: {
        rawText: extractedText,
        summary: analysis.summary || "Document uploaded",
        provider: analysis.provider || "Unknown",
        documentType: safeType, // Use sanitized
        idNumber: analysis.idNumber || null,
        amount: safeAmount,
        dueDate: analysis.dueDate || null,
        expiryDate: analysis.expiryDate || null,
        issueDate: analysis.issueDate || null,
      },
      category: safeCategory, // Use sanitized
      documentType: safeType, // Use sanitized
      priority,
      uploadedAt: new Date(),
    });

    console.log("✅ Document Saved:", document._id);

    // 7️⃣ Auto-create reminders
    let remindersCreated = 0;
    if (analysis.dueDate) {
      try {
        await Reminder.create({
          user: req.user.id,
          document: document._id,
          title: `Due: ${analysis.documentType || "Document"}`,
          description: `Amount: ${safeAmount || 'N/A'} - ${analysis.summary || 'No summary'}`,
          reminderDate: new Date(analysis.dueDate),
          reminderType: 'DUE_DATE',
          status: "PENDING",
        });
        remindersCreated++;
        console.log("⏰ Reminder Created");
      } catch (remErr) {
        console.error("Reminder create failed:", remErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      document: {
        ...document.toObject(),
        analysis: { // Frontend expects flat analysis object in some views
          category: safeCategory,
          documentType: safeType,
          amount: safeAmount,
          ...document.extractedData
        }
      },
      remindersCreated,
    });

  } catch (err) {
    console.error("❌ CRTICAL UPLOAD ERROR:", err);

    // Write log to file
    try {
      fs.writeFileSync('fatal_error.log', new Date().toISOString() + '\n' + err.stack + '\n\n', { flag: 'a' });
    } catch (e) { }

    return res.status(500).json({
      success: false,
      message: "Server error processing document: " + err.message,
      error: err.message,
    });
  }
};

/* ============================================================
   📌 GET ALL DOCUMENTS
   ============================================================ */
exports.getDocuments = async (req, res) => {
  try {
    let documents = [];

    if (req.user && req.user.id) {
      const rawDocs = await Document.find({ user: req.user.id })
        .sort({ uploadedAt: -1 })
        .lean();

      documents = rawDocs.map((doc) => ({
        _id: doc._id,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        extractedText: doc.extractedData?.rawText || "",
        uploadedAt: doc.uploadedAt,
        analysis: {
          summary: doc.extractedData?.summary,
          provider: doc.extractedData?.provider,
          documentType: doc.documentType || doc.extractedData?.documentType,
          idNumber: doc.extractedData?.idNumber,
          amount: doc.extractedData?.amount,
          dueDate: doc.extractedData?.dueDate,
          expiryDate: doc.extractedData?.expiryDate,
          issueDate: doc.extractedData?.issueDate,
          category: doc.category,
          priority: doc.priority,
        },
        priority: doc.priority,
        category: doc.category,
      }));
    }

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("❌ Get Documents Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching documents",
    });
  }
};

/* ============================================================
   📌 GET SINGLE DOCUMENT & DELETE & STATS
   ============================================================ */
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: "Not found" });
    if (document.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Unauthorized" });
    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false });
    if (document.user.toString() !== req.user.id) return res.status(403).json({ success: false });

    if (fs.existsSync(document.fileUrl)) fs.unlinkSync(document.fileUrl);
    await Reminder.deleteMany({ document: document._id });
    await document.deleteOne();

    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalDocuments = await Document.countDocuments({ user: userId });

    // Aggregations
    const byCategory = await Document.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const byPriority = await Document.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, data: { totalDocuments, byCategory, byPriority } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};
