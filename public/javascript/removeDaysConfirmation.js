var startDateElem = document.getElementById('startDate');
var endDateElem = document.getElementById('endDate');
var startDate = new Date(startDateElem.value);
var endDate = new Date(endDateElem.value);
var timeDifference = endDate.getTime() - startDate.getTime();
var numDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

document.getElementById('trip_submit').addEventListener('click', function(event) {

    //Check for new num days
    var newStartDate = new Date(startDateElem.value);
    var newEndDate = new Date(endDateElem.value);
    var newTimeDifference = newEndDate.getTime() - newStartDate.getTime();
    var newNumDays = Math.floor(newTimeDifference / (1000 * 60 * 60 * 24));

    if (newNumDays < numDays) {
        //Ask for confirmation
        if (confirm('Are you sure you want to shorten this trip? Some days will be permanently deleted. Press OK to continue or press cancel to stop this.') === false) {
            event.preventDefault();
        }
    }

});