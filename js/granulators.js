// Specify granulators used and their parameters here.
var granulators = [
  {
    file: 'audio/cello-a2.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = mapRange(weather.main.temp, 273, 310, -1200, 1200, true);
      params.release = mapRange(weather.main.humidity, 0, 100, 0.05, 0.5);
      params.attack = mapRange(weather.wind.speed, 0, 50, 0.5, 0.05, true);
      params.interval = mapRange(weather.main.pressure, 900, 1100, 0.05, 0.5, true);
      params.spread = mapRange(weather.clouds.all, 0, 100, 0.0, 0.1);
      params.randomization = mapRange(weather.clouds.all, 0, 100, 0, 3);
      params.azimuth = weather.wind.deg;
    }
  },

  {
    file: 'audio/birdsong1.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = mapRange(weather.main.temp, 273, 310, -1200, 1200, true);
      params.release = mapRange(weather.main.humidity, 0, 100, 0.05, 0.5);
      params.attack = mapRange(weather.wind.speed, 0, 50, 0.5, 0.05, true);
      params.interval = mapRange(weather.main.pressure, 900, 1100, 0.05, 0.5, true);
      params.spread = mapRange(weather.clouds.all, 0, 100, 0.0, 0.1);
      params.randomization = mapRange(weather.clouds.all, 0, 100, 0, 3);
      params.azimuth = weather.wind.deg;
    }
  },

  {
    file: 'audio/violin-a4.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = mapRange(weather.main.temp, 273, 310, -1200, 1200, true);
      params.release = mapRange(weather.main.humidity, 0, 100, 0.05, 0.5);
      params.attack = mapRange(weather.wind.speed, 0, 50, 0.5, 0.05, true);
      params.interval = mapRange(weather.main.pressure, 900, 1100, 0.05, 0.5, true);
      params.spread = mapRange(weather.clouds.all, 0, 100, 0.0, 0.1);
      params.randomization = mapRange(weather.clouds.all, 0, 100, 0, 3);
      params.azimuth = weather.wind.deg;
    }
  },

  {
    file: 'audio/marimba.wav',
    paramsFromWeather: function (params, weather) {
      params.detune = mapRange(weather.main.temp, 273, 310, -1200, 1200, true);
      params.release = mapRange(weather.main.humidity, 0, 100, 0.05, 0.5);
      params.attack = mapRange(weather.wind.speed, 0, 50, 0.5, 0.05, true);
      params.interval = mapRange(weather.main.pressure, 900, 1100, 0.05, 0.5, true);
      params.spread = mapRange(weather.clouds.all, 0, 100, 0.0, 0.1);
      params.randomization = mapRange(weather.clouds.all, 0, 100, 0, 3);
      params.azimuth = weather.wind.deg;
    }
  }
];
