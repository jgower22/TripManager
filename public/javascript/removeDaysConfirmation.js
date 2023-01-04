var startDateElem = document.getElementById('startDate');
var endDateElem = document.getElementById('endDate');
var startDate = new Date(startDateElem.value);
var endDate = new Date(endDateElem.value);
var timeDifference = endDate.getTime() - startDate.getTime();
var numDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

document.getElementById('submit').addEventListener('click', function(event) {

    let startDateElem = document.getElementById('startDate');
    let endDateElem = document.getElementById('endDate');

    let startDate = new Date(startDateElem.value);
    let endDate = new Date(endDateElem.value);

    let timeDifference = endDate.getTime() - startDate.getTime();

    if (timeDifference < 0) {
        event.preventDefault();
        startDateElem.setCustomValidity('Start date must be before or on end date.');
        startDateElem.reportValidity();
        return;
    } else {
        startDateElem.setCustomValidity('');
    }

    //Check for new num days
    var newStartDate = new Date(startDateElem.value);
    var newEndDate = new Date(endDateElem.value);
    var newTimeDifference = newEndDate.getTime() - newStartDate.getTime();
    var newNumDays = Math.floor(newTimeDifference / (1000 * 60 * 60 * 24));

    if (newNumDays < numDays) {
        //Ask for confirmation
        if (confirm('Are you sure you want to shorten this trip? Some days will be permanently deleted. Press OK to continue or press cancel to go back.') === false) {
            event.preventDefault();
        }
    }

});