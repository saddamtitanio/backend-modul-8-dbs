const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// TODO: Create a new login endpoint at /auth/login that returns a JWT token
// JWT payload: userId, email, expiry 24 hours
// Use the existing UserService.login, but make sure it returns a token
router.post('/login', AuthController.login);

module.exports = router;
