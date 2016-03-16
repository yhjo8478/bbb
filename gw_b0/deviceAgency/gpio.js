'use strinct'
var fs = require('fs');
var gpio = require('gpio');

var ON = 0;
var OFF = 1;

function Gpio(gpio) {
  this.gpioDriver = '/sys/class/gpio/gpio' + gpio +'/';

  if (!fs.statSync(this.gpioDriver)) {
    fs.writeFileSync('/sys/class/gpio/export', gpio.toString());
    fs.writeFileSync(this.gpioDriver + 'dirction', 'in');
    fs.writeFileSync(this.gpioDriver + 'value', '1');
  }
}

Gpio.prototype.trigger = function (cb) {
  cb(null, 0);
}

Gpio.prototype.statusSync = function () {
  return 'on';
};

Gpio.prototype.getValue = function (cb) {
  fs.readFile(this.gpioDriver + 'value', function (err, data) {
    if (err) {
      return cb && cb(err);
    }
    console.log(data);
    
    if (data[0] === 0x30) {
      return cb && cb(null, 0); /* off */
    }

    return cb && cb(null, 1); /* on */
  });
};

module.exports = Gpio;

if (require.main === module) {
/*
  var b = new Gpio(20);
  b.getValue(function (err, data){
  console.log(data)
  })
*/
  var g20 = gpio.export(20, {direction: 'in'});
  g20.on('change', function (val) {
    console.log(val);
  });
}
