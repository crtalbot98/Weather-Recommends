 weatherData = (lat, long) => {
    const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/c49f18cf8080ffde23271b8bc70cb0e6/${long},${lat}`;
    fetch(url) //fetches data from dark sky weather api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(data => {
            console.log(data);

            const iconDiv = document.getElementById("icons");
            const icon = data.currently.icon;

            addIcons(icon, iconDiv);
            currentWeather(data);
            getMovieGenre(icon);

            document.getElementById("currentWeather").classList.remove("displayNone");
            document.getElementById("error").classList.add("displayNone");
        });
};

currentWeather = (data) => {
    const temperature = data.currently.temperature.toFixed(0);
    const humidity = data.currently.humidity * 100;
    const fixedHumidity = humidity.toFixed(0);
    const windSpeed = data.currently.windSpeed.toFixed(0);

    document.getElementById("temperature").textContent = temperature + "F";
    document.getElementById("humidityVal").textContent = fixedHumidity + "%";
    document.getElementById("windSpeedVal").textContent = windSpeed + " mph";
};

locationData = (lat, long) => {
    const latLongUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${long},${lat}&key=AIzaSyCL1XyeWCGSoTrrMrrXlOOmRDn9quGagUI`;

    fetch(latLongUrl) //fetches information from google geocoding api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(info => {
            console.log(info);
            const city = info.results[0].address_components[2].long_name;
            const timezone = info.results[0].address_components[5].long_name;

            document.getElementById("timezone").textContent = city+", "+timezone;
        })
};

searchData = (address) => {
    const addressUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyCL1XyeWCGSoTrrMrrXlOOmRDn9quGagUI`;
    const inputAddress = document.getElementById("searchLocationInitial").value.toUpperCase();
    let searchLat = '';
    let searchLong = '';

    fetch(addressUrl) //fetches information from google geocoding api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(info => {
            searchLat = info.results[0].geometry.location.lat;
            searchLong = info.results[0].geometry.location.lng;

            document.getElementById("timezone").textContent = inputAddress;
            document.getElementById("error").classList.add("displayNone");

            weatherData(searchLong, searchLat);
        })
        .catch( error =>{
            console.log("error!");
            document.getElementById("error").classList.remove("displayNone");
            throw(error);
    });

};

getLatAndLong = () => {
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
};

document.getElementById("useCurrentLocation").addEventListener("click", function () {
    getLatAndLong();
});

document.getElementById("searchLocationButton").addEventListener("click", function () {
    const address = document.getElementById("searchLocationInitial").value;
    address.replace(/ /g, '+');

    searchData(address);
});

addIcons = (icon, iconDiv) => { //creates skycons from skycon.js, code came from dark sky
     let iconName = icon.replace(/-/g, '_').toUpperCase(); //replaces hyphen to an underscore to match dark sky data
     let skycons = new Skycons({"color": "black"});
     skycons.add(iconDiv, Skycons[iconName]);
     skycons.play();
 };

 getMovieGenre = (icon) => {
     let genreID = '';

     switch(icon){
         case 'clear-night':
             genreID = 12;
             console.log(genreID);
             break;
         case 'raining':
             genreID = 12;
             console.log(genreID);
             break;
         default:
             genreID = 18;
             console.log(genreID);
     }

     getMovieData(genreID);
 };

 getMovieData = (genreID) => {
     const mUrl = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreID}&api_key=8537640e0fb0b17e1614e53e9322da86`;
     console.log(genreID);
     fetch(mUrl)
         .then(response => {
             return response.json(); //returns json object from the api.
         })
         .then(info => {
             console.log(info);
             displayMovieData(info);
         });
 };

 displayMovieData = (info) => {
     const movieContainer = document.getElementById("movieRecommendations");

     info.results.forEach(function(ele){
         const movie = document.createElement("div");
         const moviePoster = document.createElement("img");

         movie.classList.add("movieStyling");
         moviePoster.classList.add("moviePosterStyling");

        moviePoster.src = 'https://image.tmdb.org/t/p/w154'+ele.poster_path;

        movieContainer.append(movie);
        movie.append(moviePoster);
     });
 };
 // function returnGenreFromWeather(icon){
 //     let genreID = '';
 //     switch(icon){
 //         case 'clear-night':
 //             genreID = 12;
 //             console.log(genreID);
 //             break;
 //         case 'raining':
 //             genreID = 12;
 //             console.log(genreID);
 //             break;
 //         default:
 //             genreID = 18;
 //             console.log(genreID);
 //     }
 // }

 // function switchTab(){
 //     const btns = document.getElementsByClassName("btn");
 //     const section = document.getElementsByTagName("section");
 //     let i = 0;
 //     let id = "";
 //
 //     for(i; i<btns.length; i++){
 //         let s = section[2+i].id;
 //         btns[i].addEventListener("click", function(){
 //             id = this.id+"Weather";
 //
 //             section.forEach(function(ele){
 //                 if(id === ele){
 //                     console.log("true: "+id+", "+s);
 //                     // s.classList.remove("notActive");
 //                     // s.classList.add("active");
 //                 }
 //                 else{
 //                     console.log("false: "+id+", "+s);
 //                 }
 //
 //                 // active = true;
 //                 //
 //                 if(ele.classList === "active"){
 //                     console.log("true");
 //                     document.getElementById(id).classList.remove("displayNone");
 //                 }
 //             });
 //         });
 //         console.log(s);
 //
 //         btns[i].addEventListener("blur", function() {
 //             s.classList.add("notActive");
 //             s.classList.remove("active");
 //             document.getElementById(id).classList.add("displayNone");
 //         });
 //     }
 //     // console.log(id);
 // }



 // switchTab();

