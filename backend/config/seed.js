const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { UserRole } = require('../utils/enum'); // Define UserRole enum for backend

const DOCTOR_PROFILES = [
  { id: 'doc-admin', email: 'doctor@clinic.com', name: 'Dr. Admin (System)', specialty: 'System Administration', password: 'password123', isBookable: false },
  { id: 'doc1', email: 'dr.pllana@clinic.com', name: 'Dr. Pllana', specialty: 'General Dentistry', password: 'password123', isBookable: true },
  { id: 'doc2', email: 'dr.jones@clinic.com', name: 'Dr. Jones', specialty: 'Orthodontics', password: 'password123', isBookable: true },
  { id: 'doc3', email: 'dr.lee@clinic.com', name: 'Dr. Lee', specialty: 'Pediatric Dentistry', password: 'password123', isBookable: true },
];

const CLIENT_PROFILE = {
    email: 'client@example.com', name: 'Test Client', password: 'password123', role: UserRole.CLIENT
};


const seedDatabase = async () => {
  try {
    // Seed Doctors
    for (const docProfile of DOCTOR_PROFILES) {
      const existingUser = await User.findOne({ email: docProfile.email });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(docProfile.password, salt);
        
        await User.create({
          name: docProfile.name,
          email: docProfile.email,
          password: hashedPassword,
          role: UserRole.DOCTOR,
          specialty: docProfile.specialty,
          isBookable: docProfile.isBookable, // Set the isBookable flag
        });
        console.log(`User ${docProfile.name} seeded.`);
      } else {
        // Optionally update existing doctor's isBookable status if not set or different
        if (existingUser.role === UserRole.DOCTOR && existingUser.isBookable !== docProfile.isBookable) {
          existingUser.isBookable = docProfile.isBookable;
          existingUser.specialty = docProfile.specialty; // Also ensure specialty is up-to-date
          await existingUser.save();
          console.log(`User ${docProfile.name} updated with isBookable: ${docProfile.isBookable}.`);
        }
      }
    }

    // Seed Client
    const existingClient = await User.findOne({ email: CLIENT_PROFILE.email });
    if (!existingClient) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(CLIENT_PROFILE.password, salt);
        await User.create({
            name: CLIENT_PROFILE.name,
            email: CLIENT_PROFILE.email,
            password: hashedPassword,
            role: CLIENT_PROFILE.role,
        });
        console.log(`User ${CLIENT_PROFILE.name} seeded.`);
    }

    console.log('Database seeding check complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;