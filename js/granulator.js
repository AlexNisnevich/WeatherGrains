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
        setTimeout(playNext, self.params.interval * 1000);
      }
    }

    self.playing = true;
    playNext();
  };

  this.stop = function () {
    self.playing = false;
  };

  this.updateParamsWithWeather = function (weather) {
    self.params.detune = mapRange(weather.main.temp, 273, 310, -1200, 1200, true);
    self.params.interval = mapRange(weather.main.humidity, 0, 100, 0.5, 0.05);
    self.params.release = mapRange(weather.main.pressure, 900, 1100, 0.05, 0.5, true);
    self.params.attack = mapRange(weather.wind.speed, 1, 100, 0.05, 0.5, true);

    console.log('Detune: ', self.params.detune);
    console.log('Interval: ', self.params.interval);
    console.log('Attack: ', self.params.attack);
    console.log('Release: ', self.params.release);
  }

  /* PRIVATE METHODS */

  function initialize() {
    self.buffer = null;
    self.playing = false;
    self.params = {
      'offset': 0.5,
      'amplitude': 2,
      'attack': 0.05,
      'release': 0.05,
      'spread': 0.2,
      'pan': 0.5,
      'detune': 0,
      'interval': 0.5
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
    sourceNode.playbackRate.value = sourceNode.playbackRate.value;
    sourceNode.buffer = buffer;
    sourceNode.detune.value = params.detune;

    // Create the gain node and set the envelope.
    var gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(params.amplitude, now + params.attack);
    gainNode.gain.linearRampToValueAtTime(0, now + params.attack + params.release);

    // Create a compressor node
    var compressorNode = context.createDynamicsCompressor();
    compressorNode.threshold.value = -70;
    compressorNode.knee.value = 20;
    compressorNode.ratio.value = 5;
    compressorNode.reduction.value = 0;
    compressorNode.attack.value = 0;
    compressorNode.release.value = 0.05;
    
    gainNode.connect(compressorNode);
    compressorNode.connect(masterNode);

    // Create a panner node (for better performance, only a random subset of grains is panned).
    var isPanning = Math.random() < 0.5;
    if (isPanning) {
      var pannerNode = context.createPanner();
      pannerNode.panningModel = "equalpower";
      pannerNode.distanceModel = "linear";
      pannerNode.setPosition((Math.random() - 0.5) * params.pan * 2, 0, 0);
      sourceNode.connect(pannerNode); pannerNode.connect(gainNode);
    } else {
      sourceNode.connect(gainNode);
    }
    
    // Add a random offset.
    var randomOffset = (Math.random() - 0.5) * params.spread;
    var offset = Math.min(Math.max(params.offset + randomOffset, 0), buffer.duration);
    // self.params.offset = offset;  // Uncomment to save the offset position each time.

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
