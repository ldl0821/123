var ToolRules = {}
ToolRules.toolRules = require('./routes/toolRules.js');
ToolRules.toolLife = require('./routes/toolLife.js');
ToolRules.toolRecords = require('./routes/toolRecords.js');
module.exports = function(app) {
    ToolRules.toolRules(app);
    ToolRules.toolLife(app);
    ToolRules.toolRecords(app);
}