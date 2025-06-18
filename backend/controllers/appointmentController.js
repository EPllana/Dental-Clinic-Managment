const Appointment = require('../models/Appointment');
const User = require('../models/User'); // To get doctor details
const { UserRole } = require('../utils/enum');

// Create a new appointment
exports.createAppointment = async (req, res) => {
  const { doctorId, doctorName, dateTime, description, symptomDetails } = req.body;
  const clientId = req.user.userId; // From authMiddleware

  try {
    const client = await User.findById(clientId);
    if (!client) {
        return res.status(404).json({ message: 'Client not found' });
    }
    
    // Validate doctorId actually corresponds to a doctor user (optional, but good practice)
    const doctor = await User.findOne({ _id: doctorId, role: UserRole.DOCTOR });
    if (!doctor) {
        return res.status(404).json({ message: 'Selected doctor not found or is not a doctor.' });
    }

    const newAppointment = new Appointment({
      clientId,
      clientName: client.name, // Get client name from logged-in user
      doctorId, // This is the User._id of the doctor
      doctorName: doctor.name, // Use the name from the found doctor User document
      dateTime,
      description,
      symptomDetails,
      status: 'pending',
    });

    const appointment = await newAppointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error while creating appointment');
  }
};

// Get appointments for the logged-in client
exports.getClientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.user.userId }).sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Get appointments for the logged-in doctor
// (For admin doctor, show all; for specific doctor, show theirs)
exports.getDoctorAppointments = async (req, res) => {
  try {
    let appointments;
    // Assuming 'doc-admin' is a known admin doctor's email or a special ID in user object
    const doctorUser = await User.findById(req.user.userId);

    // Check if the logged-in doctor is the special "admin" doctor by checking their email or a specific flag.
    // For simplicity, using a hardcoded email for the admin doctor check.
    // In a real app, this might be a specific role or flag on the user model.
    if (doctorUser && doctorUser.email === 'doctor@clinic.com') { 
      appointments = await Appointment.find().sort({ dateTime: -1 });
    } else {
      appointments = await Appointment.find({ doctorId: req.user.userId }).sort({ dateTime: -1 });
    }
    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Update appointment status (by doctor)
exports.updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  const appointmentId = req.params.id;
  const doctorUserId = req.user.userId;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization: Only the assigned doctor or an admin doctor can update status
    const doctorUser = await User.findById(doctorUserId);
    if (appointment.doctorId.toString() !== doctorUserId && doctorUser.email !== 'doctor@clinic.com') {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }
    
    // Validate status
    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid appointment status.'});
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Appointment not found (invalid ID format)' });
    }
    res.status(500).send('Server error');
  }
};

// Cancel an appointment (by client)
exports.cancelClientAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const clientId = req.user.userId;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.clientId.toString() !== clientId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Clients can only cancel 'pending' or 'confirmed' appointments
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return res.status(400).json({ message: `Cannot cancel appointment with status: ${appointment.status}` });
    }

    appointment.status = 'cancelled';
    // appointment.cancelledBy = clientId; // Optional: track who cancelled
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(error.message);
     if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Appointment not found (invalid ID format)' });
    }
    res.status(500).send('Server error');
  }
};
