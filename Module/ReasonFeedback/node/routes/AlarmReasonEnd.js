let AlarmReasonEnd = require('../controller/AlarmReasonEnd.js');
module.exports = function(app) {
    app.get('/AlarmReasonEnds', AlarmReasonEnd.AlarmReason);
    app.post('/AlarmReasonEnd/CutterList', AlarmReasonEnd.ReasonList);
}   