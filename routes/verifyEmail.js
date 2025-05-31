exports.verifyUser = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.verificationCode !== code)
      return res.status(400).json({ message: 'Invalid verification code' });

    if (user.codeExpires < new Date())
      return res.status(400).json({ message: 'Verification code expired' });

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
};




// // Verify email
// exports.verifyEmail = async (req, res) => {
//     const { token } = req.params;
  
//     try {
//       // Verify the token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id);
  
//       if (!user) {
//         return res.status(400).json({ message: 'User not found' });
//       }
  
//       // Check if already verified
//       if (user.isVerified) {
//         return res.status(400).json({ message: 'Email is already verified' });
//       }
  
//       // Update user as verified
//       user.isVerified = true;
//       await user.save();
  
//       res.status(200).json({ message: 'Email verified successfully' });
//     } catch (err) {
//       res.status(500).json({ message: 'Error verifying email' });
//     }
//   };
  