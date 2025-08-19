const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ✅ Define SuperAdmin Schema
const superAdminSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,   // store in lowercase for consistent login
    trim: true,        // remove leading/trailing whitespace
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    default: 'superadmin',
  },
}, {
  timestamps: true, // optional: adds createdAt and updatedAt
});

// ✅ Pre-save hook to hash password automatically
superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if changed
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Method to compare passwords
superAdminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    return false;
  }
};

// ✅ Export SuperAdmin model
module.exports = mongoose.model('SuperAdmin', superAdminSchema, 'superadmins');
