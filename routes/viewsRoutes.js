const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('./../controllers/authController');

router.use(isLoggedIn);

router.get('/', (req, res, next) => {
  res.status(200).render('index');
});

router.get('/register', (req, res, next) => {
  res.status(200).render('register');
});

router.get('/login', (req, res, next) => {
  res.status(200).render('login');
});

router.get('/profile', (req, res, next) => {
  res.status(200).render('profile');
});

module.exports = router;
