// server/services/aiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Initialize Gemini ---
let genAI = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error("❌ Failed to initialize Gemini:", err.message);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY missing — using fallback AI.");
}

// ----------------------------------------------
// CLEAN JSON PARSER (Strongest version)
// ----------------------------------------------
function parseJSONfromText(text) {
  try {
    // Find first {...} block
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]);
  } catch (err) {
    console.error("⚠️ JSON Parse Failed:", err.message);
    return null;
  }
}

// ----------------------------------------------
// DOCUMENT ANALYSIS
// ----------------------------------------------
async function analyzeDocument(text) {
  try {
    if (!genAI) throw new Error("Gemini unavailable");
    if (!text || text.length < 5) return localAnalyzeDocument(text);

    const prompt = `
You are a document analysis AI system. Extract structured fields from the document text.

Return ONLY JSON exactly like:

{
  "documentType": "bill | id_card | bank_statement | license | other",
  "category": "Financial | Government | Health | Personal | Vehicle | Academic | Other",
  "summary": "Short summary of what this document is",
  "provider": "The issuing authority or company",
  "idNumber": "Extract ID / reference number (if any)",
  "amount": "number or null",
  "issueDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null"
}

Document Text:
${text}
`;

    // Use Gemini 1.5 flash (cheap, fast)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try parsing JSON
    const parsed = parseJSONfromText(responseText);
    if (parsed) return parsed;

    console.warn("⚠️ Gemini returned no JSON — using fallback.");
    return localAnalyzeDocument(text);

  } catch (err) {
    console.error("❌ analyzeDocument Gemini Error:", err.message);
    return localAnalyzeDocument(text);
  }
}

// ----------------------------------------------
// JOURNAL ANALYSIS
// ----------------------------------------------
async function analyzeJournalEntry(text) {
  try {
    if (!genAI) throw new Error("Gemini unavailable");

    const prompt = `
Analyze this journal entry and return ONLY JSON with:

{
  "mood": "Happy | Sad | Stressed | Energetic | Frustrated | Neutral",
  "moodScore": 1-10,
  "stressLevel": "Low | Medium | High",
  "energyLevel": "Low | Medium | High",
  "workload": "Low | Medium | High",
  "personalityInsight": "A 2-3 sentence analysis",
  "patterns": {
    "strengths": ["string", "string"],
    "areasForGrowth": ["string", "string"]
  },
  "priorities": ["string", "string"],
  "suggestions": [
    {
      "category": "Productivity | Well-being | etc",
      "icon": "emoji",
      "text": "actionable tip",
      "priority": "high | medium | low"
    }
  ]
}

Journal:
${text}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const parsed = parseJSONfromText(responseText);
    if (parsed) return parsed;

    return localAnalyzeJournal(text);

  } catch (err) {
    console.error("❌ Journal AI Error:", err.message);
    return localAnalyzeJournal(text);
  }
}

// ----------------------------------------------
// TASK GENERATION (Restored)
// ----------------------------------------------
async function generateTasksFromJournal(text) {
  try {
    if (!genAI) throw new Error("Gemini unavailable");

    const prompt = `
Extract actionable tasks from this journal. Return JSON:
{
  "tasks": [
    {
      "task": "Task title",
      "reason": "Why this task was created",
      "priority": "HIGH | MEDIUM | LOW",
      "dueDate": "YYYY-MM-DD or null"
    }
  ]
}

Journal:
${text}
`;
    // Use flash for speed
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const parsed = parseJSONfromText(result.response.text());

    if (parsed && parsed.tasks) return parsed;
    return localGenerateTasks(text);

  } catch (err) {
    console.error("❌ Task Gen Error:", err.message);
    return localGenerateTasks(text);
  }
}

// ----------------------------------------------
// PRIORITY CALCULATION
// ----------------------------------------------
function calculatePriority(data) {
  try {
    const now = new Date();
    const date = new Date(data?.dueDate || data?.expiryDate || null);

    if (!data) return "LOW";

    if (!isNaN(date)) {
      const diff = (date - now) / (1000 * 60 * 60 * 24);
      if (diff <= 7) return "HIGH";
      if (diff <= 30) return "MEDIUM";
    }

    return "LOW";
  } catch {
    return "LOW";
  }
}

// ----------------------------------------------
// FALLBACK FUNCTIONS (Smart Regex)
// ----------------------------------------------
function localAnalyzeDocument(text) {
  try {
    if (!text) return { documentType: 'other', category: 'Personal', summary: 'Unreadable' };

    const lowerText = text.toLowerCase();

    // Extract Amount
    const amountMatch = text.match(/[\$£€](\d+[.,]?\d*)/) || text.match(/Total[:\s]+([\d.,]+)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

    // Extract Dates
    const dates = text.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g) || [];
    const dueDate = dates.length > 0 ? new Date(dates[0]) : null;

    // Extract Provider (first line)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    const provider = lines.length > 0 ? lines[0].substring(0, 30) : 'Unknown Provider';

    // Extract ID
    const idMatch = text.match(/(ID|Account|Invoice|Ref)\s*(No|#)?\s*[:\.]?\s*([A-Z0-9-]{5,})/i);
    const idNumber = idMatch ? idMatch[3] : null;

    // Category
    let category = 'Personal';
    if (lowerText.includes('bill') || lowerText.includes('invoice')) category = 'Financial';
    else if (lowerText.includes('medical') || lowerText.includes('doctor')) category = 'Health';
    else if (lowerText.includes('vehicle') || lowerText.includes('license')) category = 'Vehicle';
    else if (lowerText.includes('government')) category = 'Government';

    return {
      documentType: category === 'Financial' ? 'bill' : 'other',
      category,
      summary: `Scanned ${category} Document from ${provider}`,
      amount,
      dueDate,
      provider,
      idNumber,
      priority: 'MEDIUM'
    };
  } catch (e) {
    return { documentType: 'other', category: 'Personal', summary: 'Analysis Failed' };
  }
}

function localAnalyzeJournal(text) {
  return {
    mood: "Neutral",
    moodScore: 5,
    stressLevel: "Low",
    energyLevel: "Medium",
    workload: "Medium",
    personalityInsight: "You seem thoughtful.",
    patterns: { strengths: [], areasForGrowth: [] },
    priorities: [],
    suggestions: [],
  };
}

function localGenerateTasks(text) {
  const tasks = [];
  const triggers = ['need to', 'must', 'should', 'todo'];
  const rules = text.split(/[.!?]/);

  rules.forEach(s => {
    if (triggers.some(t => s.toLowerCase().includes(t))) {
      tasks.push({
        task: s.trim().substring(0, 50),
        reason: 'Extracted from journal',
        priority: 'MEDIUM',
        dueDate: null
      });
    }
  });
  return { tasks };
}

module.exports = {
  analyzeDocument,
  calculatePriority,
  analyzeJournalEntry,
  generateTasksFromJournal
};
