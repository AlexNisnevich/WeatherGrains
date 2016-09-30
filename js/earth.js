
var appId = "033c9c2e06f99aef2fe57093880b686f";

var ensemble = new GranulatorEnsemble(granulators);
ensemble.start();

var lat = null, lng = null;
function checkWeather(earth, callback) {
  center = earth.getCenter();
  if (lat != center[0] || lng != center[1]) {
    lat = center[0]; lng = center[1];
    window.location.hash = lat.toFixed(6) + ":" + lng.toFixed(6);
    fetch("//api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&appid=" + appId)
      .then(function(response) { return response.json(); })
      .then(callback);
  }
}

function updateWeather(weather) {
  console.log(weather);

  // Update description.
  var description = "<strong>" + weather.name + "</strong>" +
      "<br>" + weather.weather[0].description.capitalize() +
      "<br>" + (weather.main.temp - 273.15).toFixed(1) + "&deg;C" +
      "<br>" + "Pressure: " + Math.round(weather.main.pressure) + " hPa" +
      "<br>" + "Humidity: " + weather.main.humidity + "%";
      // "<br>" + "Wind: " + Math.round(weather.wind.speed) + " m/s";
  $('#description').html(description);

  // Update granulator ensemble.
  ensemble.updateParamsWithWeather(weather);
}

$(function () {
  // Set up tile layers.
  var natural = WE.tileLayer('http://data.webglearth.com/natural-earth-color/{z}/{x}/{y}.jpg', {
    tileSize: 256,
    tms: true
  });
  var toner = WE.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.',
    opacity: 0.6
  });

  // Set up earth.
  if (window.location.hash && window.location.hash.indexOf(':') > 0) {
    center = window.location.hash.split('#')[1].split(':').map(function (x) { return parseFloat(x); });
  } else {
    center = [37.7749, -122.4194]; // San Francisco
  }
  var earth = new WE.map('earth', {
    center: center,
    sky: true,
    atmosphere: true,
    dragging: true,
    tilting: true,
    zoom: 4
  });
  natural.addTo(earth);
  toner.addTo(earth);

  // Poll location on mouseup, checking weather and updating granulator params if the location has changed.
  checkWeather(earth, updateWeather);
  $(document)
    .mouseup(function () { checkWeather(earth, updateWeather); })
    .mousedown(function () { $('#description').html(''); });
});

document.addEventListener("visibilitychange", function () {document.hidden ? ensemble.stop() : ensemble.start(); }, false);
