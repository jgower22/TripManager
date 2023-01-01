const Trip = require('../models/trip');
const User = require('../models/user');
const Access = require('../models/access');
const mongoose = require('mongoose');
const { unescapeTrip, unescapeTripName, unescapeTripNames, unescapeTripDay, unescapeTripDays } = require('../public/javascript/unescape');
const maxNumDays = 731;
const { DateTime }  = require('luxon');

exports.index = (req, res, next) => {
    //res.send('Send all trips');

    let query = req._parsedOriginalUrl.query;
    let show = req.session.showTrip || 'all';
    if (query) {
        let splitQuery = query.split('&');
        for (let i = 0; i < splitQuery.length; i++) {
            let index = splitQuery[i].indexOf('=');
            let queryString = splitQuery[i].substring(0, index).toLowerCase();
            //Find first show in query
            if (queryString === 'show') {
                show = splitQuery[i].substring(index + 1, splitQuery[i].length);
                req.session.showTrip = show;
                break;
            }
        }
    }

    switch (show) {
        case 'mytrips':
            //Show only userCreated trips
            Trip.find({ createdBy: res.locals.user }, { _id: 1, name: 1, startDate: 1, endDate: 1})
                .then(trips => {
                    unescapeTripNames(trips);
                    res.locals.title = 'Trip Manager - My Trips';
                    res.render('./trip/index', { trips, show, DateTime });
                })
                .catch(err => next(err));
            break;
        case 'shared':
            //Show only shared trips
            Access.find({ user: res.locals.user}).populate('trip', '_id name startDate endDate')
                .then(trips => {
                    //Format trips
                    let formattedTrips = [];
                    for (let i = 0; i < trips.length; i++) {
                        formattedTrips.push(trips[i].trip);
                    }
                    unescapeTripNames(formattedTrips);
                    res.locals.title = 'Trip Manager - Shared Trips';
                    res.render('./trip/index', { trips: formattedTrips, show, DateTime });
                })
                .catch(err => next(err));
            break;
        default:
            //Show all trips (userCreated + shared)
            Promise.all([Trip.find({ createdBy: res.locals.user }, { _id: 1, name: 1, startDate: 1, endDate: 1 }), Access.find({ user: res.locals.user }).populate('trip', '_id name startDate endDate')])
                .then(results => {
                    const [trips, access] = results;
                    let combinedTrips = trips;
                    for (let i = 0; i < access.length; i++) {
                        combinedTrips.push(access[i].trip);
                    }
                    unescapeTripNames(trips);
                    res.locals.title = 'Trip Manager - All Trips';
                    res.render('./trip/index', { trips: combinedTrips, show, DateTime });
                })
                .catch(err => next(err));
    }
};

exports.newTrip = (req, res) => {
    //res.send('Send the new form');
    res.locals.title = 'Trip Manager - New Trip';
    res.render('./trip/newTrip');
};

