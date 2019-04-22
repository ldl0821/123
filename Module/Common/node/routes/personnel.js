var personnel = require('../controller/personnel');
module.exports = function(app) {
    app.get('/personnels', personnel.index);
    app.post('/personnel/CutterList', personnel.CutterList);
    //app.get('/AddStaff/GetAllUrgrncytext', AddStaff.GetAllUrgrncytext);
    app.post('/personnel/AddStateList', personnel.AddStateList);
    app.post('/personnel/UpdataStateList', personnel.UpdataStateList);
    app.post('/personnel/DeleteStateList', personnel.DeleteStateList);
    app.post('/personnel/GetCutterList', personnel.GetCutterList);
}