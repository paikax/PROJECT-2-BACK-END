const express = require('express');
const compression = require('compression');
const rateLimiter = require('./middleware/rateLimiter');
require('./config/db'); // Import the MongoDB connection
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes');
require('dotenv').config({ path: "./../development/.env"});
const cors = require('cors');


const app = express();

app.use(cors({
    origin: '*', // Allow all origins
    methods: 'GET,POST,PUT,DELETE', // Specify allowed HTTP methods
    credentials: false // Set to false since all origins are allowed
}));
app.use(express.json());
app.use(compression());
app.use(rateLimiter); // Apply rate limiter middleware


app.use('/api', userRoutes, authRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes); // Include category routes



module.exports = app;

//test
