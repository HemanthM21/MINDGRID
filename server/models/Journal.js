const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  text: { type: String, required: true },
  quickMood: { type: String }, // User-selected mood (happy, sad, stressed, etc.)
  summary: { type: String },
  mood: { type: String },
  priorities: { type: [String], default: [] },
  stressFactors: { type: [String], default: [] },
  importantEvents: { type: [String], default: [] },
  aiAnalysis: {
    mood: String,
    moodScore: Number,
    stressLevel: String,
    energyLevel: String,
    workload: String,
    personalityInsight: String,
    patterns: {
      strengths: [String],
      areasForGrowth: [String]
    },
    priorities: [String],
    suggestions: [{
      category: String,
      icon: String,
      text: String,
      priority: String
    }]
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Journal', journalSchema);
