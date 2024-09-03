const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, id) => {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('token', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    httpOnly: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
