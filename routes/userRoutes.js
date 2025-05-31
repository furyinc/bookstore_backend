const express = require('express');
const { registerUser, loginUser, verifyUser, getProfile, updateProfile } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth'); // ✅ This line was missing

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyUser);

// fuck this
router.get('/me', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;