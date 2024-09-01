const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

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

  // Send response with status and user data
  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
});

const login = catchAsync(async (req, res, next) => {});
const protect = catchAsync(async (req, res, next) => {});
const restrictTo = catchAsync(async (req, res, next) => {});
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

/* 
! Theroy: How Authentication with JWT Works 
  * Authentication
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

/* 
! Signup:
  * steps to signup user:
  1. create user 
  2. generate a token 
  3. Check if the user is created successfully. otherwise send error message
  3. send the response and the token 

  * Notes:
  Avoid using this approach for user creation:
    - const user = await User.create(req.body);
  This method is insecure as it allows users to set fields like role (e.g., as 'admin') directly from the request body, which can lead to security issues.

  Instead, use the following approach to ensure only the necessary fields are set:
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });

  This way, users cannot manipulate fields like role during registration.
*/
