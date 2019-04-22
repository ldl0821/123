var Alarm = {};
var pingan = {};
Alarm.realTimeAlarm = require('./routes/realTimeAlarm.js');
pingan.ini = require('./routes/PingAnAlarm.js')
module.exports = function(app) {
    Alarm.realTimeAlarm(app);
    pingan.ini(app);
}