const express = require('express');
const router = express.Router();
const { signup, login, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/auth/signup
// @desc    Register a new user (client)
// @access  Public
router.post('/signup', signup);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
