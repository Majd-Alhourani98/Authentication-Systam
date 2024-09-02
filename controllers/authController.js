const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const { promisify } = require('util');

const signup = catchAsync(async (req, res, next) => {
  // Destructure request body for better readability
  const { name, email, password, passwordConfirm } = req.body;

  // Create a new user in the database
  const user = await User.create({ name, email, password, passwordConfirm });

  // Handle potential user creation errors
  if (!user) {
    return next(new AppError('User creation failed', 500));
  }

  // Generate a new JWT token for the user
  const token = user.generateToken();

  // Remove sensitive data (password) from the response
  user.password = undefined;

  // Send a repsonse with a token and user data to the client
  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  // 1) Check id email and password exist
  if (!password || !email) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if the user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  const isCorrectPassword = await user.isCorrectPassword(password);
  if (!user || !isCorrectPassword) return next(new AppError('Incorrect email or password', 401));

  // 3) Send a repsonse with a token to the client
  const token = user.generateToken();

  res.status(200).json({
    status: 'success',
    token,
  });
});

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

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError(`You do not have permission to perform this action`, 403));

    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {});
const resetPassowrd = catchAsync(async (req, res, next) => {});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassowrd,
};

//
//
//
//
//
//

/* 
! Theroy: How Authentication with JWT Works 
  * Authentication: 
  1. Client Sends Request: The user sends a POST request to the server with their email and password.

  2. Server Verifies Credentials: The server checks if the user exists and whether the provided password is correct. If both are valid, the server generates a unique JSON Web Token (JWT) for that user using a secret key stored on the server. The JWT is an encoded string.

  3. Server Sends JWT to Client: The server sends the generated JWT back to the client.

  4. Client Stores JWT: The client stores the JWT, either in a cookie or in local storage. This allows the user to remain authenticated without the server needing to store any session state. The server does not keep track of which users are logged in; it is the client that knows it is authenticated because it holds a valid JWT.

  * Accessing 
  5. Client Requests Access to Protected Routes: Whenever the user wants to access a protected route, like their profile data, the client sends the stored JWT along with the request—similar to showing a passport to access a restricted area.

  6. Server Verifies JWT: Upon receiving the request, the server verifies the JWT to check if it is valid and that the user is indeed who they claim to be.

  7. Server Sends Response: If the JWT is valid, the server sends the requested data to the client. If it is not, the server responds with an error, indicating that the user is not authorized to access the resource. This process repeats every time the user requests data from any protected route while logged in.

*/

/* 
! Theroy: How JWT Actually Works 
 A JWT is composed of three parts and looks something like this:
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

  1. Header: contains metadata about the token, such as signing algorithm used. 
  2. Payload: COntains the data we want to encode into the token, such as the user's Id
  3. Signature: This part is genreated using the header payload, and the secret key stored on the server, it ensure the integrity and authenticity of the token. 

  (Header + PlayLoad) + secret => signature 
  (Header + Playload) + signature => JWT

  Note: Jwts are encoded, not encrypted, This means that anyone can decode and read them, but this is not a security issue becuase the signature ensures that the token has not been tampered with. 

! Theroy: JWT Signing Process 
  1. Creating the Signature: The signing algorithm takes the header, payload, and secret to create a unique signature.

  2. Forming the JWT: The header, payload, and signature together form the complete JWT, which is then sent to the client.

  3. Verification on the Server: When the server receives a JWT for accessing a protected route, it verifies the token to ensure that the user is who they claim to be. This is done by recreating the signature using the token's header and payload along with the server's secret key.

  * Validation Process:
    1. The server extracts the header and payload from the JWT and combines them with the secret key to generate a "test" signature.

    2. The server then compares this test signature with the original signature that was generated when the JWT was first created.

    3.If the test signature matches the original, it confirms that the header and payload have not been modified, meaning the user is authenticated. If they do not match, the user is denied access because the token is considered invalid.

    to start using JWT in your application you need to install it:
    `npm i jsonwebtoken`

  
    * Practical Details 
    - to sign a token use the .sign method that take (payload(data), secret, options(optional))
    - note: the serect must be at least 32 characters long and the longer is better 
    - in the options object you can specify the expireIn. and this means that after the time that we are going pass in the expireIn. the JWT is no longer going to be valid. 
*/
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* 
! Signup: 
  * Notes:
  Avoid using this approach for user creation:
    - const user = await User.create(req.body);
  This method is insecure as it allows users to set fields like role (e.g., as 'admin') directly from the request body, which can lead to security issues.

  Instead, use the following approach to ensure only the necessary fields are set:
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });

  This way, users cannot manipulate fields like role during registration.

  - we use a pre-save middlware to hash the password.

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
! Login: 
- the concpet of logging user in is bascially to sign a JSON web token and send it back to the client, abut in this case we only issue the token in case that the user actually exists and that password is correct  

