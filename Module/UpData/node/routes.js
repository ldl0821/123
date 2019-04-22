var UpData = {};
UpData.UpData = require('./routes/UpData.js');

module.exports = function(app) {
    UpData.UpData(app);
}