// database connection
const mongoose = require('mongoose');
require("dotenv").config({ path: "./../development/.env" });
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });
