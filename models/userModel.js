const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },

    photo: String, // Optional field for user photo

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: 8,
      select: false, // to omit the password from the output when we retrive the data. but when we creat a new document it be in the output
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Passwords are not the same',
      },
    },

    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    lastLoginAt: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: Date,

    // password reset token fields
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date,

    // Verify accounts fields
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to encrypt the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // calling the next middleware  if the password is unchanged

  this.password = await bcrypt.hash(this.password, 10); // Hash the password
  this.passwordConfirm = undefined; // Remove the password confirmation field

  next();
});

// A pre save middleware to update the passwordChangedAt field
userSchema.pre('save', function (next) {
  // Note: when we create a new document we modify the document.
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now();

  next();
});

// Remove inActive user from the output
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// an instance method to Sign a token
// userSchema.methods.generateToken = function () {
//   return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// an instance method to checks the passwords
userSchema.methods.isCorrectPassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// an instance method to check if the user change his password after the the token is issued
userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt)
    return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > JWTTimestamp;

  return false;
};

// an instance method to generete a password reset Token

userSchema.methods.generatePasswordResetToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // encode the token
  const hashedPasswordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // save the token and the expiry date of that token in the database
  this.passwordResetToken = hashedPasswordResetToken;
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;

// timestamps: true: createdat and updatedat fields will be automatically added into the document
