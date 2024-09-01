const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const singup = catchAsync(async (req, res, next) => {});
const login = catchAsync(async (req, res, next) => {});
const protect = catchAsync(async (req, res, next) => {});
const restrictTo = catchAsync(async (req, res, next) => {});
const forgotPassword = catchAsync(async (req, res, next) => {});
const resetPassowrd = catchAsync(async (req, res, next) => {});

module.exports = {
  singup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassowrd,
};

// const user = await User.create(req.body); //
// res.status(201).json({
//   status: 'success',
//   data: { user },
// });
