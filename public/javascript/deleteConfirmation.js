try {
    document.getElementById('delete').addEventListener('click', function(event) {

        //Ask for confirmation
        if (confirm('Are you sure you want to permanently delete this trip? Press OK to delete the trip or press cancel to keep the trip.') === false) {
            event.preventDefault();
        }
    
    });
} catch (err) {
    
}
