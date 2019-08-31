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
            getTvGenre(icon);

            document.getElementById("error").classList.add("displayNone");
        });
};

currentWeather = (data) => {
    const temperature = data.currently.temperature.toFixed(0);
    const humidity = data.currently.humidity * 100;
    const fixedHumidity = humidity.toFixed(0);
    const windSpeed = data.currently.windSpeed.toFixed(0);

    document.getElementById("temperature").textContent = temperature + "\xB0F";
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
    const addressError = document.getElementById("error");
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
            addressError.classList.remove("displayNone");
            addressError.textContent = 'Please input a location';
            throw("Please input a location");
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
    document.getElementById("loadingIcon").classList.remove("displayNone");
});

document.getElementById("searchLocationButton").addEventListener("click", function () {
    const address = document.getElementById("searchLocationInitial").value;
    address.replace(/ /g, '+');

    document.getElementById("loadingIcon").classList.remove("displayNone");
    searchData(address);
});

addIcons = (icon, iconDiv) => { //creates skycons from skycon.js, code came from dark sky
     let iconName = icon.replace(/-/g, '_').toUpperCase(); //replaces hyphen to an underscore to match dark sky data
     let skycons = new Skycons({"color": "black"});
     skycons.add(iconDiv, Skycons[iconName]);
     skycons.play();
 };

 getTvGenre = (icon) => {
     let genreID = '';
     let networkID = '';
     let choiceDescription = '';
     const checkboxes = document.querySelectorAll("input[type='checkbox']");
     const choiceDescText = document.getElementById("choiceDescription");
     const networkError = document.getElementById("error");

     for(let i = 0; i<checkboxes.length; i++){
         if(checkboxes[i].checked){
             networkID += "|"+checkboxes[i].value;
         }
     }

     networkID = networkID.substring(1);
     console.log(networkID);

     if(networkID === ''){
         networkError.textContent = 'Please select a service';
         networkError.classList.remove("displayNone");
         throw ("Please select a service");
     }

     switch(icon){ //Get genre based on the icon property returned from dark sky and create a description.
         case 'clear-night':
             genreID = 12;
             choiceDescription = "It's a clear night tonight. So why not begin an adventure.";
             break;
         case 'rain':
             genreID = '53|18';
             choiceDescription = "It seems to be raining. This might be a good time to start a thriller";
             break;
         case 'cloudy':
             genreID = 9648;
             choiceDescription = "It's cloudy out, maybe a mystery will fit this dreary day.";
             break;
         case 'partly-cloudy-night':
             genreID = 27;
             choiceDescription = "It's a dark dreary night. This is a perfect time to start a horror show";
             break;
         case 'partly-cloudy-day':
             genreID = 35;
             choiceDescription = "It's a fair day, why not begin a comedy.";
             break;
         case 'snow':
             genreID = 14;
             choiceDescription = "It's cold and snowing. You should forget about it by going into a fantasy world";
             break;
         case 'wind':
             genreID = 99;
             choiceDescription = "The winds are howling out... That's a great time to learn something from a documentary.";
             break;
         case 'fog':
             genreID = '27|53|9648';
             choiceDescription = "The fog outside is quite ominous. That means it is a great time to start a horror show.";
             break;
         case 'sleet':
             genreID = 878;
             choiceDescription = "It's sleeting out, why don't you watch a science fiction show to forget about it.";
             break;
         case 'clear-day':
             genreID = 18;
             choiceDescription = "It's a nice day, why not start a drama.";
             break;
         default:
             genreID = 18;
             choiceDescription = "There's an issue... So why not just start a simple drama."
     }

     console.log(choiceDescription);
     choiceDescText.textContent = choiceDescription;
     getTvData(genreID, networkID);
 };

 getTvData = (genreID, networkID) => { //Get the related television data from  theMovieDB
     const mUrl = ` https://api.themoviedb.org/3/discover/tv?with_genres=${genreID}&with_networks=${networkID}&api_key=8537640e0fb0b17e1614e53e9322da86`;
     const loadingIcon = document.getElementById("loadingIcon");
     console.log(genreID);

     fetch(mUrl)
         .then(response => {
             return response.json(); //returns json object from the api.
         })
         .then(info => {
             console.log(info);
             document.getElementById("tvRecommendations").innerHTML = '';
             loadingIcon.classList.add("displayNone");
             document.getElementById("currentWeather").classList.remove("displayNone");
             displayTvData(info);
         });
 };

 displayTvData = (info) => { //Insert the data returned from theMovieDb into index.html
     const tvContainer = document.getElementById("tvRecommendations");

     info.results.forEach(function(ele){ //Loops through the JSON returned from theMovieDB
         const tv = document.createElement("div");
         const tvPoster = document.createElement("img");
         const tvDataContainer = document.createElement("div");
         const tvTitle = document.createElement("h1");
         const tvReleaseDate = document.createElement("h3");
         const tvScore = document.createElement("div");
         const tvOverview = document.createElement("p");

         tv.classList.add("tvStyling");
         tvPoster.classList.add("tvPosterStyling");
         tvScore.classList.add("tvScoreStyling");
         tvOverview.classList.add("tvOverviewStyling");
         tvDataContainer.classList.add("tvContainerStyling");

        tvPoster.src = 'https://image.tmdb.org/t/p/w154'+ele.poster_path;
        tvTitle.textContent = ele.original_name;
        tvReleaseDate.textContent = "Originally aired in "+ shortenText(ele.first_air_date, 4);
        tvScore.textContent = ele.vote_average;
        tvOverview.textContent = shortenText(ele.overview, 250);

        tv.append(tvPoster);
        tv.append(tvDataContainer);
        tvDataContainer.append(tvTitle);
        tvDataContainer.append(tvReleaseDate);
        tv.append(tvScore);
        tvDataContainer.append(tvOverview);
        tvContainer.append(tv);

        tvDataContainer.addEventListener("click", function(){
            displayPopUp(ele.poster_path, ele.original_name, ele.overview, ele.vote_average, ele.first_air_date, ele.backdrop_path);
        });

         changeRatingColor(ele.vote_average, tvScore); //Change the color of the tvScore, so it is easier to discern between scores
         addDecimalPoint(ele.vote_average, tvScore); //Some of the ratings returned from theMovieDB lack a decimal point. Add a decimal to make data fit with the rest.
     });
 };

 shortenText = (text, val) => { //Shortens the overview, so it fits inside tvDataContainer
     let slicedText = text.slice(0, val); //Slices text to a selected number of characters starting at the first character

     if(slicedText.length >= 250){
         return slicedText = slicedText+"...";
     }
     else{
         return slicedText;
     }
 };

 changeRatingColor = (ratingNum, ratingContainer) => { //Change the color of the tvScore, so it is easier to discern between scores
   if(ratingNum >= 7.0){
       ratingContainer.classList.add("tvScore7Plus");
   }
   else if(ratingNum <= 6.9 && ratingNum >= 5.0){
       ratingContainer.classList.add("tvScore5-7");
   }
   else{
       ratingContainer.classList.add("tvScore4Below");
   }
 };

 addDecimalPoint = (ratingNum, scoreContainer) =>{ //Some of the ratings returned from theMovieDB lack a decimal point. Adds a decimal to make data fit with the rest.
     ratingNum = String(ratingNum);
     if(ratingNum.length < 2 && ratingNum < 10 && ratingNum > 0){
         scoreContainer.textContent = ratingNum+".0";
         console.log(scoreContainer.textContent);
     }
 };

 displayPopUp = (poster, title, overview, score, date, backdrop) => {
     const popUpContainer = document.getElementById("popUpContainer");
     const popUp = document.getElementById("popUp");
     const popUpPoster = document.createElement("img");
     const popUpTitle = document.createElement("h1");
     const popUpReleaseDate = document.createElement("h3");
     const popUpScore = document.createElement("div");
     const popUpOverview = document.createElement("p");

     popUpContainer.classList.remove("displayNone");
     popUp.classList.remove("displayNone");
     popUpContainer.classList.add("centerChildren");
     popUpScore.classList.add("tvScoreStyling");

     popUpPoster.src = 'https://image.tmdb.org/t/p/w342'+poster;
     popUpContainer.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backdrop})`;
     popUpTitle.textContent = title;
     popUpReleaseDate.textContent = date;
     popUpScore.textContent = score;
     popUpOverview.textContent = overview;

     popUp.append(popUpPoster);
     popUp.append(popUpTitle);
     popUp.append(popUpScore);
     popUp.append(popUpReleaseDate);
     popUp.append(popUpOverview);

     changeRatingColor(score, popUpScore);
 };

 document.getElementById("closePopUp").addEventListener("click", function(e){
     const popUpCont = document.getElementById("popUpContainer");
     const popUp = document.getElementById("popUp");

     popUpCont.classList.add("displayNone");
     popUpCont.classList.remove("centerChildren");
     popUp.classList.add("displayNone");

     popUp.innerHTML = '';
     popUpCont.style.backgroundImage = '';
 });