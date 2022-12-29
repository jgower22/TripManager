const Trip = require('../models/trip');
const Access = require('../models/access');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        console.log('REQ SESSION USER 1: ' + req.session.user + ' ' + Date.now());
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to log in to view this page');
        return res.redirect('/users/login');
    }
};

//check if user is an owner, editor or viewer of a trip
exports.isAccessType = (accessType, isPublicAction) => {
    return (req, res, next) => {
        let tripId = req.params.id;
        Promise.all([Trip.findById(tripId), Access.find({ trip: tripId, user: res.locals.user }).populate('user', 'email')])
            .then(results => {
                const [trip, access] = results;
                if (trip) {
                    if (trip.createdBy == res.locals.user && accessType.includes('owner')) {
                        res.locals.accessType = 'owner';
                        return next();
                    }
                } else {
                    let err = new Error('Cannot find a trip with id ' + req.params.id);
                    err.status = 404;
                    return next(err);
                }
                //Forbidden - When user is logged in and does not have access to resource
                //Redirect to login page when user is NOT logged in and does not have access to a private trip
                if (access.length >= 1) {
                    let curUser = access[0];
                    if (accessType.includes(curUser.type)) {
                        res.locals.accessType = curUser.type;
                        return next();
                    }
                    let err = new Error('Forbidden');
                    err.status = 403;
                    return next(err);
                } 
                if (trip.generalAccess === 'public') {
                    res.locals.accessType = 'anon';
                    if (isPublicAction) 
                        return next();
                } else if (trip.generalAccess === 'private' && !req.session.user) {
                    res.locals.accessType = 'anon';
                    req.session.returnTo = req.originalUrl;
                    req.flash('error', 'You need to log in to view this page');
                    return res.redirect('/users/login');
                }
                let err = new Error('Forbidden');
                err.status = 403;
                return next(err);
            })
            .catch(err => next(err));
    }
};
