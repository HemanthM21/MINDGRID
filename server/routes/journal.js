const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const Task = require('../models/Task');
const { analyzeJournalEntry, generateTasksFromJournal } = require('../services/aiService');
const { protect } = require('../middleware/auth'); // FIXED

// Create a new journal entry with AI analysis and Task Generation
router.post('/create', protect, async (req, res) => {
    try {
        const { content, quickMood, date } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Journal content is required' });
        }

        const aiAnalysis = await analyzeJournalEntry(content);
        const taskData = await generateTasksFromJournal(content);

        const createdTasks = [];

        if (taskData?.tasks?.length) {
            for (const task of taskData.tasks) {
                const newTask = new Task({
                    title: task.task,
                    description: `Generated from journal: ${task.reason || 'AI Insight'}`,
                    priority: task.priority?.toUpperCase() || 'MEDIUM',
                    status: 'PENDING',
                    dueDate: task.dueDate ? new Date(task.dueDate) : null,
                    createdBy: req.user.id,
                    source: 'ai'
                });
                await newTask.save();
                createdTasks.push(newTask);
            }
        }

        const journal = new Journal({
            text: content,
            quickMood: quickMood || null,
            aiAnalysis,
            createdBy: req.user.id,
            createdAt: date || new Date()
        });

        await journal.save();

        res.status(201).json({
            message: 'Journal entry created successfully',
            journal,
            aiAnalysis,
            generatedTasks: createdTasks
        });

    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ error: 'Failed to create journal entry' });
    }
});

// Analyze journal content without saving
router.post('/analyze', protect, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Journal content is required' });
        }

        const aiAnalysis = await analyzeJournalEntry(content);

        if (!aiAnalysis) {
            return res.status(500).json({ error: 'AI analysis failed' });
        }

        res.status(200).json(aiAnalysis);

    } catch (error) {
        console.error('Error analyzing journal:', error);
        res.status(500).json({ error: 'Failed to analyze journal entry' });
    }
});

// Get all journal entries
router.get('/entries', protect, async (req, res) => {
    try {
        const journals = await Journal.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(journals);

    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
});

// Get specific journal entry
router.get('/entries/:id', protect, async (req, res) => {
    try {
        const journal = await Journal.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!journal) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }

        res.status(200).json(journal);

    } catch (error) {
        console.error('Error fetching journal entry:', error);
        res.status(500).json({ error: 'Failed to fetch journal entry' });
    }
});

// Delete journal entry
router.delete('/entries/:id', protect, async (req, res) => {
    try {
        const journal = await Journal.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!journal) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }

        res.status(200).json({ message: 'Journal entry deleted successfully' });

    } catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ error: 'Failed to delete journal entry' });
    }
});

module.exports = router;
