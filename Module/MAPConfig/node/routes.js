var MAPConfig = {};
MAPConfig.MAPConfig = require('./routes/MAPConfig.js');

module.exports = function(app) {
    MAPConfig.MAPConfig(app);
}