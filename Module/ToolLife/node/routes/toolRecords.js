/**
 * Created by htc on 2018/12/12.
 */
var ToolRecords = require('../controller/ToolRecords.js');
module.exports = function(app) {
    app.get('/ToolRecords', ToolRecords.ToolRecord);
    app.post('/ToolRecords/:method', ToolRecords.fun);
    app.get('/ToolRecords/:method', ToolRecords.fun);
}