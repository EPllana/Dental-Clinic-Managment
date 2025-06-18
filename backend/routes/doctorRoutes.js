const express = require('express');
const router = express.Router();
const { getAvailableDoctors } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware'); // Optional: secure if only logged-in users can see doctors

// @route   GET api/doctors
// @desc    Get list of available doctors
// @access  Public or Private (based on authMiddleware usage)
router.get('/', authMiddleware, getAvailableDoctors); // Secured, requires login to see doctors

module.exports = router;
