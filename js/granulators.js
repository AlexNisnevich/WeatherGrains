// Specify granulators used and their parameters here.
var granulators = [
  {
    file: 'audio/cello-c3.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = Math.round(mapRange(weather.main.temp, 251, 331, -1200, 1200, true));
      params.release = mapRange(weather.main.humidity, 0, 100, 0.4, 1.0);
      params.attack = mapRange(weather.wind.speed, 0, 100, 0.7, 0.1, true);
      params.interval = mapRange(weather.clouds.all, 0, 100, 0.6, 0.2);
      params.spread = mapRange(weather.main.pressure, 500, 1300, 0.3, 0.1, true);
      params.randomization = mapRange(weather.sys.sunset - weather.sys.sunrise, 0, 86400, 0.25, 0.01, true);
      params.azimuth = weather.wind.deg;
    }
  },

  {
    file: 'audio/birdsong1.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = mapRange(weather.main.temp, 251, 331, -1200, 1200, true);
      params.release = mapRange(weather.main.humidity, 0, 100, 0.1, 1.0);
      params.attack = mapRange(weather.wind.speed, 0, 100, 1.0, 0.2, true);
      params.interval = mapRange(weather.clouds.all, 0, 100, 0.5, 0.1);
      params.spread = mapRange(weather.main.pressure, 500, 1300, 0.3, 0.01, true);
      params.randomization = mapRange(weather.sys.sunset - weather.sys.sunrise, 0, 86400, 0.01, 0.25, true);
      params.azimuth = weather.wind.deg;
    }
  },

  {
    file: 'audio/violin-a4.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = Math.round(mapRange(weather.main.temp, 251, 317, 1200, -1200, true));
      params.release = mapRange(weather.main.humidity, 0, 100, 0.1, 0.4);
      params.attack = mapRange(weather.wind.speed, 0, 100, 0.7, 0.1, true);
      params.interval = mapRange(weather.clouds.all, 0, 100, 0.1, 0.5);
      params.spread = mapRange(weather.main.pressure, 500, 1300, 0.3, 0.1, true);
      params.randomization = mapRange(weather.sys.sunset - weather.sys.sunrise, 0, 86400, 0.01, 0.25, true);
      params.azimuth = weather.wind.deg;
    }
  },

  {
    file: 'audio/violin-a4.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = Math.round(mapRange(weather.main.temp, 251, 331, -1200, 1200, true));
      params.release = mapRange(weather.main.humidity, 0, 100, 0.1, 0.5);
      params.attack = mapRange(weather.wind.speed, 0, 100, 0.4, 0.05, true);
      params.interval = mapRange(weather.clouds.all, 0, 100, 0.7, 0.2);
      params.spread = mapRange(weather.main.pressure, 500, 1300, 0.3, 0.1, true);
      params.randomization = mapRange(weather.sys.sunset - weather.sys.sunrise, 0, 86400, 0.02, 0.5, true);
     params.azimuth = weather.wind.deg;
    }
  }
];
