document.getElementById('showTrips').addEventListener('change', () => {
    let currentUrl = window.location.href.split('?')[0];
    let newUrl = currentUrl + '?show=' + document.getElementById('showTrips').value;
    window.location.replace(newUrl);
});
