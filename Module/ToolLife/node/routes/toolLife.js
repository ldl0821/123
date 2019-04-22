/**
 * Created by htc on 2018/12/03.
 */
var ToolLife = require('../controller/ToolLife.js');
module.exports = function(app) {
    app.get('/ToolLifes', ToolLife.ToolLife);
    app.post('/ToolLifes/:method', ToolLife.fun);
    app.get('/ToolLifes/:method', ToolLife.fun);
}