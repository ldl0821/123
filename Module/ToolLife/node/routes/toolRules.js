/**
 * Created by htc on 2018/12/12.
 */
var NewToolRules = require('../controller/ToolRules.js');
module.exports = function(app) {
    app.get('/NewToolConfig', NewToolRules.NewCutter);
    app.post('/NewToolConfig/:method', NewToolRules.fun);
    app.get('/NewToolConfig/:method', NewToolRules.fun);
}