exports.createTrip = (req, res, next) => {
    //res.send('Created a new trip');
    let prefilledDays = [];
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.endDate);
    let timeDifference = endDate.getTime() - startDate.getTime();
    let numDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (timeDifference < 0) {
        let err = new Error('Invalid start date/end date');
        err.status = 400;
        next(err);
        return;
    }

    if (numDays >= maxNumDays) {
        req.flash('error', 'Sorry, the maximum number of days you can have on a trip is ' + maxNumDays + ' days. Please try again.');
        return res.redirect('/trips/new');
    }

    for (let i = 0; i <= numDays; i++) {
        let currentDate;
        if (i === 0) {
            currentDate = startDate.setDate(startDate.getDate());
        } else {
            currentDate = startDate.setTime(startDate.getTime() + 1 * 24 * 3600 * 1000);
        }
        let date = new Date(currentDate);
        let formattedDate = date.toISOString().split('T')[0];
        let day = {
            number: i,
            location: req.body.location,
            date: formattedDate,
            details: '',
        }
        prefilledDays.push(day);
    }

    req.body.days = prefilledDays;
    req.body.createdBy = req.session.user;
    req.body.lastModifiedBy = req.session.user;
    req.body.generalAccess = 'private';
    let trip = new Trip(req.body);

    trip.save() //insert the document to the database
        .then(trip => {
            req.flash('success', 'Trip created successfully');
            res.redirect('/trips');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

exports.copyTrip = (req, res, next) => {
    let tripId = req.params.id;
    Trip.findById(tripId)
        .then(trip => {
            let tripCopy = trip.toObject();
            let previousName = tripCopy.name;
            tripCopy.name = 'Copy of ' + trip.name;
            delete tripCopy._id;
            delete tripCopy.createdBy;
            delete tripCopy.lastModifiedBy;
            delete tripCopy.updatedAt;
            delete tripCopy.createdAt;
            delete tripCopy.generalAccess;
            tripCopy.createdBy = res.locals.user;
            tripCopy.lastModifiedBy = res.locals.user;
            tripCopy.generalAccess = 'private';

            let tripCopyDoc = new Trip(tripCopy);
            tripCopyDoc.save()
                .then(trip => {
                    req.flash('success', previousName + ' was copied successfully');
                    res.redirect('/trips');
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

exports.showTrip = (req, res, next) => {
    let tripId = req.params.id;

    Trip.findById(tripId).populate('createdBy', 'firstName lastName').populate('lastModifiedBy', 'firstName lastName')
        .then(trip => {
            if (trip) {
                const { DateTime } = require('luxon');
                const validator = require('validator');
                let escapedTrip = {
                    _id: trip._id,
                    name: trip.name,
                    location: trip.location,
                    details: trip.details,
                    days: trip.days
                };
                unescapeTrip(trip);
                res.locals.title = trip.name;
                req.session.returnTo = req.originalUrl;
                res.render('./trip/showTrip', { trip, escapedTrip, DateTime, validator });
            } else {
                let err = new Error('Cannot find trip with id: ' + tripId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.editTrip = (req, res, next) => {
    //res.send('Send edit form');
    let tripId = req.params.id;

    Trip.findById(tripId)
        .then(trip => {
            unescapeTrip(trip);
            res.locals.title = 'Edit Trip - ' + trip.name;
            res.render('./trip/editTrip', { trip });
        })
        .catch(err => next(err));
};

exports.updateTrip = (req, res, next) => {
    //res.send('Update trip with id ' + req.params.id);
    let tripId = req.params.id;

    Trip.findById(tripId)
        .then(trip => {
            let newStartDate = new Date(req.body.startDate.replace('-', '/'));
            let newEndDate = new Date(req.body.endDate.replace('-', '/'));
            let newTimeDifference = newEndDate.getTime() - newStartDate.getTime();
            let newNumDays = Math.ceil(newTimeDifference / (1000 * 60 * 60 * 24)) + 1;

            if (newTimeDifference < 0) {
                let err = new Error('Invalid start date/end date');
                err.status = 400;
                next(err);
                return;
            }

            if (newNumDays > maxNumDays) {
                req.flash('error', 'Sorry, the maximum number of days you can have on a trip is ' + maxNumDays + ' days. Please try again.');
                return res.redirect('back');
            }

            //Need to change all trip days locations if this is true
            let applyToAllDays = false;
            if (req.body.applyToAllDays) {
                applyToAllDays = true;
            }

            var newDays = [];
            let currentStartDate, currentEndDate, currentTimeDifference, currentNumDays;

            currentStartDate = new Date(trip.startDate.replace('-', '/'));
            currentEndDate = new Date(trip.endDate.replace('-', '/'));
            currentTimeDifference = new Date(currentEndDate).getTime() - new Date(currentStartDate).getTime();
            currentNumDays = Math.ceil(currentTimeDifference / (1000 * 60 * 60 * 24)) + 1;

            let tripFields = req.body;

            //If new days need to be added
            if (newNumDays > currentNumDays) {

                //SHIFT PREVIOUSLY SAVED DAYS TO MATCH NEW START/END DATES
                let previousDays = trip.days;

                for (let i = 0; i < previousDays.length; i++) {
                    let currentDay = previousDays[i];
                    let currentDate;

                    if (i === 0) {
                        currentDate = newStartDate.setDate(newStartDate.getDate());
                    } else {
                        currentDate = newStartDate.setTime(newStartDate.getTime() + 1 * 24 * 3600 * 1000);
                    }
                    let date = new Date(currentDate);
                    let formattedDate = date.toISOString().split('T')[0];

                    currentDay.date = formattedDate;

                    //Change location if requested by user
                    if (applyToAllDays) {
                        currentDay.location = req.body.location;
                    }
                }

                let previousDateRead = new Date(previousDays[previousDays.length - 1].date);
                for (let i = currentNumDays; i < newNumDays; i++) {
                    //Add one day and account for Daylight Savings Time
                    let currentDate = previousDateRead.setTime(previousDateRead.getTime() + 1 * 24 * 3600 * 1000);

                    let date = new Date(currentDate);
                    let formattedDate = date.toISOString().split('T')[0];

                    let day = {
                        number: i,
                        location: req.body.location,
                        date: formattedDate,
                        details: '',
                    }
                    newDays.push(day);
                }

                //COMBINE PREVIOUS DAYS WITH NEW DAYS TO BE ADDED
                let combinedDays = previousDays.concat(newDays);

                //{$set: tripFields, $push: {days: { $each: newDays }}}
                Trip.findByIdAndUpdate(tripId, { $set: tripFields, days: combinedDays, lastModifiedBy: res.locals.user }, { useFindAndModify: false, runValidators: true })
                    .then(trip => {
                        if (trip) {
                            req.flash('success', 'Trip updated successfully');
                            res.redirect('/trips/' + tripId);
                            return;
                        } else {
                            let err = new Error('Cannot find trip with id: ' + tripId);
                            err.status = 404;
                            next(err);
                            return;
                        }
                    })
                    .catch(err => {
                        if (err.name === 'ValidationError') {
                            err.status = 400;
                        }
                        next(err);
                        return;
                    });
            }
            //If some days need to be removed
            if (newNumDays < currentNumDays) {
                let daysToKeep = trip.days;
                daysToKeep.length = newNumDays;

                //SHIFT DATES TO MATCH NEW START/END DATES
                for (let i = 0; i < daysToKeep.length; i++) {
                    let currentDay = daysToKeep[i];
                    let currentDate;

                    if (i === 0) {
                        currentDate = newStartDate.setDate(newStartDate.getDate());
                    } else {
                        currentDate = newStartDate.setTime(newStartDate.getTime() + 1 * 24 * 3600 * 1000);
                    }
                    let date = new Date(currentDate);
                    let formattedDate = date.toISOString().split('T')[0];

                    currentDay.date = formattedDate;

                    //Change location if requested by user
                    if (applyToAllDays) {
                        currentDay.location = req.body.location;
                    }
                }

                Trip.findByIdAndUpdate(tripId, { $set: tripFields, days: daysToKeep, lastModifiedBy: res.locals.user}, { useFindAndModify: false, runValidators: true })
                    .then(trip => {
                        if (trip) {
                            req.flash('success', 'Trip updated successfully');
                            res.redirect('/trips/' + tripId);
                            return;
                        } else {
                            let err = new Error('Cannot find trip with id: ' + tripId);
                            err.status = 404;
                            next(err);
                            return;
                        }
                    })
                    .catch(err => {
                        if (err.name === 'ValidationError') {
                            err.status = 400;
                        }
                        next(err);
                        return;
                    });
            }
            //If num days remains the same
            //Only need to shift days if start date changes
            let updatedDays = trip.days;
            if (currentStartDate.getTime() !== newStartDate.getTime() && newNumDays === currentNumDays) {
                for (let i = 0; i < updatedDays.length; i++) {
                    let currentDay = updatedDays[i];
                    let currentDate;

                    if (i === 0) {
                        currentDate = newStartDate.setDate(newStartDate.getDate());
                    } else {
                        currentDate = newStartDate.setTime(newStartDate.getTime() + 1 * 24 * 3600 * 1000);
                    }
                    let date = new Date(currentDate);
                    let formattedDate = date.toISOString().split('T')[0];

                    currentDay.date = formattedDate;

                }
            }
            //Update trip when number of days stays the same 
            if (newNumDays === currentNumDays) {
                //Change location if requested by user
                if (applyToAllDays) {
                    for (let i = 0; i < updatedDays.length; i++) {
                        let currentDay = updatedDays[i];
                        currentDay.location = req.body.location;
                    }
                }
                Trip.findByIdAndUpdate(tripId, { $set: tripFields, days: updatedDays, lastModifiedBy: res.locals.user }, { useFindAndModify: false, runValidators: true })
                    .then(trip => {
                        req.flash('success', 'Trip updated successfully');
                        res.redirect('/trips/' + tripId);
                        return;
                    })
                    .catch(err => {
                        if (err.name === 'ValidationError') {
                            err.status = 400;
                        }
                        next(err);
                        return;
                    });
            }
        })
        .catch(err => next(err));
};

exports.deleteTrip = (req, res, next) => {
    //res.send('Delete trip with id ' + req.params.id);
    let tripId = req.params.id;

    Promise.all([Trip.findByIdAndDelete(tripId, { useFindAndModify: false }), Access.deleteMany({ trip: tripId })])
        .then(results => {
            req.flash('success', 'Trip deleted successfully');
            res.redirect('/trips');
        })
        .catch(err => next(err));
};

exports.showDay = (req, res, next) => {
    //res.send('Show day with id ' + req.params.id);
    let tripId = req.params.id;
    let dayId = req.params.dayId;

    Trip.findById(tripId)
        .then(trip => {
            let days = trip.days;
            //Find prev id and next id
            let prevId, nextId;
            let index = days.findIndex(day => day.number == dayId);
            let firstId, lastId;
            if (days.length > 0 && index !== -1) {
                firstId = days[0].number;
                lastId = days[days.length-1].number;
                if (index !== 0) {
                    prevId = trip.days[index - 1].number;
                }
                if (index < trip.days.length - 1) {
                    nextId = trip.days[index + 1].number;
                }
            }
            if (index !== -1) {
                let day = days[index];
                //Unescape day
                unescapeTripDay(day);
                unescapeTrip(trip);
                res.locals.title = 'Day ' + index + ' - ' + trip.name;
                const { DateTime } = require('luxon');
                const validator = require('validator');
                req.session.returnTo = req.originalUrl;
                res.render('./trip/showDay', { day, trip, prevId, nextId, firstId, lastId, DateTime, validator });
            } else {
                let err = new Error('Cannot find day with id: ' + dayId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.editDay = (req, res, next) => {
    let tripId = req.params.id;
    let dayId = req.params.dayId;

    Trip.findById(tripId)
        .then(trip => {
            let days = trip.days;
            let day = days.find(day => day.number == dayId);
            //Unescape trip day
            unescapeTripDay(day);
            unescapeTrip(trip);
            res.locals.title = 'Edit Day ' + day.number + ' - ' + trip.name;

            if (day) {
                res.render('./trip/editDay', { trip, day });
            } else {
                let err = new Error('Cannot find day number: ' + dayId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.updateDay = (req, res, next) => {
    let tripId = req.params.id;
    let dayId = req.params.dayId;

    let dayData = req.body;
    let location = dayData.location;
    let details = dayData.details;
    
    Promise.all([Trip.updateOne({ _id: tripId, 'days.number': parseInt(dayId)},
        {
            $set: {
                'days.$.location': location,
                'days.$.details': details,
            }
        }), Trip.findByIdAndUpdate({ _id: tripId}, { lastModifiedBy: res.locals.user})])
        .then(day => {
            if (day.matchedCount === 0) {
                let err = new Error('Cannot find day ' + dayId + ' for this trip.');
                err.status = 404;
                return next(err);
            }
            req.flash('success', 'Day ' + dayId + ' updated successfully');
            res.redirect('/trips/' + tripId + '/' + dayId);
        })
        .catch(err => next(err));
};

exports.generatePDF = (req, res, next) => {
    let tripId = req.params.id;

    Trip.findById(tripId)
        .then(trip => {
            //Unescape text
            unescapeTrip(trip);
            unescapeTripDays(trip);

            const pdf = require('../public/javascript/generatePDF.js');
            const stream = res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment;filename=' + trip.name + '.pdf'
            });
            pdf.generatePDF(trip,
                (chunk) => stream.write(chunk),
                () => stream.end()
            );
        })
        .catch(err => next(err));
};

exports.share = (req, res, next) => {
    let tripId = req.params.id;

    Promise.all([Trip.findOne({ _id: tripId }, {  generalAccess: 1, name: 1 }).populate('createdBy', 'firstName lastName email'), Access.find({ trip: tripId }).populate('user', 'firstName lastName email')])
        .then(results => {
            const [trip, access] = results;
            unescapeTripName(trip);
            res.locals.title = 'Share - ' + trip.name;
            res.render('./trip/share', { trip, access });
        })
        .catch(err => next(err));
};

exports.addAccess = (req, res, next) => {
    let tripId = req.params.id;
    let userEmail = req.body.email;
    let accessType = req.body.accessType;
    //Get user id from user email
    User.findOne({ email: userEmail })
        .then(user => {

            //Cannot add users that do not exist
            if (!user) {
                req.flash('error', 'User not found.')
                return res.redirect('back');
            }

            //Cannot add yourself (owner)
            if (userEmail === res.locals.email) {
                req.flash('error', 'You already have access!')
                return res.redirect('back');
            }

            //Insert into access collection
            Access.findOneAndUpdate(
                {
                    user: user._id, trip: tripId
                },
                {
                    type: accessType,
                    user: user._id,
                    trip: tripId
                }, { upsert: true })
                .then(access => {
                    req.flash('success', 'User added successfully');
                    res.redirect('/trips/' + tripId + '/share');
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

exports.removeAccess = (req, res, next) => {
    let tripId = req.params.id;
    let userId = req.params.userId;
    Access.deleteOne({ trip: tripId, user: userId })
        .then(access => {
            req.flash('success', 'User removed successfully');
            res.redirect('/trips/' + tripId + '/share');
        })
        .catch(err => next(err));
};

exports.updateGeneralAccess = (req, res, next) => {
    let tripId = req.params.id;
    Trip.updateOne({ _id: tripId }, { generalAccess: req.body.generalAccess })
        .then(trip => {
            req.flash('success', 'General Access updated successfully');
            res.redirect('/trips/' + tripId + '/share');
        })
        .catch(err => next(err));
}



