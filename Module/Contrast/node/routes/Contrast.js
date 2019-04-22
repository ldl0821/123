var Contrast = require('../controller/Contrast.js');
module.exports = function(app) {
    app.get('/Contrasts', Contrast.Contrast);
    app.get('/Contrast/GetProGram', Contrast.GetProGram);
    app.post('/Contrast/GetContrast', Contrast.GetContrast);
}