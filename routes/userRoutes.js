const express = require('express');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController');

const { protect, restrictTo } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(protect, restrictTo('admin'), getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
