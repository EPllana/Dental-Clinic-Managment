const User = require('../models/User');
const { UserRole } = require('../utils/enum');

// Get list of available doctors
exports.getAvailableDoctors = async (req, res) => {
  try {
    // Fetch users with the role of DOCTOR and are bookable
    // Select only necessary fields to send to frontend (name, specialty, _id as their doctor ID)
    const doctors = await User.find({ 
      role: UserRole.DOCTOR,
      isBookable: true // Only fetch doctors who are marked as bookable
    }).select('name specialty'); // _id is included by default
    
    // The current frontend AppointmentForm expects objects with _id, name, specialty.
    // User model already has these if role is doctor.
    res.json(doctors);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error while fetching doctors');
  }
};