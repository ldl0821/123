var MAP = require('../controller/MAP.js');
module.exports = function(app) {
    app.get('/MAPS', MAP.MAP);
    app.get('/MapGroup', MAP.MapGroup);
    app.post('/MapGroupList', MAP.MapGroupList);
    app.post('/MapGroupListAndroid', MAP.MapGroupListAndroid);
    app.get('/maps/getJson', MAP.getJson);
    app.post('/maps/getJson', MAP.getJson);
}