// // main in use before

// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// // Authentication middleware
// exports.authMiddleware = async (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(400).json({ message: 'Token is not valid' });
//   }
// };

// // Admin check middleware
// exports.adminMiddleware = async (req, res, next) => {
//   if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });
//   next();
// };







// // middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const protect = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (authHeader && authHeader.startsWith('Bearer')) {
//     try {
//       const token = authHeader.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select('-password');
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: 'Not authorized' });
//     }
//   } else {
//     return res.status(401).json({ message: 'No token provided' });
//   }
// };

// module.exports = { protect };






const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Authentication middleware
exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Get the token from the 'Authorization' header
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded data to req.user
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

// Admin check middleware
exports.adminMiddleware = async (req, res, next) => {
  // Check if user is an admin
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });

  // Proceed if the user is admin
  next();
};
