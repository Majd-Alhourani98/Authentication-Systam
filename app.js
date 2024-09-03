const path = require('path');
const express = require('express');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Erorr Handling
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Import Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const morgan = require('morgan');
const { login } = require('./controllers/authController');

const app = express();

// Serving Static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set security HTTP headers
app.use(helmet());

// Logging During development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: 'Too Many requests from this IP, please try again in an hour!',
});

app.use('/api', rateLimit(limiter));

// setup view engine
app.set('view engine', 'pug');

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Prase JSON body
app.use(express.json({ limit: '10kb' }));

// Data snaitization against NoSQL query injection
app.use(mongoSanitize());

// Data snaitization against XSS
app.use(xss());

// Routers Middlewares
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;

// Data snaitization against NoSQL query injection Example:
// login: { "email": {$gte: ""}, "password": "pass12345"}
