const User = require('../models/user');
const Trip = require('../models/trip');
const Access = require('../models/access');
const Token = require('../models/token');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const bcryptSalt = process.env.BCRYPT_SALT;
const { unescapeTripNames, unescapeTrip, unescapeTripLocations } = require('../public/javascript/unescape');
const { message } = require('../public/javascript/email.js');
const { DateTime } = require('luxon');

exports.new = (req, res, next) => {
    res.locals.title = 'Trip Manager - Sign Up';
    res.render('./user/signup');
};

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
            return res.redirect('/users/signup');
        }

        if (err.code === 11000) {
            req.flash('error', 'Email address has been used');
            return res.redirect('/users/signup');
        }
        next(err);
    });
};

exports.login = (req, res, next) => {
    res.locals.title = 'Trip Manager - Log In';
    res.render('./user/login');
};

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
                    req.session.userFullName = user.firstName + ' ' + user.lastName;
                    req.session.email = user.email;
                    console.log('*******************');
                    console.log('REQ SESSION RETURN TO: ' + req.session.returnTo);
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
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([User.findById(id), Trip.find({ createdBy: res.locals.user }, { _id: 0, location: 1})])
        .then(results => {
            const [user, tripLocations] = results;
            res.locals.title = 'Trip Manager - Profile';
            console.log(user);
            unescapeTripLocations(tripLocations);
            res.render('./user/profile', { user, trips: tripLocations, DateTime });
        })
        .catch(err => next(err));
    
};

exports.settings = (req, res, next) => {
    let id = req.session.user;
    User.findById(id)
    .then(user => {
        res.render('./user/settings', {user});
    })
    .catch(err=>next(err));
};

exports.logout = (req, res, next) => {
    delete req.session.returnTo;
    req.session.destroy(err=> {
        if (err)
            return next(err);
        else {
            res.redirect('/');
        }
    });
};

exports.resetPassword = (req, res, next) => {
    let data = req.flash('formdata');
    res.locals.title = 'Reset Login - Trip Manager';
    res.render('./user/resetPassword', { formData: data[0] });
};

exports.sendPasswordReset = (req, res, next) => {
    let userEmail = req.body.email;
    let flashMessage = 'If we found an account associated with that email, then we\'ll send an email to reset your password.';

    User.findOne({ email: userEmail }, { email: 1, username: 1, firstName: 1})
        .then(user => {
            if (user) {
                let resetToken = crypto.randomBytes(32).toString('hex');

                Token.findOne({ user: user._id })
                    .then(token => {
                        console.log('TOKEN: ' + token);
                        if (token) {
                            token.deleteOne();
                        }
                        bcrypt.hash(resetToken, Number(bcryptSalt))
                            .then(hash => {
                                new Token({
                                    user: user._id,
                                    token: hash,
                                    createdAt: Date.now()
                                }).save()
                                    .then(token => {
                                        let link = `${process.env.CLIENT_URL}/users/reset-password?token=${resetToken}&id=${user._id}`;
                                        console.log('LINK: ' + link);
                                        let messageOptions = ({
                                            from: `${process.env.EMAIL}`,
                                            to: "" + req.body.email + "", //receiver
                                            subject: "Trip Manager Password Reset Link",
                                            html: "Hello " + user.firstName + "," + 
                                                "<br>Here is the password reset link you requested:" +
                                                '<br><p>Click <a href="' + link + '">here</a> to reset your password</p>'
                                        });
                                        message(null, null, messageOptions, null, null, null, null);
                                        req.flash('success', flashMessage);
                                        res.redirect('back');
                                    })
                                    .catch(err => next(err));
                            });
                    })
                    .catch(err => next(err));
            } else {
                req.flash('success', flashMessage);
                res.redirect('back');
            }
        })
        .catch(err => next(err));
}