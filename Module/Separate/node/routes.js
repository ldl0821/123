var Separate = {};
Separate.Separate = require('./routes/Separate.js');

module.exports = function(app) {
    Separate.Separate(app);
}