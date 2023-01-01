const User = require('../models/user');

exports.index = (req, res) => {
    res.locals.title = 'Trip Manager - Home';
    res.render('./index');
};

exports.about = (req, res) => {
    res.locals.title = 'Trip Manager - About';
    res.render('./about');
};

exports.contact = (req, res) => {
    res.locals.title = 'Trip Manager - Contact';
    res.render('./contact');
};