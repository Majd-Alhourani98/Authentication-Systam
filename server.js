const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');

// Load Environment Variables
dotenv.config();

// Datebase Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(conn => console.log('CONNECTED TO DATABASE'))
  .catch(err => console.log('NOT CONNTECTED TO DATABASE', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`running on port ${PORT}`));
