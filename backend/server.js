
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./config/seed');

const jwtSecret = process.env.JWT_SECRET;


const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();

// Connect Database
connectDB().then(() => {
  // Seed database after connection is established
  console.log("Database connected. Attempting to seed database...");
  seedDatabase().catch(err => {
    console.error("Error during database seeding:", err);
    // Depending on the importance of seeding, you might want to process.exit(1) here
  });
}).catch(err => {
    // This catch block might be redundant if connectDB already exits process,
    // but it's here for clarity if connectDB's behavior changes.
    console.error("Failed to connect to DB, server will likely not operate correctly or start.", err);
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);

// Simple test route
app.get('/api/test', (req, res) => res.json({ msg: 'Backend API is running' }));


// Error Handling Middleware (optional basic example)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: 'Something broke on the server!'});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
