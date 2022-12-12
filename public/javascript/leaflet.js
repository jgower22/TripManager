var map = L.map('map');

L.tileLayer('https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=0a331cec46msha5267eaaefc05a8p19a68djsnf25ad50c8a46', {
    //attribution: 'Tiles &copy: <a href="https://www.maptilesapi.com/">MapTiles API</a>, Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    zoom: 13
}).addTo(map);


//Get location from locationHeader on page
var locationToSet = document.getElementById('locationHeader').innerHTML;
var zoomLevel = 11;
//If on trip overview, set zoom level to 4
try {
    let tripName = document.getElementById('tripName').value;
    zoomLevel = 4;
} catch (err) {
    console.log('ERROR');
}
locationToSet = locationToSet.substring(locationToSet.indexOf(':') + 1, locationToSet.length).trim();
console.log('LOCATION: ' + locationToSet);

// build the URL to the geonames API including the name that was entered
var geonamesURL = 'http://secure.geonames.org/searchJSON?q=' +

    locationToSet +

    '&maxRows=10&style=short&username=jgower17';

// send the request the geonames service/process the response when available
fetch(geonamesURL)

    .then((response) => response.json())

    .then((data) => {

        console.log('DATA: ' + JSON.stringify(data));

        if (data.totalResultsCount === 0) {
            map.setView([0, 0], 12);
            L.popup()
                .setLatLng([0, 0])
                .setContent('Location not found.')
                .openOn(map);
        } else {
            // loop through the "N" items returned in the data array
            for (var i = 0; i < data.geonames.length; i++) {
                console.log(data.geonames[i].name);

                if (i == 0)  {
                    // Centers the view on the first location
                    map.setView([data.geonames[i].lat, data.geonames[i].lng], zoomLevel);
    
                    var marker = L.marker([data.geonames[i].lat, data.geonames[i].lng]).addTo(map);
                }


            }
        }
    }).catch(err => {
        map.setView([0, 0], 12);
            L.popup()
                .setLatLng([0, 0])
                .setContent('Error. Please try again later.')
                .openOn(map);
    });



