const express = require('express');
const compression = require('compression');
const rateLimiter = require('./middleware/rateLimiter');
require('./config/db'); // Import the MongoDB connection
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
require('dotenv').config({ path: "./../development/.env"});

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL, // Replace with your React app's URL
    methods: 'GET,POST,PUT,DELETE', // Specify allowed HTTP methods
    credentials: true // Enable if cookies/credentials are required
}));
app.use(express.json());
app.use(compression());
app.use(rateLimiter); // Apply rate limiter middleware


app.use('/api', userRoutes, authRoutes);




module.exports = app;
