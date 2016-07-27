window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;

function Granulator(file) {
  var self = this;
  var context = new AudioContext();
  var masterNode = context.createGain();

  initialize();

  /* PUBLIC METHODS */

  this.start = function () {
    function playNext() {
      if (self.playing) {
        if (self.buffer) {
          trigger(self.buffer, self.params);
        }
        setTimeout(playNext, self.params.interval);
      }
    }

    self.playing = true;
    playNext();
  };

  this.stop = function () {
    self.playing = false;
  };

  this.updateParamsWithWeather = function (weather) {
    console.log(weather);

    // TODO: also try weather.main.humidity, weather.wind.speed, weather.wind,deg, etc.

    self.params.speed = Math.pow(2, mapRange(weather.main.temp, 250, 310, -1, 1));
    self.params.interval = mapRange(weather.main.pressure, 900, 1100, 1000, 100);

    console.log('Speed: ', self.params.speed);
    console.log('Interval: ', self.params.interval);
  }

  /* PRIVATE METHODS */

  function initialize() {
    self.buffer = null;
    self.playing = false;
    self.params = {
      'offset': 0.5,
      'amplitude': 1,
      'attack': 0.4,
      'release': 0.4,
      'spread': 0.2,
      'pan': 0.5,
      'speed': 2,
      'interval': 1000
    };

    masterNode.connect(context.destination);
    loadAudioFileAsBuffer(file);
  }

  function loadAudioFileAsBuffer(file) {
    var request = new XMLHttpRequest();
    request.open('GET', file, true);
    request.responseType = "arraybuffer";
    request.onload = function(){
      context.decodeAudioData(request.response, function (buffer) {
        self.buffer = buffer;
      },function(){
        console.log('Failed to load ' + file)
      });
    };
    request.send();
  }

  // Play a grain once.
  // [based on https://github.com/zya/granular] 
  function trigger(buffer, params) {
    var now = context.currentTime;

    // Create the source node.
    var sourceNode = context.createBufferSource();
    sourceNode.playbackRate.value = sourceNode.playbackRate.value * params.speed;
    sourceNode.buffer = buffer;

    // Create the gain node and set the envelope.
    var gainNode = context.createGain();
    gainNode.connect(masterNode);
    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(params.amplitude, now + params.attack);
    gainNode.gain.linearRampToValueAtTime(0, now + params.attack + params.release);
    
    // Create a panner node (for better performance, only a random subset of grains is panned).
    var isPanning = Math.random() < 0.3;
    if (isPanning) {
      var pannerNode = context.createPanner();
      pannerNode.panningModel = "equalpower";
      pannerNode.distanceModel = "linear";
      pannerNode.setPosition((Math.random() - 0.5) * params.pan * 2, 0, 0);
      sourceNode.connect(pannerNode); pannerNode.connect(gainNode);
    } else {
      sourceNode.connect(gainNode);
    }
    
    // Add a random offset and save the offset position.
    var randomOffset = (Math.random() - 0.5) * params.spread;
    var offset = Math.min(Math.max(params.offset + randomOffset, 0), buffer.duration);
    self.params.offset = offset;

    // Play the grain!
    var duration = params.attack + params.release;
    sourceNode.start(now, offset, duration);

    // Garbage collection.
    setTimeout(function () {
      gainNode.disconnect();
      if (isPanning) {
        pannerNode.disconnect();
      }
    }, (params.attack + params.release + 0.1) * 1000);
  }
}
