var mqtt = require('mqtt'),
    _ = require('lodash');

var MQTT_URI = 'mqtt://127.0.0.1';

var client  = mqtt.connect(MQTT_URI);
 
client.on('connect', function () {
    client.subscribe('presence');
      client.publish('presence', 'Hello mqtt');
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
  client.end();
});

