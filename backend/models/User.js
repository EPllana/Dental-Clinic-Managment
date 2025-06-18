const mongoose = require('mongoose');
const { UserRole } = require('../utils/enum'); // Define UserRole enum for backend

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CLIENT,
  },
  specialty: { // For doctors
    type: String,
    required: function() { return this.role === UserRole.DOCTOR; }
  },
  isBookable: { // For doctors, to appear in booking lists
    type: Boolean,
    default: function() { return this.role === UserRole.DOCTOR ? true : undefined; }, // Default to true for doctors
    required: function() { return this.role === UserRole.DOCTOR; }
  }
  // doctorId: { // Could be used to store a custom/legacy doctor ID if needed, e.g., 'doc1'
  //   type: String,
  //   unique: true,
  //   sparse: true, // Allows null/undefined for non-doctors or doctors without this specific ID
  //   required: false
  // }
  // Add other fields as necessary, e.g., phone number, address
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);