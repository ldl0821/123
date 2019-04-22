var MAP = {};
MAP.MAP = require('./routes/MAP.js');

module.exports = function(app) {
    MAP.MAP(app);
}