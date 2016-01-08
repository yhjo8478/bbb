/*
 * 0 <= alpha <= 1
 */
 
function Lpf(alpha) {
  if (!alpha) {
    alpha = 0.15;
  }

  this.alpha = alpha;
  this.history = undefined;
}

Lpf.prototype.filtering = function(input) {
  if (!this.history) {
    this.history = input;
    return input;
  }

  var output = this.history + this.alpha * (input - this.history);
  this.history = output;

  return output;
}
