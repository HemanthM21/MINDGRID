// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { register, login, getMe, googleAuth, fixIndex } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user (alias for /register)
 * @access  Public
 */
router.post('/signup', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/google
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google', googleAuth);

/**
 * @route   GET /api/auth/fix-index
 * @desc    Drop problematic username_1 index
 * @access  Public
 */
router.get('/fix-index', fixIndex);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private (requires token)
 */
router.get('/me', protect, getMe);

module.exports = router;