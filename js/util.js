
function mapRange(value, low1, high1, low2, high2, clamp) {
  var raw = low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  if (clamp) {
    return Math.min(Math.max(raw, low2), high2);
  } else {
    return raw;
  }
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

// http://www.ollysco.de/2012/04/gaussian-normal-functions-in-javascript.html
/**
  * Returns a Gaussian Random Number around a normal distribution defined by the mean
  * and standard deviation parameters.
  *
  * Uses the algorithm used in Java's random class, which in turn comes from
  * Donald Knuth's implementation of the Box–Muller transform.
  *
  * @param {Number} [mean = 0.0] The mean value, default 0.0
  * @param {Number} [standardDeviation = 1.0] The standard deviation, default 1.0
  * @return {Number} A random number
  */
Math.randomGaussian = function(mean, standardDeviation) {
  if (Math.randomGaussian.nextGaussian !== undefined) {
    var nextGaussian = Math.randomGaussian.nextGaussian;
    delete Math.randomGaussian.nextGaussian;
    return (nextGaussian * standardDeviation) + mean;
  } else {
    var v1, v2, s, multiplier;
    do {
      v1 = 2 * Math.random() - 1; // between -1 and 1
      v2 = 2 * Math.random() - 1; // between -1 and 1
      s = v1 * v1 + v2 * v2;
    } while (s >= 1 || s == 0);
    multiplier = Math.sqrt(-2 * Math.log(s) / s);
    Math.randomGaussian.nextGaussian = v2 * multiplier;
    return (v1 * multiplier * standardDeviation) + mean;
  }
};