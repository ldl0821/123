var UpData = require('../controller/UpData.js');
module.exports = function(app) {
    app.get('/UpDatas', UpData.UpData);
    app.post('/UpData/GetColumns', UpData.GetColumns);
    app.post('/UpData/GetItems', UpData.GetItems);
    app.get('/UpData/GetPara', UpData.GetPara);

}