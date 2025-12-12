const Task = require('../models/Task');
const aiService = require('../services/aiService');
const Journal = require('../models/Journal');

async function createTask(req, res, next) {
  try {
    const data = req.body || {};
    if (!data.title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
      priority: data.priority || 'MEDIUM',
      status: data.status || 'PENDING',
      createdBy: (req.user && req.user._id) || data.createdBy || null,
      source: data.source || 'user'
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
}

async function getTasks(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status.toUpperCase();
    if (req.query.priority) filter.priority = req.query.priority.toUpperCase();

    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const updates = req.body || {};
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function generateTasks(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Provide text to analyze' });
    }

    const analysis = await aiService.analyzeDocument(text);

    // Create a simple task suggestion based on the analysis
    const suggested = {
      title: analysis.summary || 'Review document',
      description: `Auto-generated task based on document analysis. Provider: ${analysis.provider || 'N/A'}. ID: ${analysis.idNumber || 'N/A'}`,
      dueDate: analysis.dueDate || analysis.expiryDate || null,
      priority: (analysis.priority || 'MEDIUM'),
      source: 'ai'
    };

    const created = await Task.create({
      title: suggested.title,
      description: suggested.description,
      dueDate: suggested.dueDate,
      priority: suggested.priority,
      source: 'ai',
      createdBy: (req.user && req.user._id) || null
    });

    res.status(201).json({ success: true, created, analysis });
  } catch (err) {
    next(err);
  }
}

// Generate tasks from journal/thoughts input
async function generateTasksFromJournal(req, res, next) {
  try {
    const { journalText } = req.body;
    if (!journalText || journalText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide your thoughts or journal entry' });
    }

    console.log('📝 Received journal text, analyzing...');
    
    // Use AI to extract tasks from journal
    const aiResult = await aiService.generateTasksFromJournal(journalText);

    console.log('✅ AI result received:', aiResult);

    // Return preview of tasks with follow-up questions and journal analysis
    res.status(200).json({
      success: true,
      preview: {
        tasks: aiResult.tasks || [],
        followUpQuestions: aiResult.followUpQuestions || [],
        summary: aiResult.summary || '',
        mood: aiResult.mood || null,
        priorities: aiResult.priorities || [],
        stressFactors: aiResult.stressFactors || [],
        importantEvents: aiResult.importantEvents || []
      }
    });
  } catch (err) {
    console.error('❌ Error in generateTasksFromJournal:', err.message);
    // Don't call next(err) - return error response instead to avoid 500
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to analyze journal'
    });
  }
}

// Confirm and create the AI-suggested tasks
async function confirmAndCreateTasks(req, res, next) {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: 'No tasks to create' });
    }

    const createdTasks = [];

    for (const task of tasks) {
      if (!task.title || task.title.trim().length === 0) continue;

      const created = await Task.create({
        title: task.title,
        description: task.description || null,
        dueDate: task.dueDate || null,
        priority: task.priority || 'MEDIUM',
        status: 'PENDING',
        createdBy: (req.user && req.user._id) || null,
        source: 'ai'
      });

      createdTasks.push(created);
    }

      // Optionally persist the original journal text or AI analysis if provided
      if (req.body.journalText && typeof req.body.journalText === 'string') {
        try {
          const j = await Journal.create({
            text: req.body.journalText,
            summary: req.body.summary || null,
            mood: req.body.mood || null,
            priorities: req.body.priorities || [],
            stressFactors: req.body.stressFactors || [],
            importantEvents: req.body.importantEvents || [],
            createdBy: (req.user && req.user._id) || null
          });
          // attach created journal id to response for client
          req.createdJournal = j;
        } catch (je) {
          console.warn('Failed to persist journal:', je.message);
        }
      }
    res.status(201).json({
      success: true,
      message: `${createdTasks.length} tasks created from journal`,
      tasks: createdTasks
    });
  } catch (err) {
    next(err);
  }
}

// Clarify journal with user answers and re-run AI to refine tasks
async function clarifyJournal(req, res, next) {
  try {
    const { journalText, answers } = req.body;
    if (!journalText || typeof journalText !== 'string') {
      return res.status(400).json({ success: false, message: 'journalText is required' });
    }

    // answers: [{question, answer}, ...]
    const aiResult = await aiService.generateTasksFromClarifiedJournal(journalText, answers || []);

    res.status(200).json({
      success: true,
      preview: {
        tasks: aiResult.tasks || [],
        followUpQuestions: aiResult.followUpQuestions || [],
        summary: aiResult.summary || '',
        mood: aiResult.mood || null,
        priorities: aiResult.priorities || [],
        stressFactors: aiResult.stressFactors || [],
        importantEvents: aiResult.importantEvents || []
      }
    });
  } catch (err) {
    next(err);
  }
}

async function dashboardSummary(req, res, next) {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: 'COMPLETED' });
    const pending = await Task.countDocuments({ status: 'PENDING' });
    const highPriority = await Task.countDocuments({ priority: 'HIGH' });

    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = await Task.find({ dueDate: { $gte: now, $lte: in7 } }).sort({ dueDate: 1 }).limit(10);

    // Include recent journals (last 5)
    let recentJournals = [];
    try {
      recentJournals = await Journal.find().sort({ createdAt: -1 }).limit(5).select('text summary mood priorities createdAt');
    } catch (je) {
      console.warn('Failed to load recent journals:', je.message);
    }

    res.json({ success: true, summary: { total, completed, pending, highPriority, upcoming, recentJournals } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  generateTasks,
  generateTasksFromJournal,
  clarifyJournal,
  confirmAndCreateTasks,
  dashboardSummary
};
