var i2c = require('i2c');
var wire =  new i2c(address, {device: '/dev/i2c-2'});

var ADDRESS = 0x40;
var TH02_REG_STATUS = 0x00;
var TH02_REG_DATA_H = 0x01;
var TH02_REG_DATA_L = 0x02;
var TH02_REG_CONFIG = 0x03;
var TH02_REG_ID = 0x11;

var TH02_STATUS_RDY_MASK = 0x01;

var TH02_CMD_MEASURE_HUMI = 0x01;
var TH02_CMD_MEASURE_TEMP = 0x11;


/*
wire.readByte(function (err, res) {
console.log('status err': err);
console.log('status res':res);
});
*/
wire.writeBytes(TH02_REG_CONFIG, [TH02_CMD_MEASURE_TEMP], function (err) {
	wire.read(3, function (err, res) {
var tmp = res[1] << 8;
tmp |= res[2] ;
tmp >>= 2;
console.log(((parseFloat(tmp) / 32.0) - 50.0));

		console.log('read err' + err);
		console.log('read res' + res);
	});
});

