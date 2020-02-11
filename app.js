document.querySelector("#useCurrentLocation").addEventListener("click", function () {
    getLatAndLong();
    document.querySelector("#loadingIcon").classList.remove("displayNone");
});

document.querySelector("#searchLocationButton").addEventListener("click", function () { //triggers the search of content
    const address = document.getElementById("searchLocationInitial").value;
    address.replace(/ /g, '+');

    document.querySelector("#loadingIcon").classList.remove("displayNone");
    getGeocodeData(address);
});

weatherData = (lat, long) => {
    const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/c49f18cf8080ffde23271b8bc70cb0e6/${long},${lat}`;
    fetch(url) //fetches data from dark sky weather api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(data => {
            const iconDiv = document.querySelector("#icons");
            const icon = data.currently.icon;

            addIcons(icon, iconDiv);
            currentWeather(data);
            getTvGenre(icon);

            document.querySelector("#error").classList.add("displayNone");
        });
};

currentWeather = (data) => {//Get weather data and remove decimals
    const temperature = data.currently.temperature.toFixed(0);
    const humidity = data.currently.humidity * 100;
    const fixedHumidity = humidity.toFixed(0);
    const windSpeed = data.currently.windSpeed.toFixed(0);

    document.querySelector("#temperature").textContent = temperature + "\xB0F";
    document.querySelector("#humidityVal").textContent = fixedHumidity + "%";
    document.querySelector("#windSpeedVal").textContent = windSpeed + " mph";
};

locationData = (lat, long) => {
    const latLongUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${long},${lat}&key=AIzaSyCL1XyeWCGSoTrrMrrXlOOmRDn9quGagUI`;

    fetch(latLongUrl) //fetches information from google geocoding api
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(info => {
            const city = info.results[0].address_components[2].long_name;
            const timezone = info.results[0].address_components[5].long_name;

            document.querySelector("#timezone").textContent = city+", "+timezone;
        })
};

