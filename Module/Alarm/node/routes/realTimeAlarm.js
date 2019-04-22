var realTimeAlarm = require('../controller/realTimeAlarm.js');
module.exports = function(app) {
    app.get('/realTimeAlarm', realTimeAlarm.Index);
    app.get('/realTimeAlarm/getAlarm', realTimeAlarm.getAlarm);
    app.get('/realTimeAlarm/getAlarmNum', realTimeAlarm.getAlarmNum);
}