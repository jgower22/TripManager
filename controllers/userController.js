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

    //Format first and last name
    let firstName = user.firstName.toLowerCase();
    user.firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    let lastName = user.lastName.toLowerCase();
    user.lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    
    user.save()
    .then(() => {
        req.flash('success', 'Account created successfully');
        res.redirect('/users/login');
    })
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
    res.render('./user/login');
}

exports.processLogin = (req, res, next) => {
    let email = req.body.email;
    if (email)
        email = email.toLowerCase();
    let password = req.body.password;
    let errorMessage = 'Invalid username and/or password';
    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', errorMessage);
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result => {
                if (result) {
                    req.session.user = user._id;
                    console.log('REQ SESSION USER 2: ' + req.session.user + ' ' + Date.now());
                    req.session.userFullName = user.firstName + ' ' + user.lastName;
                    req.session.email = user.email;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect(req.session.returnTo || '/users/profile');
                    delete req.session.returnTo;
                } else {
                    req.flash('error', errorMessage);
                    res.redirect('/users/login');
                }
            })
        }
    })
    .catch(err=>next(err));
}

exports.profile = (req, res, next) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        res.render('./user/profile', {user});
    })
    .catch(err=>next(err));
}

exports.settings = (req, res, next) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        res.render('./user/settings', {user});
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