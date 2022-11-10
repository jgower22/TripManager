const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/signup', controller.new);

router.post('/', controller.addUser);

router.get('/login', controller.login);

router.post('/login', controller.processLogin);

router.get('/profile', controller.profile);

router.get('/settings', controller.settings);

router.get('/logout', controller.logout);

module.exports = router;