var map = L.map('map');

L.tileLayer('https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=0a331cec46msha5267eaaefc05a8p19a68djsnf25ad50c8a46', {
    //attribution: 'Tiles &copy: <a href="https://www.maptilesapi.com/">MapTiles API</a>, Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    zoom: 13
}).addTo(map);

map.setView([0, 0], 1);

//Get location from locationHeader on page
//var locationToSet = document.getElementById('locationHeader').innerHTML;
var zoomLevel = 11;
//If on trip overview, set zoom level to 4

var tripLocations = document.getElementById('tripLocations').value;
tripLocations = JSON.parse(tripLocations);
var locations = [];
for (let i = 0; i < tripLocations.length; i++) {
    locations.push(tripLocations[i].location);
}

const savedLocations = [];
//Find locations lat/long first
let delay = 1000;
let isFirstLocation = true;
const findLocations = location =>
    new Promise(resolve => 
        setTimeout(() => {
            resolve(location);
        }, delay)
    );

const findAllLocations = async () => {
    for (let i = 0; i < locations.length; i++) {

        const wait = await findLocations(location);

        var geonamesURL = 'http://secure.geonames.org/searchJSON?q=' +
    
        locations[i] +
    
        '&maxRows=10&style=short&username=jgower17';
    
        fetch(geonamesURL)
    
        .then((response) => response.json())
    
        .then((data) => {
    
            if (data.totalResultsCount === 0) {
                //Do nothing
            } else {
                //Else save first result
                let currentLocation = data.geonames[0];
                var marker = L.marker([currentLocation.lat, currentLocation.lng]).addTo(map);
                marker.bindPopup(locations[i]).openPopup();
            }
        }).catch(err => {
            map.setView([0, 0], 12);
                L.popup()
                    .setLatLng([0, 0])
                    .setContent('Error. Please try again later.')
                    .openOn(map);
        });
    }
};

findAllLocations();





