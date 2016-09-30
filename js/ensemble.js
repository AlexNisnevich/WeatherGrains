
function GranulatorEnsemble(granulatorOpts) {
  var granulators = granulatorOpts.map(function (g) { return new Granulator(g); });

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
