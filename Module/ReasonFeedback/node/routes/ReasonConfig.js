let ReasonConfig = require('../controller/ReasonConfig.js');
module.exports = function(app) {
    app.get('/ReasonConfigs', ReasonConfig.ReasonConfig);
    app.post('/ReasonConfig/CutterList', ReasonConfig.ReasonList);
    //app.get('/AddStaff/GetAllUrgrncytext', AddStaff.GetAllUrgrncytext);
    app.post('/ReasonConfig/AddStateList', ReasonConfig.AddReason);
    app.post('/ReasonConfig/UpdataState', ReasonConfig.UpdataState);
    app.post('/ReasonConfig/UpdataStateList', ReasonConfig.UpdataReasonList);
    app.post('/ReasonConfig/DeleteStateList', ReasonConfig.DeleteReasonList);
}