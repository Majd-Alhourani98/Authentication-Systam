const mongoose = require('mongoose');
const validator = require('validator');

// Define the User Schema
const userSchema = new mongoose.Schema({
  // Name Field
  name: {
    type: String,
    required: [true, 'Please tell us you name!'],
  },

  // Email field
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  // Photo field
  photo: String,

  // Password field
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
  },

  // Password confirmation field
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
});

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;

/* 
* User Schema Explanation:
  - name: This field is a string representing the user's name. It is marked as required, 
    so the user must provide a name when creating a document. If not provided, 
    a custom error message "Please tell us your name!" will be displayed.

  - email: This field stores the user's email address as a string. It is required and 
    must be unique in the database. The email is automatically converted to lowercase 
    to maintain consistency. The validate option uses the validator.isEmail method 
    to ensure that the email is in a valid format. Alternatively, you can use the 
    match option with a regular expression to perform the validation.

  - photo: This optional field stores the URL or path of the user's photo as a string.

  - password: This required field stores the user's password as a string. It must be 
    at least 8 characters long. A custom error message "Please provide a password" 
    will be displayed if this field is missing.

  - passwordConfirm: This required field stores the confirmation of the user's password 
    as a string. It ensures that the user enters the correct password twice. A custom 
    error message "Please confirm your password" will be displayed if this field is missing.

  - Alternative Email Validation: You can use the match option with a regular expression 
    to validate the email format instead of using the validator library. The regex provided 
    checks for a typical email pattern, ensuring that the email has valid characters and structure.



   Regex to validate email:  ^[\w\.-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$
   match[^[\w\.-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$, 'Please provide a valid email']


*/
