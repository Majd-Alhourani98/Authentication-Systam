const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassowrd,
  updatePassword,
  updateMe,
  deleteMe,
  verifyEamil,
} = require('./../controllers/authController');

const { protect } = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEamil);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:resetToken', resetPassowrd);
router.patch('/update-password', protect, updatePassword);
router.patch('/update-me', protect, updateMe);
router.delete('/delete-me', protect, deleteMe);

module.exports = router;
