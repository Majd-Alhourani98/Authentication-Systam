const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { select } = require('underscore');

// Define the User Schema
const userSchema = new mongoose.Schema({
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
    select: false, // to omit the password from the output when we retrive the data.
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
});

// Pre-save middleware to encrypt the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // calling the next middleware  if the password is unchanged

  this.password = await bcrypt.hash(this.password, 10); // Hash the password
  this.passwordConfirm = undefined; // Remove the password confirmation field

  next();
});

// an instance method to Sign a token
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;

/* 
1. User Schema Explanation:
  - `name`: This field is a string representing the user's name. It is marked as required,
    so the user must provide a name when creating a document. If not provided,
    a custom error message "Please tell us your name!" will be displayed.

  - `email`: This field stores the user's email address as a string. It is required and
    must be unique in the database. The email is automatically converted to lowercase
    to maintain consistency. The `validate` option uses the `validator.isEmail` method
    to ensure that the email is in a valid format. Alternatively, you can use the 
    match option with a regular expression to perform the validation.

  - `photo`: This optional field stores the URL or path of the user's photo as a string.

  - `password`: This required field stores the user's password as a string. It must be
    at least 8 characters long. A custom error message "Please provide a password"
    will be displayed if this field is missing.

  - `passwordConfirm`: This required field stores the confirmation of the user's password 
    as a string. It ensures that the user enters the correct password twice. A custom 
    error message "Please confirm your password" will be displayed if this field is missing.
    Custom validation only works on `.save()` and `.create()`. So When updating a user, always use 
    `.save()` to trigger validation NOT `.findByIdAndUpdate()`.

2. Alternative Email Validation:
  - You can use the `match` option with a regular expression to validate the email format 
    instead of using the validator library. The regex provided checks for a typical email pattern,
    ensuring that the email has valid characters and structure.

    Example regex to validate email: `^[\w\.-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$`

3. Encrypt Password Middleware:
  - This is a pre-save middleware that runs before saving the document to the database. It checks if the  
    password was modified or new and, if so, hashes the password using bcrypt. It then removes the `passwordConfirm`  field to ensure that it is not persisted in the database. required means that it is a required input, not that it is required to actually be presisted in the database


  
4. General Note:
  - The pre-save middleware is a good example of the principle "Fat Model, Thin Controller," 
    where complex logic is kept within the model rather than scattered throughout the application.
*/

/* 

! Genreal Notes 
- In the pre-save middleware, this refers to the current document being processed.

- The isModified method checks whether a specific field, such as the password, has been modified or if it is  being created for the first time.

- Salt is a random value added to a password before hashing to make each hash unique, even for identical passwords. This prevents attacks like dictionary or rainbow table attacks. A larger salt increases security but makes the hashing process more CPU-intensive, as it requires more computation to generate and verify the hash.

- In Mongoose, userSchema.methods.<functionName> is a method added to the schema that can be called on any instance (document) of the model created from that schema.

- Inside an instance method in Mongoose, the this keyword refers to the current document (instance) on which the method is being called.
*/
