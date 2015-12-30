'use strict'

var fs = require('fs');

function Ds18b20(deviceName) {
  this.fd = '/sys/bus/w1/devices/' + deviceName + '/w1_slave';
}

Ds18b20.prototype.getValue = function (cb) {
  var self = this;
  fs.readFile(this.fd, 'utf8', function (err, data) {
    if (err) {
      console.log('fs,readFile(%s) failed', self.fd);
      cb && cb(err);
      return;
    }

    var crcOk = data.match(/YES/g);
    if (!crcOk) {
      console.log('crc failed');
      return cb && cb(new Error('crc failed'));
    }

    var output = data.match(/t=(\-?\d+)/i);
    if (!output) {
      console.log('data.match failed');
      return cb && cb(new Error('data.match failed'));
    }
    
    var temperature = output[1] / 1000;
    console.log('temperature:%d', temperature);
    return cb && cb(null, temperature);
  })
};

module.exports = Ds18b20;

if (require.main === module) {
  var beerTemp = new Ds18b20('28-041450504dff');
  beerTemp.get();
}
