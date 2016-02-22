var async = require('async');
var I2c = require('i2c');
var locks = require('locks');

var Lpf = require('./lpf');

var DEVICE = '/dev/i2c-1';
var ADDRESS = 0x23;

var BH1750_CMD = 0x10;

function Bh1750() {
  this.i2c = new I2c(ADDRESS, {device: DEVICE});
  this.mutex = locks.createMutex();
  this.lpf = new Lpf(0.2);
};

Bh1750.prototype.statusSync = function () {
  return 'on';
};

Bh1750.prototype.getLight = function (cb) {
  var self = this;

  async.waterfall([
    function (done) {
      self.mutex.lock(function () {
        return done();
        });
    },
    function (done) {
      self.i2c.writeByte(BH1750_CMD, function (err) {
        if (err) {
          console.log('i2c write failed. cmd:%x ', BH1750_CMD);
        }

        return done (err);
      });
    },
    function (done) {
      self.i2c.readBytes(BH1750_CMD, 2, function (err, res) {
        if (err) {
            console.log('readBytes failed. reg:%x', BH1750_CMD);
            return done(err);
        }

        var rawLight = (res[0] << 8) | (res[1]);
        rawLight = self.lpf.filtering(rawLight);
        console.log(rawLight);
        return done(null, rawLight.toFixed(1));
      });
    }],
    function (err, temperature) {
      self.mutex.unlock();
      if (err) {
        console.log('getTemperature err');
        cb && cb(err);
        return;
      }

      cb && cb(null, temperature);
    }
  );
};


module.exports = Bh1750;

if (require.main === module) {
  var b = new Bh1750();
  b.getLight(function (err, t) {console.log(t)});
}


