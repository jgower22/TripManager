const express = require('express');
const controller = require('../controllers/userController');
const { logInLimiter } = require('../middlewares/rateLimiter');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const { validateSignUp, validateLogIn, validateResult } = require('../middlewares/validator');

const router = express.Router();

router.get('/signup', isGuest, controller.new);

router.post('/', isGuest, validateSignUp, validateResult, controller.addUser);

router.get('/login', isGuest, controller.login);

router.post('/login', logInLimiter, isGuest, validateLogIn, validateResult, controller.processLogin);

router.get('/profile', isLoggedIn, controller.profile);

router.get('/settings', isLoggedIn, controller.settings);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;