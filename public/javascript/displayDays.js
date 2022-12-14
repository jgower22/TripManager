var days = document.getElementById('days');
var trip = <% - JSON.stringify(trip) %>;
var tripDays = trip.days;
var numDays = tripDays.length;
//Max length is 3 currently
var acceptedValues = [7, 14, 21];
acceptedValues.push(numDays);

//Init max days shown
var maxDaysShown;
if (typeof (Storage) !== 'undefined') {
    if (localStorage.getItem('maxDaysShown') === null) {
        localStorage.setItem('maxDaysShown', acceptedValues[0]);
        maxDaysShown = acceptedValues[0];
    } else {
        maxDaysShown = isNaN(localStorage.getItem('maxDaysShown')) ? acceptedValues[0] : localStorage.getItem('maxDaysShown');
        if (acceptedValues.includes(parseInt(maxDaysShown)) === false) {
            maxDaysShown = acceptedValues[0];
            localStorage.setItem('maxDaysShown', maxDaysShown);
        }
    }
} else {
    maxDaysShown = acceptedValues[0];
}

var currentStartDay = 0;
var currentEndDay = (trip.days.length < maxDaysShown) ? trip.days.length - 1 : maxDaysShown - 1;

function showDays(leftButtonClicked, rightButtonClicked) {
    let maxDaysShown = localStorage.getItem('maxDaysShown');
    if (acceptedValues.includes(parseInt(maxDaysShown)) === false) {
        maxDaysShown = acceptedValues[0];
        localStorage.setItem('maxDaysShown', maxDaysShown);
    }
    if (tripDays.length < maxDaysShown && currentStartDay === 0) {
        maxDaysShown = tripDays.length;
    }
    let daysHTML = '';

    //Update start and end day when left button is clicked
    if (leftButtonClicked === true) {
        let tempStartDay = currentStartDay;
        currentStartDay = ((currentStartDay - maxDaysShown) <= 0) ? 0 : currentStartDay - maxDaysShown;
        currentEndDay = (((currentEndDay - maxDaysShown) < 0) ? tripDays.length - 1 : tempStartDay - 1);
        //currentEndDay = ((currentEndDay - maxDaysShown) <= 0) ? maxDaysShown - 1: (currentEndDay - (currentEndDay - (tempStartDay - 1)));
        if ((currentEndDay - currentStartDay + 1) < maxDaysShown && maxDaysShown < tripDays.length) {
            currentEndDay = currentStartDay + parseInt(maxDaysShown) - 1;
        }
    }

    //Update start and end day when right button is clicked
    if (rightButtonClicked === true) {
        currentStartDay = ((currentStartDay + parseInt(maxDaysShown)) >= trip.days.length) ? trip.days.length - 1 : currentStartDay + parseInt(maxDaysShown);
        currentEndDay = ((currentEndDay + parseInt(maxDaysShown)) >= trip.days.length) ? trip.days.length - 1 : currentEndDay + parseInt(maxDaysShown);
    }

    let formattedTotalDays = (tripDays.length > 1) ? 'days' : 'day';
    if (tripDays.length > 1) {
        daysHTML += "<h3 id='showMessage'>" + "Showing days " + currentStartDay + "-" + currentEndDay + " out of " + numDays + " days" + "</h3>";
    } else if (tripDays.length === 1) {
        daysHTML += "<h3 id='showMessage'>" + "Showing day " + currentStartDay + " out of " + numDays + " day" + "</h3>";
    } else {
        daysHTML += '<p>You have added no days to this trip.</p>';
    }

    //Add select options
    daysHTML += "<select name='maxDaysSelect' id='maxDaysSelect'>";
    switch (parseInt(maxDaysShown)) {
        case acceptedValues[0]:
            daysHTML += "<option value='" + acceptedValues[0] + "' selected>Show " + acceptedValues[0] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[1] + "'>Show " + acceptedValues[1] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[2] + "'>Show " + acceptedValues[2] + " Days</option>";
            daysHTML += "<option value='All'>Show All Days</option>";
            break;
        case acceptedValues[1]:
            daysHTML += "<option value='" + acceptedValues[0] + "'>Show " + acceptedValues[0] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[1] + "' selected>Show " + acceptedValues[1] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[2] + "'>Show " + acceptedValues[2] + " Days</option>";
            daysHTML += "<option value='All'>Show All Days</option>";
            break;
        case acceptedValues[2]:
            daysHTML += "<option value='" + acceptedValues[0] + "'>Show " + acceptedValues[0] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[1] + "'>Show " + acceptedValues[1] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[2] + "' selected>Show " + acceptedValues[2] + " Days</option>";
            daysHTML += "<option value='All'>Show All Days</option>";
            break;
        case tripDays.length:
            daysHTML += "<option value='" + acceptedValues[0] + "'>Show " + acceptedValues[0] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[1] + "'>Show " + acceptedValues[1] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[2] + "'>Show " + acceptedValues[2] + " Days</option>";
            daysHTML += "<option value='All' selected>Show All Days</option>";
            break;
        default:
            daysHTML += "<option value='" + acceptedValues[0] + "' selected>Show " + acceptedValues[0] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[1] + "'>Show " + acceptedValues[1] + " Days</option>";
            daysHTML += "<option value='" + acceptedValues[2] + "'>Show " + acceptedValues[2] + " Days</option>";
            daysHTML += "<option value='All'>Show All Days</option>";
    }
    daysHTML += "</select>";

    if (tripDays.length < maxDaysShown) {
        maxDaysShown = tripDays.length;
        localStorage.setItem('maxDaysShown', maxDaysShown);
    }

    for (let i = currentStartDay; i <= currentEndDay; i++) {
        let day = tripDays[i];
        let newDay = "<li class='list'><a href='" + trip._id + "/" + day.number + "' class='link_underline day_links'>Day " + day.number + " - " + day.location + "</a></li>";
        daysHTML += newDay;
    }

    //Add prev/next buttons if necessary
    let addLeftButton = true;
    if (currentStartDay === 0) {
        addLeftButton = false;
    }

    if (addLeftButton) {
        daysHTML += "<button id='left_button' class='button' ><</button>";
    }

    let addRightButton = true;
    if (currentEndDay === tripDays.length - 1) {
        addRightButton = false;
    }

    if (addRightButton) {
        daysHTML += "<button id='right_button' class='button' >></button>";
    }
    days.innerHTML = daysHTML;

    document.getElementById('maxDaysSelect').addEventListener('change', handleSelectChange);

    if (addLeftButton) {
        let leftButton = document.getElementById('left_button');
        leftButton.addEventListener('click', function () {
            showDays(true, false);
        });
    }

    if (addRightButton) {
        let rightButton = document.getElementById('right_button');
        rightButton.addEventListener('click', function () {
            showDays(false, true);
        });
    }
}

showDays(false, false);

function handleSelectChange() {
    //Get and set new value to local storage
    let selectedMaxDaysShown = document.getElementById('maxDaysSelect').value;
    if (selectedMaxDaysShown === 'All') {
        currentStartDay = 0;
        selectedMaxDaysShown = trip.days.length;
    }
    localStorage.setItem('maxDaysShown', selectedMaxDaysShown);
    let storedMaxDaysShown = localStorage.getItem('maxDaysShown');
    maxDaysShown = (storedMaxDaysShown > trip.days.length - 1 && currentStartDay === 0) ? trip.days.length : storedMaxDaysShown;

    currentEndDay = ((currentStartDay + parseInt(maxDaysShown)) - 1 > trip.days.length - 1) ? trip.days.length - 1 : currentStartDay + parseInt(maxDaysShown) - 1;

    showDays(false, false);
}

document.getElementById('maxDaysSelect').addEventListener('change', handleSelectChange);
