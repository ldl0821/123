var touchScreen = {};
touchScreen.touchScreen = require('./routes/touchScreen.js');

module.exports = function(app) {
    touchScreen.touchScreen(app);
}