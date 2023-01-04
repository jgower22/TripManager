const validator = require('validator');

exports.unescapeTrip = (trip) => {
    //Overall trip details
    trip.name = validator.unescape(trip.name);
    trip.location = validator.unescape(trip.location);
    trip.details = validator.unescape(trip.details);
};

exports.unescapeTripName = (trip) => {
    trip.name = validator.unescape(trip.name);
}

exports.unescapeTripNames = (trips) => {
    //Trip names on list of trips page
    for (let i = 0; i < trips.length; i++) {
        let trip = trips[i];
        trip.name = validator.unescape(trip.name);
    }
};

exports.unescapeTripDay = (day) => {
    //Unescape one single day for a given trip
    day.location = validator.unescape(day.location);
    day.details = validator.unescape(day.details);
}

exports.unescapeTripDays = (trip) => {
    //Each individual day for a given trip
    for (let i = 0; i < trip.days.length; i++) {
        let day = trip.days[i];
        day.location = validator.unescape(day.location);
        day.details = validator.unescape(day.details);
    }
}

exports.unescapeTripLocations = (trips) => {
    //Trip locations for profile page
    for (let i = 0; i < trips.length; i++) {
        let trip = trips[i];
        trip.location = validator.unescape(trip.location);
    }
}