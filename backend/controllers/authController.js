
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UserRole } = require('../utils/enum');

// Signup new user (defaults to Client role for public registration)
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: UserRole.CLIENT, // Public signups are clients
    });

    await user.save();

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.status(201).json({ 
        token, 
        user: { _id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Signup server error:", error.stack); // Log full stack
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
    
    // Return a user object that frontend expects, excluding password
    res.json({ 
        token, 
        user: { _id: user.id, name: user.name, email: user.email, role: user.role, specialty: user.specialty }
    });

  } catch (error) {
    console.error("Login server error:", error.stack); // Log full stack
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is attached by authMiddleware
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Get current user server error:", error.stack); // Log full stack
    res.status(500).json({ message: 'Server error' });
  }
};
