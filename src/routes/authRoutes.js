const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/auth/signup', authController.register);
// router.get('/auth/confirm/:token', authController.confirmEmail);
router.post('/auth/confirm', authController.confirmEmail);
router.post('/auth/signin', authController.login);

module.exports = router;