var Cutter = {};
Cutter.ItemConfig = require('./routes/ItemConfig.js');
module.exports = function(app) {
    Cutter.ItemConfig(app);
}