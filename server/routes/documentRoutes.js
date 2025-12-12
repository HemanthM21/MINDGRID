// server/routes/documentRoutes.js

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  getStats
} = require('../controllers/documentController');

// ============================================
// PROTECTED ROUTES — ALL require authentication
// ============================================

router.use(protect);

/**
 * @route   GET /api/documents
 * @desc    Get all documents for the logged-in user
 * @access  Private
 */
router.get('/', getDocuments);

/**
 * @route   GET /api/documents/stats
 * @desc    Get document statistics
 * @access  Private
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document
 * @access  Private
 */
router.get('/:id', getDocument);

/**
 * @route   POST /api/documents/upload
 * @desc    Upload + OCR + AI analyze document
 * @access  Private
 */
router.post('/upload', upload.single('file'), uploadDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private
 */
router.delete('/:id', deleteDocument);

module.exports = router;
