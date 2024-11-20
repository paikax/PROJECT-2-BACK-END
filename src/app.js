const express = require('express');
const compression = require('compression');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
const rateLimiter = require('./middleware/rateLimiter');
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes');
require('./config/db');
require('dotenv').config({ path: "./../development/.env"});

const app = express();

app.use(express.json());
app.use(compression());
const allowedOrigins = [process.env.CLIENT_URL];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));
app.use(rateLimiter);

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);

module.exports = app;

//test
