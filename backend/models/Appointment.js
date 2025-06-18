const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientName: { // Denormalized for convenience
    type: String,
    required: true,
  },
  doctorId: { // This will be the User._id of the doctor
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorName: { // Denormalized for convenience
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  description: { // Reason for visit
    type: String,
    required: true,
  },
  symptomDetails: { // Optional detailed symptoms
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  notes: { // Optional notes by doctor or client
    type: String,
  },
  // You can add a field for who cancelled if needed: cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
