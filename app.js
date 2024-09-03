const path = require('path');

const express = require('express');

// Erorr Handling
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Import Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

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
