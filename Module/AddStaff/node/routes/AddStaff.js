var AddStaff = require('../controller/AddStaff.js');
module.exports = function(app) {
    app.get('/AddStaffs', AddStaff.AddStaff);
    app.post('/AddStaff/CutterList', AddStaff.CutterList);
    //app.get('/AddStaff/GetAllUrgrncytext', AddStaff.GetAllUrgrncytext);
    app.post('/AddStaff/AddStateList', AddStaff.AddStateList);
    app.post('/AddStaff/UpdataStateList', AddStaff.UpdataStateList);
    app.post('/AddStaff/DeleteStateList', AddStaff.DeleteStateList);
    app.post('/AddStaff/GetCutterList', AddStaff.GetCutterList);
}