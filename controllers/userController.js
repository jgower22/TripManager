const User = require('../models/user');

exports.new = (req, res, next) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        if (user) {
            res.render('./error/sessionError', {user});
        } else {
            res.render('./user/signup', {user});
        }
    })
    .catch(err=>next(err));
}

exports.addUser = (req, res, next) => {
    let user = new User(req.body);
    user.save()
    .then(() => res.redirect('/users/login'))
    .catch(err => {
        if (err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('/users/new');
        }

        if (err.code === 11000) {
            req.flash('error', 'Email address has been used');
            return res.redirect('/users/new');
        }
        next(err);
    });
}

exports.login = (req, res, next) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        if (user) {
            res.render('./error/sessionError', {user});
        } else {
            res.render('./user/login', {user});
        }
    })
    .catch(err=>next(err));
}

exports.processLogin = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({email: email})
    .then(user => {
        if (user) {
            user.comparePassword(password)
            .then(result => {
                if (result) {
                    console.log(req.session);
                    req.session.user = user._id;
                    //req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                } else {
                    console.log('Wrong password');
                    req.flash('error', 'Wrong password');
                    res.redirect('/users/login');
                }
            })
        } else {
            console.log('Wrong email address');
            req.flash('error', 'Wrong email address');
            res.redirect('/users/login');
        }
    })
    .catch(err=>next(err));
}

exports.profile = (req, res, next) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        if (user) {
            res.render('./user/profile', {user});
        } else {
            res.render('./error/loginError', {user});
        }
    })
    .catch(err=>next(err));
}

exports.settings = (req, res, next) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        if (user) {
            res.render('./user/settings', {user});
        } else {
            res.render('./error/loginError', {user});
        }
    })
    .catch(err=>next(err));
}

exports.logout = (req, res, next) => {
    req.session.destroy(err=> {
        if (err)
            return next(err);
        else {
            res.redirect('/');
        }
    });
}