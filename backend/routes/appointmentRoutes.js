const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getClientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelClientAppointment,
} = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { UserRole } = require('../utils/enum'); // Define UserRole enum for backend
const roleMiddleware = require('../middleware/roleMiddleware');


// @route   POST api/appointments
// @desc    Create a new appointment (by client)
// @access  Private (Client)
router.post('/', authMiddleware, roleMiddleware([UserRole.CLIENT]), createAppointment);

// @route   GET api/appointments/client
// @desc    Get appointments for the logged-in client
// @access  Private (Client)
router.get('/client', authMiddleware, roleMiddleware([UserRole.CLIENT]), getClientAppointments);

// @route   GET api/appointments/doctor
// @desc    Get appointments for the logged-in doctor
// @access  Private (Doctor)
router.get('/doctor', authMiddleware, roleMiddleware([UserRole.DOCTOR]), getDoctorAppointments);

// @route   PATCH api/appointments/:id/status
// @desc    Update appointment status (by doctor)
// @access  Private (Doctor)
router.patch('/:id/status', authMiddleware, roleMiddleware([UserRole.DOCTOR]), updateAppointmentStatus);

// @route   PATCH api/appointments/:id/cancel
// @desc    Cancel an appointment (by client)
// @access  Private (Client)
router.patch('/:id/cancel', authMiddleware, roleMiddleware([UserRole.CLIENT]), cancelClientAppointment);

module.exports = router;
