const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

// these controller are private for the admin use only

// Get All users: Retrieves all users from the database using User.find() and returns them in the response.
const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    result: users.length,
    data: { users },
  });
});

// Get User: Retrieves a user by their ID using User.findById(id). If no user is found, an error is thrown using AppError.
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

// Create User: Creates a new user in the database with data from req.body using User.create().
const createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

// Update User: Updates an existing user by ID using User.findByIdAndUpdate(). Takes the user ID and updated data, and options { new: true, runValidators: true } to return the updated document and run schema validators.
// If no user is found, an error is thrown using AppError.
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

// Delete User: Deletes a user by ID using User.findByIdAndDelete().
// If no user is found, an error is thrown using AppError.
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
