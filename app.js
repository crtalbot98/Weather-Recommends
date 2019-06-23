 function weatherData(lat, long) {
    const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/c49f18cf8080ffde23271b8bc70cb0e6/${long},${lat}`;
    fetch(url) //fetches data from dark sky weather api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(data => {
            console.log(data);

            const temperature = data.currently.temperature.toFixed(0);
            const humidity = data.currently.humidity * 100;
            const fixedHumidity = humidity.toFixed(0);
            const windSpeed = data.currently.windSpeed.toFixed(0);
            const summary = data.daily.summary;
            const icon = data.currently.icon;

            document.getElementById("temperature").textContent = temperature + " F";
            document.getElementById("dailySummary").textContent = summary;
            document.getElementById("humidityVal").textContent = fixedHumidity + "%";
            document.getElementById("windSpeedVal").textContent = windSpeed + " mph";

            const iconDiv = document.getElementById("icons");

            addIcons(icon, iconDiv);

            // document.getElementById("userSearchPrompt").classList.add("displayNone");
            document.getElementById("container").classList.remove("displayNone");
        });
}

function locationData(lat, long){
    const latLongUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${long},${lat}&key=AIzaSyCL1XyeWCGSoTrrMrrXlOOmRDn9quGagUI`;

    fetch(latLongUrl) //fetches information from google geocoding api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(info => {
            console.log(info);
            document.getElementById("timezone").textContent = info.results[6].formatted_address;
        })
}

function searchData(address){
    const addressUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyCL1XyeWCGSoTrrMrrXlOOmRDn9quGagUI`;
    let searchLat = '';
    let searchLong = '';

    fetch(addressUrl) //fetches information from google geocoding api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(info => {
            searchLat = info.results[0].geometry.location.lat;
            searchLong = info.results[0].geometry.location.lng;
            document.getElementById("error").classList.add("displayNone");

            weatherData(searchLong, searchLat);
        })
        .catch( error =>{
            console.log("error!");
            document.getElementById("error").classList.remove("displayNone");
            throw(error);
    });

}

function getLatAndLong(){
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (location) {
            const lat = location.coords.longitude.toFixed(4); //gets longitude coordinates from the location of user.
            const long = location.coords.latitude.toFixed(4); //get latitude coordinates from the location of the user.

            weatherData(lat, long);
            locationData(lat, long);
        })
    }
    else{
        alert("Please allow the use of your location in your browser."); //alert users that have location blocked
    }
}

document.getElementById("useCurrentLocation").addEventListener("click", function () {
    getLatAndLong();
});

document.getElementById("searchLocationButton").addEventListener("click", function () {
    const address = document.getElementById("searchLocationInitial").value;
    address.replace(/ /g, '+');

    searchData(address);
});

 function addIcons(icon, iconDiv){ //creates skycons from skycon.js, code came from dark sky
     let iconName = icon.replace(/-/g, '_').toUpperCase(); //replaces hyphen to an underscore to match dark sky data
     let skycons = new Skycons({"color": "white"});
     skycons.add(iconDiv, Skycons[iconName]);
     skycons.play();
 }

