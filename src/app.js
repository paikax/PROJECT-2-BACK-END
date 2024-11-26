const express = require('express');
const compression = require('compression');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
const rateLimiter = require('./middleware/rateLimiter');
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes');
const branchRoutes = require('./routes/branchRoutes')
const requestRoutes = require('./routes/requestRoutes');
require('./config/db');
require('dotenv').config({ path: "./../development/.env"});

const app = express();

app.use(express.json());
app.use(compression());
// Test virtual view
app.set("view engine", "ejs");

// const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(rateLimiter);

app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/', (req, res) => {
    res.send("This is DEV-G5 root endpoint^^.");
});


module.exports = app;
