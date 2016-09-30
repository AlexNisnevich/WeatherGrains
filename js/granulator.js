window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;

function Granulator(file) {
  var self = this;
  var context = new AudioContext();
  var masterNode = context.createGain();

  // Preprocess HRTF file.
  var _hrtfs = hrtfs;
  for (var i = 0; i < _hrtfs.length; i++) {
    var buffer = context.createBuffer(2, 512, 44100);
    var bufferChannelLeft = buffer.getChannelData(0);
    var bufferChannelRight = buffer.getChannelData(1);
    for (var e = 0; e < _hrtfs[i].fir_coeffs_left.length; e++) {
      bufferChannelLeft[e] = _hrtfs[i].fir_coeffs_left[e];
      bufferChannelRight[e] = _hrtfs[i].fir_coeffs_right[e];
    }
    _hrtfs[i].buffer = buffer;
  }

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
    self.params.release = mapRange(weather.main.humidity, 0, 100, 0.1, 0.5);
    self.params.attack = mapRange(weather.wind.speed, 0, 50, 0.5, 0.05, true);
    self.params.interval = mapRange(weather.clouds.all, 0, 100, 0.5, 0.1);
    self.params.spread = mapRange(weather.main.pressure, 700, 1100, 0.01, 0.1, true);
    self.params.randomization = mapRange(weather.sys.sunset - weather.sys.sunrise, 0, 86400, 0, 0.25);
    self.params.azimuth = weather.wind.deg;

    //console.log('Detune: ', self.params.detune);
    //console.log('Interval: ', self.params.interval);
    //console.log('Attack: ', self.params.attack);
    //console.log('Release: ', self.params.release);
    //console.log('Pan: ', self.params.pan);
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
      'spread': 0.05,
      'pan': 0.5,
      'detune': 0,
      'interval': 0.5,
      'azimuth': 0
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

    var grainAttack = params.attack * Math.pow(2, params.randomization * (Math.random() - 0.5));
    var grainRelease = params.release * Math.pow(2, params.randomization * (Math.random() - 0.5));

    // Create the source node.
    var sourceNode = context.createBufferSource();
    sourceNode.playbackRate.value = sourceNode.playbackRate.value;
    sourceNode.buffer = buffer;
    sourceNode.detune.value = params.detune + Math.randomGaussian(0.0, 1.0);

    // Create the gain node and set the envelope.
    var amplitude = params.amplitude * Math.randomGaussian(1.0, 0.25);
    var gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(amplitude, now + grainAttack);
    gainNode.gain.linearRampToValueAtTime(0.0, now + grainAttack + grainRelease);

    // Create a binauralFIR node.
    var binauralFIRNode = new BinauralFIR({'audioContext': context});
    binauralFIRNode.HRTFDataset = _hrtfs;
    binauralFIRNode.setPosition(params.azimuth, 0, 1);

    // Create a compressor node.
    var compressorNode = context.createDynamicsCompressor();
    compressorNode.threshold.value = -70;
    compressorNode.knee.value = 20;
    compressorNode.ratio.value = 1.2;
    compressorNode.reduction.value = 0;
    compressorNode.attack.value = 0;
    compressorNode.release.value = 0.05;

    // Link them all together.
    sourceNode.connect(gainNode);
    gainNode.connect(binauralFIRNode.input);
    binauralFIRNode.connect(compressorNode);
    compressorNode.connect(masterNode);

    // Add a random offset.
    var randomOffset = (Math.random() - 0.5) * params.spread * buffer.duration;
    var offset = Math.min(Math.max(params.offset + randomOffset, 0), buffer.duration);
    // self.params.offset = offset;  // Uncomment to save the offset position each time.

    // Play the grain!
    var duration = grainAttack + grainRelease;
    sourceNode.start(now, offset, duration);

    // Garbage collection.
    setTimeout(function () {
      gainNode.disconnect();
    }, (grainAttack + grainRelease + 0.1) * 1000);
  }
}
