const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Find user by credentials (username, email, or NIC)
const findUserByCredentials = async (username) => {
  return await User.findOne({
    $or: [
      { username: username },
      { email: username },
      { nic: username }
    ]
  });
};

// Validate user login
const validateLogin = async (username, password) => {
  const user = await findUserByCredentials(username);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user.isLocked()) {
    throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
};

// Check if user exists
const checkUserExists = async (username, email, nic) => {
  const existingUser = await User.findOne({
    $or: [
      { username },
      { email },
      { nic }
    ]
  });

  return existingUser;
};

// Create new admin
const createAdmin = async (userData) => {
  const admin = new User({
    ...userData,
    role: 'admin'
  });

  await admin.save();
  return admin;
};

// Create new user
const createUser = async (userData) => {
  const email = userData.email && userData.email.trim() !== ''
    ? userData.email
    : `${userData.nic}@noemail.local`;

  const user = new User({
    username: userData.nic, // NIC as username
    email,
    nic: userData.nic,
    phoneNo: userData.phoneNo,
    password: userData.phoneNo, // Phone number as password
    role: 'user'
  });

  await user.save();
  return user;
};

// Get users with pagination and filters
const getUsersWithFilters = async (query, page = 1, limit = 10) => {
  const users = await User.find(query)
    .select('-password -loginAttempts -lockUntil')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

// Update user
const updateUserById = async (userId, updateData) => {
  // Remove sensitive fields from update
  delete updateData.password;
  delete updateData.role;
  delete updateData.loginAttempts;
  delete updateData.lockUntil;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -loginAttempts -lockUntil');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Deactivate user
const deactivateUserById = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  ).select('-password -loginAttempts -lockUntil');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

module.exports = {
  generateToken,
  findUserByCredentials,
  validateLogin,
  checkUserExists,
  createAdmin,
  createUser,
  getUsersWithFilters,
  updateUserById,
  deactivateUserById
}; 