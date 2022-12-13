document.getElementById('trip_submit').addEventListener('click', function(event) {
    let startDateElem = document.getElementById('startDate');
    let endDateElem = document.getElementById('endDate');

    let startDate = new Date(startDateElem.value);
    let endDate = new Date(endDateElem.value);

    let timeDifference = endDate.getTime() - startDate.getTime();

    if (timeDifference < 0) {
        event.preventDefault();
        startDateElem.setCustomValidity('Start date must be before or on end date.');
        startDateElem.reportValidity();
    } else {
        startDateElem.setCustomValidity('');
    }

    //Check trip name, location and details for spaces
    let tripNameElem = document.getElementById('name');
    let locationElem = document.getElementById('location');
    let detailsElem = document.getElementById('details');

    let tripName = tripNameElem.value.trim();
    let location = locationElem.value.trim();
    let details = detailsElem.value.trim();

    if (tripName === '') {
        event.preventDefault();
        tripNameElem.setCustomValidity('Trip name cannot be blank.');
        tripNameElem.reportValidity();
        //Add event listener
        tripNameElem.addEventListener('input', () => {
            tripNameElem.setCustomValidity('');
        })
        return;
    } else {
        tripNameElem.setCustomValidity('');
    }

    if (location === '') {
        event.preventDefault();
        locationElem.setCustomValidity('Location cannot be blank.');
        locationElem.reportValidity();
        //Add event listener
        locationElem.addEventListener('input', () => {
            locationElem.setCustomValidity('');
        })
        return;
    } else {
        locationElem.setCustomValidity('');
    }

    if (details === '') {
        event.preventDefault();
        detailsElem.setCustomValidity('Details cannot be blank.');
        detailsElem.reportValidity();
        //Add event listener
        detailsElem.addEventListener('input', () => {
            detailsElem.setCustomValidity('');
        })
        return;
    } else {
        detailsElem.setCustomValidity('');
    }
});

document.getElementById('cancel').addEventListener('click', function(event) {
    event.preventDefault();
    let currentURL = window.location.href;
    let index = currentURL.lastIndexOf('/');
    let redirectURL = currentURL.substring(0, index);
    window.location.href = redirectURL;
});
