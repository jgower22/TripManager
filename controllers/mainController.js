const User = require('../models/user');

exports.index = (req, res) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        res.render('./index', {user});
    })
    .catch(err=>next(err));
};

exports.about = (req, res) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        res.render('./about', {user});
    })
    .catch(err=>next(err));
};

exports.contact = (req, res) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        res.render('./contact', {user});
    })
    .catch(err=>next(err));
};