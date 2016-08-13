
var appId = "033c9c2e06f99aef2fe57093880b686f";

var granulator = new Granulator('audio/cello-a2.wav');
granulator.start();

var lat = null, lng = null;
function checkWeather(earth, callback) {
  center = earth.getCenter();
  if (lat != center[0] || lng != center[1]) {
    lat = center[0]; lng = center[1];
    fetch("//api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&appid=" + appId)
      .then(function(response) { return response.json(); })
      .then(callback);
  }
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
  var earth = new WE.map('earth', {sky: true, atmosphere: true, dragging: true, tilting: true, zoom: 4});
  natural.addTo(earth);
  toner.addTo(earth);

  // Poll location on mouseup, checking weather and updating granulator params if the location has changed.
  checkWeather(earth, granulator.updateParamsWithWeather);
  $(document).mouseup(function () {
    checkWeather(earth, granulator.updateParamsWithWeather);
  });
});
