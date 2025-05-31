// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  verificationCode: { type: String,},
  codeExpires: { type: Date,},
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.models.User || mongoose.model('User', userSchema);

