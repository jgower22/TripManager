const User = require('../models/user');
const Trip = require('../models/trip');
const Access = require('../models/access');
const { unescapeTripNames } = require('../public/javascript/unescape');
const { DateTime } = require('luxon');

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
}

exports.profile = (req, res, next) => {
    /*let id = req.session.user;
    Promise.all([User.findById(id), Trip.find({ createdBy: res.locals.user }, { _id: 1, name: 1, startDate: 1, endDate: 1})])
    .then(results => {
        const [user, trips] = results;
        unescapeTripNames(trips);
        res.render('./user/profile', {user, trips, DateTime});
    })
    .catch(err=>next(err));*/

    let id = req.session.user;
    let query = req._parsedOriginalUrl.query;
    let show = 'mytrips';
    if (query) {
        let splitQuery = query.split('&');
        for (let i = 0; i < splitQuery.length; i++) {
            let index = splitQuery[i].indexOf('=');
            let queryString = splitQuery[i].substring(0, index).toLowerCase();
            //Find first show in query
            if (queryString === 'show') {
                show = splitQuery[i].substring(index + 1, splitQuery[i].length);
                break;
            }
        }
    }

    switch (show) {
        case 'mytrips':
            //Show only userCreated trips
            Promise.all([User.findById(id), Trip.find({ createdBy: res.locals.user }, { _id: 1, name: 1, startDate: 1, endDate: 1 })])
                .then(results => {
                    const [user, trips] = results;
                    unescapeTripNames(trips);
                    res.render('./user/profile', { user, trips, show, DateTime });
                })
                .catch(err => next(err));
            break;
        case 'shared':
            //Show only shared trips
            Promise.all([User.findById(id), Access.find({ user: res.locals.user}).populate('trip', '_id name startDate endDate')])
                .then(results => {
                    const [user, trips] = results;
                    //Format trips
                    let formattedTrips = [];
                    for (let i = 0; i < trips.length; i++) {
                        formattedTrips.push(trips[i].trip);
                    }
                    unescapeTripNames(formattedTrips);
                    res.render('./user/profile', { user, trips: formattedTrips, show });
                })
                .catch(err => next(err));
            break;
        default:
            //Show all trips (userCreated + shared)
            Promise.all([User.findById(id), Trip.find({ createdBy: res.locals.user }, { _id: 1, name: 1, startDate: 1, endDate: 1 }), Access.find({ user: res.locals.user }).populate('trip', '_id name startDate endDate')])
                .then(results => {
                    console.log('RESULTS: ' + results);
                    const [user, trips, access] = results;
                    let combinedTrips = trips;
                    for (let i = 0; i < access.length; i++) {
                        combinedTrips.push(access[i].trip);
                    }
                    unescapeTripNames(trips);
                    res.render('./user/profile', { user, trips: combinedTrips, show, DateTime });
                })
                .catch(err => next(err));
    }
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
    delete req.session.returnTo;
    req.session.destroy(err=> {
        if (err)
            return next(err);
        else {
            res.redirect('/');
        }
    });
}