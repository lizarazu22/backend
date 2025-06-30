const express = require('express');
const { signup, login } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../middlewares/validators/authValidators');
const handleValidationErrors = require('../middlewares/handleValidationErrors');
const { loginLimiter, signupLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

// Signup con limitador y validaciones
router.post('/signup', signupLimiter, signupValidator, handleValidationErrors, signup);

// Login con limitador y validaciones
router.post('/login', loginLimiter, loginValidator, handleValidationErrors, login);

module.exports = router;
