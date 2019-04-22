let ReasonFeedback = {};
ReasonFeedback.ReasonConfig = require('./routes/ReasonConfig')
ReasonFeedback.AlarmReason = require('./routes/AlarmReason')
ReasonFeedback.AlarmReasonEnd = require('./routes/AlarmReasonEnd')
module.exports = function(app) {
    ReasonFeedback.ReasonConfig(app);
    ReasonFeedback.AlarmReason(app);
    ReasonFeedback.AlarmReasonEnd(app);
}