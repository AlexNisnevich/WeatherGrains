
function mapRange(value, low1, high1, low2, high2, clamp) {
  var raw = low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  if (clamp) {
    return Math.min(Math.max(raw, low2), high2);
  } else {
    return raw;
  }
}
