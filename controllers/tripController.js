const model = require('../models/trip');
const User = require('../models/user');
const { ObjectId } = require('mongodb');

exports.index = (req, res, next) => {
    //res.send('Send all trips');

    //Find all trips where createdBy === user email OR has access to
    model.find({$or: [{createdBy: res.locals.user}, {access: {$elemMatch: {user: res.locals.user}}}]})
        .then(trips => {
            res.render('./trip/index', { trips });
        })
        .catch(err => next(err));
};

exports.newTrip = (req, res) => {
    //res.send('Send the new form');
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
            image: req.body.image
        }
        prefilledDays.push(day);
    }

    req.body.days = prefilledDays;
    req.body.createdBy = req.session.user;
    req.body.access = {
        user: req.session.user,
        type: 'owner',
    };
    let trip = new model(req.body);

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

exports.showTrip = (req, res, next) => {
    let tripId = req.params.id;

    model.findById(tripId).populate('createdBy', 'firstName lastName')
        .then(trip => {
            if (trip) {
                const { DateTime } = require('luxon');
                res.render('./trip/showTrip', { trip, DateTime });
            } else {
                let err = new Error('Cannot find trip with id: ' + tripId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));

}

exports.editTrip = (req, res, next) => {
    //res.send('Send edit form');
    let tripId = req.params.id;

    model.findById(tripId)
        .then(trip => {
            res.render('./trip/editTrip', { trip });
        })
        .catch(err => next(err));
};

exports.updateTrip = (req, res, next) => {
    //res.send('Update trip with id ' + req.params.id);
    let tripId = req.params.id;

    model.findById(tripId)
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
                        image: req.body.image
                    }
                    newDays.push(day);
                }

                //COMBINE PREVIOUS DAYS WITH NEW DAYS TO BE ADDED
                let combinedDays = previousDays.concat(newDays);

                //{$set: tripFields, $push: {days: { $each: newDays }}}
                model.findByIdAndUpdate(tripId, { $set: tripFields, days: combinedDays }, { useFindAndModify: false, runValidators: true })
                    .then(trip => {
                        if (trip) {
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
                }

                model.findByIdAndUpdate(tripId, { $set: tripFields, days: daysToKeep }, { useFindAndModify: false, runValidators: true })
                    .then(trip => {
                        if (trip) {
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
                console.log('SHIFTING DAYS');
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
                model.findByIdAndUpdate(tripId, { $set: tripFields, days: updatedDays }, { useFindAndModify: false, runValidators: true })
                    .then(trip => {
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

    model.findByIdAndDelete(tripId, { useFindAndModify: false })
        .then(trip => {
            if (trip) {
                res.redirect('/trips');
            } else {
                let err = new Error('Cannot find trip with id: ' + tripId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.showDay = (req, res, next) => {
    //res.send('Show day with id ' + req.params.id);
    let tripId = req.params.id;
    let dayId = req.params.dayId;

    model.findById(tripId)
        .then(trip => {
            let days = trip.days;
            //Find prev id and next id
            let prevId, nextId;
            let index = days.findIndex(day => day.number == dayId);
            let firstId;
            if (days.length > 0 && index !== -1) {
                firstId = days[0].number;
                if (index !== 0) {
                    prevId = trip.days[index - 1].number;
                }
                if (index < trip.days.length - 1) {
                    nextId = trip.days[index + 1].number;
                }
            }
            if (index !== -1) {
                let day = days[index];
                const { DateTime } = require('luxon');
                res.render('./trip/showDay', { day, trip, prevId, nextId, firstId, DateTime });
            } else {
                let err = new Error('Cannot find day with id: ' + dayId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
}

exports.editDay = (req, res, next) => {
    let tripId = req.params.id;
    let dayId = req.params.dayId;

    model.findById(tripId)
        .then(trip => {
            let days = trip.days;
            let day = days.find(day => day.number == dayId);
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
    let image = dayData.image;

    model.findById(tripId)
        .then(trip => {
            model.updateOne({ _id: tripId, 'days.number': parseInt(dayId)},
                {
                    $set: {
                        'days.$.location': location,
                        'days.$.details': details,
                        'days.$.image': image
                    }
                })
                .then(day => {
                    if (day) {
                        res.redirect('/trips/' + tripId + '/' + dayId);
                    } else {
                        let err = new Error('Cannot find trip with id: ' + tripId);
                        err.status = 404;
                        next(err);
                    }
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));

}

exports.generatePDF = (req, res, next) => {
    let tripId = req.params.id;

    model.findById(tripId)
        .then(trip => {
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
}

exports.share = (req, res, next) => {
    let tripId = req.params.id;

    model.findOne({_id: tripId}, {access: 1}).populate('access.user', 'firstName lastName email')
        .then(trip => {
            res.render('./trip/share', { trip });
        })
        .catch(err => next(err));
}

exports.addAccess = (req, res, next) => {
    console.log("REQ BODY: " + JSON.stringify(req.body));
    res.redirect('back');
}

exports.removeAccess = (req, res, next) => {
    let tripId = req.params.id;
    let userId = req.params.userId;
    res.send('Test');
    //model.updateOne({ _id: tripId, 'days.number': parseInt(dayId) },
}



