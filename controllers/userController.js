const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

// Get All users
const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    result: users.length,
    data: { users },
  });
});

// Get User
const getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user)
    return next(new AppError(`User not found. No user exists with the provided ID: ${id}.`, 404));

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Create User
const createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

// Update User
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user)
    return next(new AppError(`User not found. No user exists with the provided ID: ${id}.`, 404));

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// Delete User
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user)
    return next(new AppError(`User not found. No user exists with the provided ID: ${id}.`, 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
