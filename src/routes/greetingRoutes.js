const express = require('express');
const { getGreeting } = require('../controllers/greetingController');

const router = express.Router();

// Greeting route
router.get('/', getGreeting);

module.exports = router;
