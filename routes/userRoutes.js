const express = require('express');
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');

const router = express.Router();

router.get('/signup', isGuest, controller.new);

router.post('/', isGuest, controller.addUser);

router.get('/login', isGuest, controller.login);

router.post('/login', isGuest, controller.processLogin);

router.get('/profile', isLoggedIn, controller.profile);

router.get('/settings', isLoggedIn, controller.settings);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;