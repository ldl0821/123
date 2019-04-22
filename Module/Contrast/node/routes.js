var Contrast = {};
Contrast.Contrast = require('./routes/Contrast.js');

module.exports = function(app) {
    Contrast.Contrast(app);
}