const model = require('../models/trip');
const { ObjectId } = require('mongodb');

exports.index = (req, res) => {
    //res.send('Send all trips');
    model.find()
        .then(trips => res.render('./trip/index', { trips }))
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
    let numDays = Math.round(timeDifference / (1000 * 60 * 60 * 24));

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
    let trip = new model(req.body);
    trip.save() //insert the document to the database
        .then(trip => res.redirect('/trips'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

exports.showTrip = (req, res, next) => {
    let id = req.params.id;

    if (ObjectId.isValid(id) === false) {
        let err = new Error('Cannot find trip with id: ' + id);
        err.status = 404;
        next(err);
        return;
    }

    model.findById(id)
        .then(trip => {
            if (trip) {
                /*let maxDaysShown = 5;

                let startDay = 0;
                let endDay = (trip.days.length < maxDaysShown) ? trip.days.length - 1: maxDaysShown - 1;*/

                //If query is found in url
                /*let query = req._parsedOriginalUrl.query;
                if (query) {
                    let splitQuery = query.split('&');
                    console.log(splitQuery);
                    let dayArray = [];

                    for (let i = 0; i < splitQuery.length; i++) {
                        let index = splitQuery[i].indexOf('=');
                        //If startDay is not in query
                        if (i === 0) {
                            let queryString = splitQuery[i].substring(0, index);
                            if (queryString !== 'startDay') {
                                let err = new Error('Start day must be included');
                                err.status = 400;
                                next(err);
                                return;
                            }
                        }
                        let number = splitQuery[i].substring(index + 1, splitQuery[i].length);
                        if (!isNaN(number))
                            number = Math.floor(number);
                        dayArray.push(number);
                    }
                    console.log('DAY ARRAY: ' + dayArray);

                    startDay = dayArray[0];
                    //Set end day if not included in query
                    endDay = dayArray[1];
                    if (!endDay) {
                        endDay = (trip.days.length < maxDaysShown) ? trip.days.length : startDay + maxDaysShown;
                    }
                    console.log('END DAY2: ' + endDay);
                    if (isNaN(startDay)) {
                        let err = new Error('Invalid start day: ' + startDay);
                        err.status = 400;
                        next(err);
                        return;
                    }
                    if (isNaN(endDay)) {
                        let err = new Error('Invalid end day: ' + endDay);
                        err.status = 400;
                        next(err);
                        return;
                    }
                    //Invalid start day
                    if (startDay < 0 || startDay > endDay) {
                        let err = new Error('Invalid start day: ' + startDay);
                        err.status = 400;
                        next(err);
                        return;
                    }
                    //Invalid end day
                    if (endDay > trip.days.length) {
                        let err = new Error('End day out of range: ' + endDay);
                        err.status = 400;
                        next(err);
                        return;
                    }
                }*/
                const { DateTime } = require('luxon');
                res.render('./trip/showTrip', { trip: trip, DateTime: DateTime });
            } else {
                let err = new Error('Cannot find trip with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));

}

exports.editTrip = (req, res, next) => {
    //res.send('Send edit form');
    let id = req.params.id;

    model.findById(id)
        .then(trip => {
            if (trip) {
                res.render('./trip/editTrip', { trip: trip });
            } else {
                let err = new Error('Cannot find trip with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.updateTrip = (req, res, next) => {
    //res.send('Update trip with id ' + req.params.id);
    let id = req.params.id;

    if (ObjectId.isValid(id) === false) {
        let err = new Error('Cannot find trip with id: ' + id);
        err.status = 404;
        next(err);
        return;
    }

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
    model.findById(id)
        .then(trip => {
            if (trip) {
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
                    model.findByIdAndUpdate(id, { $set: tripFields, days: combinedDays }, { useFindAndModify: false, runValidators: true })
                        .then(trip => {
                            if (trip) {
                                res.redirect('/trips/' + id);
                                return;
                            } else {
                                let err = new Error('Cannot find trip with id: ' + id);
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

                    model.findByIdAndUpdate(id, { $set: tripFields, days: daysToKeep }, { useFindAndModify: false, runValidators: true })
                        .then(trip => {
                            if (trip) {
                                res.redirect('/trips/' + id);
                                return;
                            } else {
                                let err = new Error('Cannot find trip with id: ' + id);
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
                console.log('HERE');
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
                    model.findByIdAndUpdate(id, { $set: tripFields, days: updatedDays }, { useFindAndModify: false, runValidators: true })
                        .then(trip => {
                            if (trip) {
                                res.redirect('/trips/' + id);
                                return;
                            } else {
                                let err = new Error('Cannot find trip with id: ' + id);
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

            } else {
                let err = new Error('Cannot find trip with id: ' + id);
                err.status = 404;
                next(err);
                return;
            }
        })
        .catch(err => {
            next(err);
            return;
        });
};

exports.deleteTrip = (req, res, next) => {
    //res.send('Delete trip with id ' + req.params.id);
    let id = req.params.id;
    if (ObjectId.isValid(id) === false) {
        let err = new Error('Cannot find trip with id: ' + id);
        err.status = 404;
        next(err);
        return;
    }

    model.findByIdAndDelete(id, { useFindAndModify: false })
        .then(trip => {
            if (trip) {
                res.redirect('/trips');
            } else {
                let err = new Error('Cannot find trip with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.showDay = (req, res, next) => {
    //res.send('Show day with id ' + req.params.id);
    let id = req.params.id;
    let dayId = req.params.dayId;

    model.findById(id)
        .then(trip => {
            if (trip) {
                let days = trip.days;
                //Sort days
                //days.sort((a, b) => (a.number > b.number) ? 1 : ((b.number > a.number) ? -1 : 0));
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
                    res.render('./trip/showDay', { day, dayId, trip, prevId, nextId, firstId, DateTime });
                } else {
                    let err = new Error('Cannot find day with id: ' + dayId);
                    err.status = 404;
                    next(err);
                }
            } else {
                let err = new Error('Cannot find trip with id: ' + id);
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
            if (trip) {
                let days = trip.days;
                let day = days.find(day => day.number == dayId);
                if (day) {
                    res.render('./trip/editDay', { trip, day });
                } else {
                    let err = new Error('Cannot find day number: ' + dayId);
                    err.status = 404;
                    next(err);
                }
            } else {
                let err = new Error('Cannot find trip with id: ' + id);
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

    model.updateOne({ _id: tripId, 'days.number': parseInt(dayId) },
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
                let err = new Error('Cannot find trip with id: ' + tripName);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));

    /*model.updateOne()
        .then(day => {
            if (day) {
                console.log('DAY: ' + JSON.stringify(day));
                res.redirect('/trips/' + tripId + '/' + dayId);
            } else {
                let err = new Error('Cannot find trip with id: ' + tripName);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            console.log('ERROR HERE');
            next(err);
        });*/
}

exports.generatePDF = (req, res, next) => {
    let id = req.params.id;

    model.findById(id)
        .then(trip => {
            if (trip) {
                const pdf = require('../public/javascript/generatePDF.js');
                const stream = res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment;filename=' + trip.name + '.pdf'
                });
                pdf.generatePDF(trip,
                    (chunk) => stream.write(chunk),
                    () => stream.end()
                );
                console.log("HERE2");
                
            } else {
                let err = new Error('Cannot find trip with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
}



