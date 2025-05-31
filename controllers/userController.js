const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// REGISTER USER
exports.registerUser = [
  // 🛡️ Validation & sanitization
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

      const newUser = new User({
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
        codeExpires,
      });

      await newUser.save();

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"BookStore Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>📧 Verify Your Email</h2>
            <p>Use the 4-digit code below to verify your account:</p>
            <div style="font-size: 28px; font-weight: bold; margin: 20px 0;">${verificationCode}</div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json({ message: 'Verification code sent to your email. Please check and verify.' });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Error registering user' });
    }
  }
];

// LOGIN USER
exports.loginUser = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          name: user.name || '',
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Internal server error during login.' });
    }
  }
];

// VERIFY USER CODE
exports.verifyUser = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('code').isLength({ min: 4, max: 4 }).withMessage('Code must be 4 digits'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, code } = req.body;

    console.log("Incoming verification:", req.body);

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
      if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

      if (user.verificationCode !== code) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      if (user.codeExpires < new Date()) {
        return res.status(400).json({ message: 'Verification code expired' });
      }

      user.isVerified = true;
      user.verificationCode = undefined;
      user.codeExpires = undefined;
      await user.save();

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ message: 'Email verified successfully', token });
    } catch (err) {
      console.error('Verification error:', err);
      res.status(500).json({ message: 'Error verifying email' });
    }
  }
];

// Get profile of logged-in user
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name?.trim() || user.name;
    user.email = req.body.email?.trim() || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};



















// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user');
// const nodemailer = require('nodemailer');
// require('dotenv').config();
// const { authMiddleware } = require('../middleware/auth');

// // REGISTER USER
// exports.registerUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: 'User already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate 4-digit verification code
//     const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
//     const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

//     const newUser = new User({
//       email,
//       password: hashedPassword,
//       isVerified: false,
//       verificationCode,
//       codeExpires,
//     });

//     await newUser.save();

//     // Email transporter setup
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"BookStore Admin" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Your Email Verification Code',
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px;">
//           <h2>📧 Verify Your Email</h2>
//           <p>Use the 4-digit code below to verify your account:</p>
//           <div style="font-size: 28px; font-weight: bold; margin: 20px 0;">${verificationCode}</div>
//           <p>This code will expire in 10 minutes.</p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({ message: 'Verification code sent to your email. Please check and verify.' });
//   } catch (err) {
//     console.error('Registration error:', err);
//     res.status(500).json({ message: 'Error registering user' });
//   }
// };


// // LOGIN USER
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required.' });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password.' });
//     }

//     if (!user.isVerified) {
//       return res.status(403).json({ message: 'Please verify your email before logging in.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid email or password.' });
//     }

//     const token = jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         isAdmin: user.isAdmin,
//         isVerified: user.isVerified,
//         name: user.name || '',
//       },
//     });
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ message: 'Internal server error during login.' });
//   }
// };




// // VERIFY USER CODE
// exports.verifyUser = async (req, res) => {
//   const { email, code } = req.body;

//   // In verifyUser controller
// console.log("Incoming verification:", req.body);


//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });
//     if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

//     if (user.verificationCode !== code) {
//       return res.status(400).json({ message: 'Invalid verification code' });
//     }

//     if (user.codeExpires < new Date()) {
//       return res.status(400).json({ message: 'Verification code expired' });
//     }

//     user.isVerified = true;
//     user.verificationCode = undefined;
//     user.codeExpires = undefined;
//     await user.save();

//     const token = jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({ message: 'Email verified successfully', token });
//   } catch (err) {
//     console.error('Verification error:', err);
//     res.status(500).json({ message: 'Error verifying email' });
//   }
// };



// // extra dip
// // Get profile of logged-in user
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching profile' });
//   }
// };



// // controllers/userController.js (continued)

// exports.updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;

//     // Optional: Update password if provided
//     if (req.body.password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(req.body.password, salt);
//     }

//     const updatedUser = await user.save();
//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isAdmin: updatedUser.isAdmin,
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating profile' });
//   }
// };
