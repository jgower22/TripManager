const validator = require('validator');

exports.unescapeTrip = (trip) => {
    trip.name = validator.unescape(trip.name);
    trip.location = validator.unescape(trip.location);
    trip.details = validator.unescape(trip.details);
};

exports.unescapeTripNames = (trips) => {
    for (let i = 0; i < trips.length; i++) {
        let trip = trips[i];
        trip.name = validator.unescape(trip.name);
    }
};