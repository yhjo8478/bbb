var async = require('async');
var I2c = require('i2c');
var locks = require('locks');

var DEVICE = '/dev/i2c-2';
var ADDRESS = 0x40;
var TH02_REG_STATUS = 0x00;
var TH02_REG_DATA_H = 0x01;
var TH02_REG_DATA_L = 0x02;
var TH02_REG_CONFIG = 0x03;
var TH02_REG_ID = 0x11;
var TH02_STATUS_RDY_MASK = 0x01;

var TH02_CMD_MEASURE_HUMI = 0x01;
var TH02_CMD_MEASURE_TEMP = 0x11;


function Th02() {
  this.i2c = new I2c(ADDRESS, {device: DEVICE});
  this.i2cLock = false;
  this.mutex = locks.createMutex();
};

Th02.prototype.getTemperature = function (cb) {
  var self = this;
    async.waterfall([
      function (done) {
        self.mutex.lock(function () {
          done();
        });
      },
      function (done) {
        self.i2c.writeBytes(TH02_REG_CONFIG, [TH02_CMD_MEASURE_TEMP], function (err) {
          if (err) {
            console.log('i2c write failed. reg:%x cmd:%x', 
              TH02_REG_CONFIG, TH02_CMD_MEASURE_TEMP);
          }
   
          done (err);
        });
      },
      function (done) {
        var timer = setInterval(function () {
          self.i2c.readBytes(TH02_REG_STATUS, 1, function (err, res) {
            if (err) {
              done(err);
              clearInterval(timer);
            }
            if (res & TH02_STATUS_RDY_MASK) {
            }
            else {
              done(err);
              clearInterval(timer);
            }
          });
        }, 1000);
      },
      function (done) {
        self.i2c.readBytes(TH02_REG_DATA_H, 2, function (err, res) {
          var temperature = (res[0] << 8) | (res[1]);
          temperature >>= 2;
          temperature = (parseFloat(temperature) / 32.0) - 50.0;
          console.log(temperature);
          done();
        });
      },
      function (done) {
        self.mutex.unlock();
        done();
      }]);
};

Th02.prototype.getHuminity = function (cb) {
  var self = this;
  this.mutex.lock(function () {
    async.waterfall([
      function (done) {
        self.i2c.writeBytes(TH02_REG_CONFIG, [TH02_CMD_MEASURE_HUMI], function (err) {
          if (err) {
            console.log('i2c write failed. reg:%x cmd:%x', 
              TH02_REG_CONFIG, TH02_CMD_MEASURE_TEMP);
          }
   
          done (err);
        });
      },
      function (done) {
        var timer = setInterval(function () {
          self.i2c.readBytes(TH02_REG_STATUS, 1, function (err, res) {
            if (err) {
              done(err);
              clearInterval(timer);
            }
            if (res & TH02_STATUS_RDY_MASK) {
            }
            else {
              done(err);
              clearInterval(timer);
            }
          });
        }, 1000);
      },
      function (done) {
        self.i2c.readBytes(TH02_REG_DATA_H, 2, function (err, res) {
          var humidity = (res[0] << 8) | (res[1]);
          humidity >>= 4;
          humidity = (parseFloat(humidity) / 16.0) - 24.0;
          console.log(humidity);
          done();
        });
      }, 
      function (done) {
        self.mutex.unlock();
        done();
      }]);
  });
};

if (require.main === module) {
  var th02 = new Th02();
  th02.getTemperature();
  th02.getHuminity();
}

