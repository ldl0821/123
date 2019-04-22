var ToolRunningTime = {};
ToolRunningTime.toolRunningTime = require('./routes/toolRunningTime.js');

module.exports = function(app) {
    ToolRunningTime.toolRunningTime(app);
}