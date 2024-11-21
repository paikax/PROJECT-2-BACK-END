const express = require('express');
const authController = require('../controllers/authController');
const checkBanStatus = require('../middleware/checkBanStatus');
const router = express.Router();

router.post('/signup', authController.register);
// router.get('/auth/confirm/:token', authController.confirmEmail);
router.post('/confirm', authController.confirmEmail);
router.post('/signin', checkBanStatus, authController.login);

module.exports = router;