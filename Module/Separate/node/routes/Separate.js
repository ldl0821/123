var Separate = require('../controller/Separate.js');
module.exports = function(app) {
    app.get('/Separates', Separate.Separate);
}