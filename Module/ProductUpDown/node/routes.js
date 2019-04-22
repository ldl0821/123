var ProdUpdown = {};
ProdUpdown.sweedcodes = require('./routes/sweedcode.js');
ProdUpdown.partsummarys = require('./routes/partsummary.js');

module.exports = function(app) {
    ProdUpdown.sweedcodes(app);
    ProdUpdown.partsummarys (app);
}