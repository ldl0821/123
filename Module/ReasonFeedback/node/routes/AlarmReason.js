let AlarmReason = require('../controller/AlarmReason.js');
module.exports = function(app) {
    app.get('/AlarmReasons', AlarmReason.AlarmReason);
    app.post('/AlarmReason/CutterList', AlarmReason.ReasonList);
    // 触摸屏方法
    app.post('/AlarmReason/ScreenViewCutterList', AlarmReason.ScreenViewCutterList);
    // 看板方法
    app.post('/AlarmReason/ScreenViewCutterListAndroid', AlarmReason.ScreenViewCutterListAndroid);

    //app.get('/AddStaff/GetAllUrgrncytext', AddStaff.GetAllUrgrncytext);
    app.post('/AlarmReason/AddStateList', AlarmReason.AddReason);
    app.post('/AlarmReason/getAlarmReason', AlarmReason.getAlarmReason);
    app.post('/AlarmReason/CompleteStateList', AlarmReason.CompleteStateList);
    app.post('/AlarmReason/uploadFile', AlarmReason.uploadFile);
    app.post('/AlarmReason/updataAlarmReason', AlarmReason.updataAlarmReason);
    app.post('/AlarmReason/GetSchemeName', AlarmReason.GetSchemeName);
    app.post('/AlarmReason/AddScreenList', AlarmReason.AddScreenList);
    AlarmReason.CreateAlarmReasonList(app);   // 生成报警页面数据  && 生成ws数据
}   