getGeocodeData = (address) => {
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

            document.querySelector("#timezone").textContent = inputAddress;
            document.querySelector("#error").classList.add("displayNone");

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

addIcons = (icon, iconDiv) => { //creates skycons from skycon.js, code came from dark sky
    let iconName = icon.replace(/-/g, '_').toUpperCase(); //replaces hyphen to an underscore to match dark sky data
    let skycons = new Skycons({"color": "black"}); //creates skycon with black color
    skycons.add(iconDiv, Skycons[iconName]);
    skycons.play();
};

getTvGenre = (icon) => {
    let networkID = '';
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const choiceDescText = document.querySelector("#choiceDescription");
    const networkError = document.querySelector("#error");
    const {genreID, choiceDescription} = getGenreDescription(icon);

    for(let i = 0; i<checkboxes.length; i++){
        if(checkboxes[i].checked){
            networkID += "|"+checkboxes[i].value;
        }
    }

    networkID = networkID.substring(1);

    if(networkID === ''){
        networkError.textContent = 'Please select a service';
        networkError.classList.remove("displayNone");
        throw ("Please select a service");
    }

    choiceDescText.textContent = choiceDescription;
    getTvData(genreID, networkID);
};

getGenreDescription = (icon) => {
    let genreID = '';
    let choiceDescription = '';

    switch(icon){ //Get genre based on the icon property returned from dark sky and create a description.
        case 'clear-night':
            genreID = '12';
            choiceDescription = "It's a clear night tonight. So why not begin an adventure.";
            break;
        case 'rain':
            genreID = '53|18';
            choiceDescription = "It seems to be raining. This might be a good time to start a thriller";
            break;
        case 'cloudy':
            genreID = '9648';
            choiceDescription = "It's cloudy out, maybe a mystery will fit this dreary day.";
            break;
        case 'partly-cloudy-night':
            genreID = 27;
            choiceDescription = "It's a dark dreary night. This is a perfect time to start a horror show";
            break;
        case 'partly-cloudy-day':
            genreID = '35';
            choiceDescription = "It's a fair day, why not begin a comedy.";
            break;
        case 'snow':
            genreID = '14';
            choiceDescription = "It's cold and snowing. You should forget about it by going into a fantasy world";
            break;
        case 'wind':
            genreID = '99';
            choiceDescription = "The winds are howling out... That's a great time to learn something from a documentary.";
            break;
        case 'fog':
            genreID = '27|53|9648';
            choiceDescription = "The fog outside is quite ominous. That means it is a great time to start a horror show.";
            break;
        case 'sleet':
            genreID = '878';
            choiceDescription = "It's sleeting out, why don't you watch a science fiction show to forget about it.";
            break;
        case 'clear-day':
            genreID = '18';
            choiceDescription = "It's a nice day, why not start a drama.";
            break;
        default:
            genreID = '18';
            choiceDescription = "There's an issue... So why not just start a simple drama."
    }

    return {
        genreID: genreID,
        choiceDescription: choiceDescription
    };
};

getTvData = (genreID, networkID) => { //Get the related television data from  theMovieDB
    const mUrl = ` https://api.themoviedb.org/3/discover/tv?with_genres=${genreID}&with_networks=${networkID}&api_key=8537640e0fb0b17e1614e53e9322da86`;
    const loadingIcon = document.querySelector("#loadingIcon");
    const tvRecommendations = document.querySelector("#tvRecommendations");

    fetch(mUrl)
        .then(response => {
            return response.json(); //returns json object from the api.
        })
        .then(info => {
            tvRecommendations.textContent = '';
            loadingIcon.classList.add("displayNone");
            document.querySelector("#currentWeather").classList.remove("displayNone");

            if(info.total_pages === 0){
                tvRecommendations.textContent = "There is nothing here... please try again."
            }

            displayTvData(info);
        });
};

displayTvData = (info) => { //Insert the data returned from theMovieDb into index.html
    const tvContainer = document.querySelector("#tvRecommendations");
    let opened = {check: false};

    info.results.forEach(function(ele){//Loops through the JSON returned from theMovieDB
        const element = {
            tv: document.createElement("div"),
            tvPoster: document.createElement("img"),
            tvDataContainer: document.createElement("div"),
            tvTitle: document.createElement("h1"),
            tvReleaseDate: document.createElement("h3"),
            tvScore: document.createElement("div"),
            tvOverview: document.createElement("p"),
        };

        element.tv.classList.add("tvStyling");
        element.tvPoster.classList.add("tvPosterStyling");
        element.tvScore.classList.add("tvScoreStyling");
        element.tvOverview.classList.add("tvOverviewStyling");
        element.tvDataContainer.classList.add("tvContainerStyling");

        checkStringLength(ele.overview, element.tvOverview);

        element.tvPoster.src = 'https://image.tmdb.org/t/p/w154'+ele.poster_path;
        element.tvTitle.textContent = ele.original_name;
        element.tvReleaseDate.textContent = shortenText(ele.first_air_date, 4);
        element.tvScore.textContent = ele.vote_average;

        element.tv.append(element.tvPoster, element.tvDataContainer, element.tvScore);
        element.tvDataContainer.append(element.tvTitle);
        element.tvDataContainer.append(element.tvReleaseDate);
        element.tvDataContainer.append(element.tvOverview);
        tvContainer.append(element.tv);

        element.tvDataContainer.addEventListener("click", function(){
                setTimeout(function () {
                    if(!opened.check) {
                    opened.check = true;
                    preventScrolling();
                    displayPopUp(ele, opened);
                    }
                }, 300);
        }, false);

        changeRatingColor(ele.vote_average, element.tvScore); //Change the color of the tvScore, so it is easier to discern between scores
        addDecimalPoint(ele.vote_average, element.tvScore); //Some of the ratings returned from theMovieDB lack a decimal point. Add a decimal to make data fit with the rest.
    });
};

shortenText = (text, val) => { //Shortens the overview, so it fits inside tvDataContainer
    let slicedText = text.slice(0, val); //Slices text to a selected number of characters starting at the first character

    if(slicedText.length >= 250){
        return slicedText+"...";
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

addDecimalPoint = (ratingNum, scoreContainer) =>{ //Some of the ratings returned from theMovieDB lack a decimal point. Adds a decimal so data fits with the rest.
    ratingNum = String(ratingNum);
    if(ratingNum.length < 2 && ratingNum < 10 && ratingNum > 0){
        scoreContainer.textContent = ratingNum+".0";
    }
};

displayPopUp = (ele, opened) => {//Elements for popup
    const popUpEle = {
        popUpContainer: document.createElement("div"),
        popUp: document.createElement("div"),
        contentContainer: document.createElement("div"),
        closeBtn: document.createElement("button"),
        popUpPoster: document.createElement("img"),
        popUpTitle: document.createElement("h1"),
        popUpReleaseDate: document.createElement("h3"),
        popUpScore: document.createElement("div"),
        popUpOverview: document.createElement("p"),
        rtLink: document.createElement("a")
    };

    const titleLink = ele.original_name.replace(' ', '_');

    popUpEle.popUp.classList.add("popUp", "alignFixedCenter", "displayRow");
    popUpEle.popUpScore.classList.add("tvScoreStyling");
    popUpEle.popUpContainer.classList.add("opacity", "centerChildren", "popUpContainer", "fullWidthContainer", "alignCenter");

    popUpEle.popUpPoster.src = 'https://image.tmdb.org/t/p/w342'+ele.poster_path;
    popUpEle.closeBtn.textContent = 'X';
    popUpEle.popUpTitle.textContent = ele.original_name;
    popUpEle.popUpReleaseDate.textContent = ele.first_air_date;
    popUpEle.popUpScore.textContent = ele.vote_average;
    popUpEle.popUpOverview.textContent = ele.overview;
    popUpEle.rtLink.textContent = ele.original_name+" on Rotten Tomatoes";

    popUpEle.rtLink.setAttribute('href', 'https://www.rottentomatoes.com/tv/'+titleLink);
    popUpEle.rtLink.setAttribute('target', '_blank');

    document.body.append(popUpEle.popUpContainer, popUpEle.popUp);
    popUpEle.popUp.append(popUpEle.popUpPoster);
    popUpEle.popUp.append(popUpEle.contentContainer);
    popUpEle.popUp.append(popUpEle.closeBtn);
    popUpEle.contentContainer.append(popUpEle.popUpScore);
    popUpEle.contentContainer.append(popUpEle.popUpTitle);
    popUpEle.contentContainer.append(popUpEle.popUpReleaseDate);
    popUpEle.contentContainer.append(popUpEle.popUpOverview);
    popUpEle.contentContainer.append(popUpEle.rtLink);

    changeRatingColor(ele.vote_average, popUpEle.popUpScore);

    document.querySelector(".popUp button").addEventListener("click", function(){ //hides and removes content from popup
        opened.check = false;
        document.body.removeChild(popUpEle.popUpContainer);
        document.body.removeChild(popUpEle.popUp);
        window.removeEventListener('scroll', preventScrolling)
    });
};

preventScrolling = () => {
    window.scrollTo(window.scrollX, window.scrollY);
};

checkStringLength = (string, ele) => {
    if(string.length === 0){
        ele.textContent = 'No overview available';
    }
    else{
        ele.textContent = shortenText(string, 250);
    }
};