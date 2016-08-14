
function GranulatorEnsemble(files) {
  var granulators = files.map(function (file) { return new Granulator(file); });

  this.start = function () {
    granulators.forEach(function (g) { g.start(); });
  };

  this.stop = function () {
    granulators.forEach(function (g) { g.stop(); });
  };

  this.updateParamsWithWeather = function (weather) {
    granulators.forEach(function (g) { g.updateParamsWithWeather(weather); });
  }
}
