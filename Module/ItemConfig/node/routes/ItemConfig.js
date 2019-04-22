var ItemConfig = require('../controller/ItemConfig.js');
module.exports = function(app) {
    app.get('/ItemConfigs', ItemConfig.ItemConfig);
    app.post('/ItemConfig/GetItems', ItemConfig.GetItems);

    app.post('/ItemConfig/addMACItem', ItemConfig.addMACItem);
    //app.get('/ItemConfig/GetAllUrgrncytext', AddStaff.GetAllUrgrncytext);
}