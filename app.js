const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');

// Erorr Handling
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Import Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const morgan = require('morgan');

const app = express();

// Logging During development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

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
app.use(express.json());

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
