const Trip = require('../models/trip');
const Access = require('../models/access');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    console.log('CHECK GUEST REQ SESSION USER 1: ' + req.session.user);
    if (!req.session.user) {
        console.log("HERE1");
        return next();
    } else {
        req.flash('error', 'You are logged in already :D');
        console.log("HERE2");
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    console.log('CHECK LOGGED IN REQ SESSION USER 2: ' + req.session.user + ' ' + Date.now());
    if (req.session.user) {
        console.log("HERE3");
        return next();
    } else {
        req.flash('error', 'You need to log in first :D');
        console.log("HERE4 " + Date.now());
        return res.redirect('/users/login');
    }
};

//check if user is an owner, editor or viewer of a trip
exports.isAccessType = (accessType) => {
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
                if (access) {
                    console.log('ACCESS LENGTH: ' + access.length);
                    let curUser = access[0];
                    if (accessType.includes(curUser.type)) {
                        res.locals.accessType = curUser.type;
                        return next();
                    }
                    let err = new Error('Forbidden');
                    err.status = 403;
                    return next(err);
                } else {
                    let err = new Error('Forbidden');
                    err.status = 403;
                    return next(err);
                }
            })
            .catch(err => next(err));
        /*Trip.findById(id).populate('access.user', 'firstName lastName email type')
            .then(trip => {
                if (trip) {
                    for (let i = 0; i < trip.access.length; i++) {
                        let curUser = trip.access[i];
                        res.locals.accessType = curUser.type;
                        if (curUser.user.email === res.locals.email && accessType.includes(curUser.type)) {
                            return next();
                        }
                    }
                    let err = new Error('Forbidden');
                    err.status = 403;
                    return next(err);
                } else {
                    let err = new Error('Cannot find a trip with id ' + req.params.id);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));*/
    }
};
