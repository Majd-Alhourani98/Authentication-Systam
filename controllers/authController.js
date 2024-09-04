const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const sendEmail = require('./../utils/email');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const generateVerificationCode = require('./../utils/generateVerificationCode');
const generateTokenAndSetCookie = require('./../utils/generateTokenAndSetCookie');

const filterData = (data, ...allowedFields) => {
  const obj = {};

  Object.keys(data).forEach(el => {
    if (allowedFields.includes(el)) obj[el] = data[el];
  });

  return obj;
};

// Signup handler
const signup = catchAsync(async (req, res, next) => {
  // Destructure request body for better readability
  const { name, email, password, passwordConfirm } = req.body;

  // check if the email already exist
  const isUserExist = await User.findOne({ email });
  if (isUserExist) return next(new AppError('User already exist', 400));

  // Create verification Token
  const verificationToken = generateVerificationCode();

  // Create a new user in the database
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
  });

  // Handle potential user creation errors
  if (!user) {
    return next(new AppError('Failed to create user. Please try again later.', 500));
  }

  // Remove sensitive data (password) from the response
  user.password = undefined;
  user.active = undefined;

  // generate token and set the cookie
  generateTokenAndSetCookie(res, user._id);

  // send verification email

  await sendEmail.sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully. Please check your email to verify your account.',
    data: { user },
  });
});

// Verifiy email
const verifyEamil = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gte: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired verification code'));

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save({ validateModifiedOnly: true });

  await sendEmail.sendWelcomeEmail(user.email, user.name);

  user.password = undefined;

  res.status(200).json({
    statuts: 'success',
    message: 'Email verified successfully',
    data: { user },
  });
});

// Login handler
const login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  // 1) Check id email and password exist
  if (!password || !email) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if the user exist && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isCorrectPassword(password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3) Send a repsonse with a token to the client
  sendTokenResponse(user, 200, res);
});

// Protect Middleware
const protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exist
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('You are not logged in! Please log in to get access', 401));

  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists
  const user = await User.findById(decoded.id);
  if (!user)
    return next(new AppError('The token belonging to this token does no longer exist', 401));

  // 4) Check if user changed password after the JWT was issued
  if (user.isPasswordChangedAfter(decoded.iat))
    return next(new AppError('User recently changed password! Plese log in again', 400));

  // Grant access to protected route
  req.user = user;
  next();
});

// Authroization Middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError(`You do not have permission to perform this action`, 403));

    next();
  };
};

// Forget Email
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Posted email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(`There is no user with email address.`, 404));

  // 2) Generate the random reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // validateModifiedOnly: false

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min',
      message,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError('There wan an Error sending the email. Try again later'));
  }
});

// Reset Token
const resetPassowrd = catchAsync(async (req, res, next) => {
  //  1) Get User based on the token
  let { resetToken } = req.params;
  const { password, passwordConfirm } = req.body;

  resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpiresAt: { $gte: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  // 2) if token has not expired, and there is user, set the new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  // 3) Update the changedPasswordAt property for the user. use pre save middleware :)

  user.password = undefined;
  user.passwordChangedAt = undefined;
  // 4) Log the user in, Send JWT
  sendTokenResponse(user, 200, res);
});

// Update Passwords
const updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, passwordConfirm } = req.body;

  // Get use ftom collection
  const user = await User.findById(req.user._id).select('+password');

  // Check if posted old password is correct
  if (!(await user.isCorrectPassword(oldPassword))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // update password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Update data
const updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user Post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /update-passowrd')
    );
  }

  const filteredData = filterData(req.body, 'name', 'email');

  // 2) Update user document
  const user = await User.findByIdAndUpdate(req.user.id, filteredData, {
    new: true,
    runValidators: true,
  });

  // 2) Update user document
  res.status(200).json({
    status: 'success',
  });
});

// Delete me
const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const logout = catchAsync(async (req, res, next) => {
  res.clearCookie('token');
  res.status(200).json({ status: 'success', message: 'Looged out successfully' });
});

module.exports = {
  login,
  signup,
  protect,
  updateMe,
  restrictTo,
  resetPassowrd,
  forgotPassword,
  updatePassword,
  deleteMe,
  verifyEamil,
  logout,
};
