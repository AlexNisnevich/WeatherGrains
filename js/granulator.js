window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;

var globalOptions = {
  binaural: false
};

function Granulator(opts) {
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
    opts.paramsFromWeather(self.params, weather);
  }

  /* PRIVATE METHODS */

  function initialize() {
    self.buffer = null;
    self.playing = false;
    self.params = {
      'offset': 0.5,
      'amplitude': 1,
      'attack': 0.1,
      'release': 0.5,
      'spread': 0.05,
      'pan': 0.5,
      'detune': 0,
      'interval': 0.5,
      'randomization': 0.01,
      'range': 0.333,
      'azimuth': 0
    };

    masterNode.connect(context.destination);
    loadAudioFileAsBuffer(opts.file);
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

    // var grainAttack = params.attack * Math.pow(2, params.randomization * (Math.random() - 0.5));
    // var grainRelease = params.release * Math.pow(2, params.randomization * (Math.random() - 0.5));

    var grainAttack = params.attack * Math.randomGaussian(1.0, params.randomization);
    var grainRelease = params.release * Math.randomGaussian(1.0, params.randomization);

    // Create the source node.
    var sourceNode = context.createBufferSource();
    sourceNode.playbackRate.value = sourceNode.playbackRate.value;
    sourceNode.buffer = buffer;
    sourceNode.detune.value = params.detune + Math.randomGaussian(0.0, 1.0);

    // Create the gain node and set the envelope.
    if (params.amplitude > 0) {
      var amplitude = params.amplitude * Math.randomGaussian(1.0, params.range);
    } else {
      var amplitude = 0;
    };
    var gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0.0, now);
    gainNode.gain.linearRampToValueAtTime(amplitude, now + grainAttack);
    gainNode.gain.linearRampToValueAtTime(0.0, now + grainAttack + grainRelease);

    // Create a binauralFIR node.
    if (globalOptions.binaural) {
      var binauralFIRNode = new BinauralFIR({'audioContext': context});
      binauralFIRNode.HRTFDataset = _hrtfs;
      binauralFIRNode.setPosition(params.azimuth, 0, 1);
    }

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
    if (globalOptions.binaural) {
      gainNode.connect(binauralFIRNode.input);
      binauralFIRNode.connect(compressorNode);
    } else {
      gainNode.connect(compressorNode);
    }
    compressorNode.connect(masterNode);

    // Add a random offset.
    // var randomOffset = (Math.random() - 0.5) * params.spread * buffer.duration;
    var randomOffset = Math.randomGaussian(0.0, 0.5) * params.spread * buffer.duration;
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
