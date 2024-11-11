const mongoose = require('mongoose');

const greetingSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Greeting', greetingSchema);
