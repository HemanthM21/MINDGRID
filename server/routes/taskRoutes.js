const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// ========== GET ROUTES ==========
router.get('/', taskController.getTasks);
router.get('/dashboard/summary', taskController.dashboardSummary);
router.get('/:id', taskController.getTaskById);

// ========== POST ROUTES (specific before generic) ==========
router.post('/generate', protect, taskController.generateTasks);
router.post('/ai-journal', protect, taskController.generateTasksFromJournal);
router.post('/ai-journal/confirm', protect, taskController.confirmAndCreateTasks);
// Clarify follow-up answers and refine AI suggestions
router.post('/ai-journal/clarify', protect, taskController.clarifyJournal);
router.post('/', taskController.createTask);

// ========== PUT ROUTES ==========
router.put('/:id', protect, taskController.updateTask);

// ========== DELETE ROUTES ==========
router.delete('/:id', protect, taskController.deleteTask);

module.exports = router;
