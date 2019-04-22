/**
 * Created by htc on 2018/12/03.
 */
var ToolRunningTimeCtrl = require('../controller/ToolRunningTime');
module.exports = function(app) {
    app.get('/ToolRunningTimes', ToolRunningTimeCtrl.ToolRunningTime);
    // app.post('/ToolRunningTime/:method', ToolRunningTimeCtrl.fun);
    // app.get('/ToolRunningTime/:method', ToolRunningTimeCtrl.fun);
}