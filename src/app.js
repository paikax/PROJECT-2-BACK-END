const express = require('express');
const compression = require('compression');
const rateLimiter = require('./middleware/rateLimiter');
require('./config/db'); // Import the MongoDB connection
const userRoutes = require('./routes/userRoutes')
require('dotenv').config({ path: "./../development/.env"});

const app = express();

app.use(express.json());
app.use(compression());
app.use(rateLimiter); // Apply rate limiter middleware


app.use('/api', userRoutes);


module.exports = app;
