const express = require('express');
const compression = require('compression');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express'); // Import Swagger UI
const swaggerSpecs = require('./swaggerConfig'); // Import Swagger Config
const authRoutes = require('./routes/authRoutes');
const rateLimiter = require('./middleware/rateLimiter');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const branchRoutes = require('./routes/branchRoutes');
require('./config/db');
require('dotenv').config({ path: "./../development/.env" });

const allowedOrigins = [
    process.env.CLIENT_URL,  
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
  ];

const app = express();

app.use(express.json());
app.use(compression());
// const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

app.use(rateLimiter);

// Add Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs)); // Swagger documentation route

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', branchRoutes);

app.use('/', (req, res) => {
  res.send('This is DEV-G5 root endpoint^^.');
});

module.exports = app;