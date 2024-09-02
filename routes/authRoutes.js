const express = require('express');
const { signup, login, forgotPassword, resetPassowrd } = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassowrd);

module.exports = router;