- The POST method is used for login functionality, even though it doesn’t create a new resource, because it involves sending sensitive data (like user credentials) through the request body (req.body). The POST method is designed to handle such operations securely and is suitable for actions that involve data submission, including authentication processes.


- In the User model, the password field is set to select: false by default, which means it is not included in query results to enhance security. However, when you need to access the password field explicitly—such as for authentication or comparison—you must explicitly select it using .select('+password').

- to compare a password with the hashed password stored in the database, your should hash the password then compare it with the hashed password sotred in the database. 


- the following logic have an issue:
    const user = await User.findOne({ email }).select('+password');
    const isCorrectPassword = await user.isCorrectPassword(password);
    if (!user || !isCorrectPassword) return next(new AppError('Incorrect email or password', 401));

   *  if there is no user. calling isCorrectPassword() on null, will give us an error. to avoid this problem we have the following solution:

      const user = await User.findOne({ email }).select('+password');
      if (!user) return next(new AppError('Incorrect email or password', 401));
      const isCorrectPassword = await user.isCorrectPassword(password);
      if (!isCorrectPassword) return next(new AppError('Incorrect email or password', 401));

   *  but we can make it better then that:
      if(!user || !(await user.isCorrectPassword(password)){
      return next(new AppError('Incorrect email or password', 401)); // 401 means an authorized
      }


      Note: Do not send a message indicating whether the email or password is incorrect. Revealing this information could help a potential attacker determine which part of the login credentials is wrong.

! Protect: 
  - To secure routes and ensure that only logged-in users can access them, we use JSON Web Tokens (JWTs). We'll implement this functionality through a middleware that performs the following:
    - Returns an error if the user is not authenticated (i.e., not logged in).
    -Calls the next middleware if the user is authenticated.


  -It's common practice to send the JWT token in the request headers. According to the standard, we should use the Authorization header, with the value beginning with "Bearer" followed by the token itself.

  - you can access the headers using req.headers 

 
  -The jwt.verify() function has two versions:
    1. Synchronous Version: Accepts 2 arguments (token, secret), and it blocks execution until the verification is complete.

    2. Asynchronous Version: Accepts 3 arguments (token, secret, callback function) and uses a callback to handle the verification result.

    If you prefer to use the asynchronous version with async/await, you can use util.promisify to convert the callback-based verify function into a promise-based function

  - JWT may arias 3 errors:
    1. JsonWebTokenError: arais when there any  tampring with a payload 
    2.TokenExpiredError: what the token is expired 

    and you can handle these error by wrapping the jwt.verify inside the try/catch block 
    try{
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    }catch(err){
      if(err.name === "JsonWebTokenError")
    }


  but instead of doing it in this way, we will use our global-handling middleware and check what is the name of the error it is JsonWebTokenError


  - Always verify that the user associated with a token still exists. For example, if a token is issued and the user account is deleted afterward, that user should no longer have the right to perform any actions.

  - Always verify if the user has changed their password after a token was issued. If the password was changed, the token should be invalidated, and the user should be required to re-login to generate a new access token.


  ! restrictTo 
  - Consider the action of deleting a user from the database: not every logged-in user should have permission to perform this action. We must authorize only specific types of users to execute certain actions. This is exactly what authorization is about—it’s the process of verifying whether a user has the necessary rights to interact with a particular resource. Even if a user is logged in, authorization checks ensure they are allowed to access or modify a specific resource.

  - The authorization process works as follows:
      1. Check if the user is logged in: Use authentication middleware (often called "protect" middleware) to verify that the user is logged in and has a valid token.

      2. Verify user permissions: Implement a function that checks if the logged-in user has the appropriate rights or permissions to access or perform specific actions on a resource.


/*
 - environemnt 
 - take the token from the body and used it in the header as  an environment variable
 - pm.environment.set('jwt', pm.response.json().token)




*/
