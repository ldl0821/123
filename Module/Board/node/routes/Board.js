var Board = require('../controller/Board.js');
module.exports = function(app) {
    app.get('/Boards', Board.Board);
    app.get('/BoardAndroid', Board.BoardAndroid);
    app.get('/Board/getTxt', Board.getTxt);
    app.post('/Board/getTxt', Board.getTxtAndroid);
    app.post('/Board/getTxtAndroid', Board.getTxtAndroid);
    app.post('/Board/getActivationData', Board.getActivationData);
    app.post('/Board/GetAlarmDataOrder', Board.GetAlarmDataOrder);
    app.post('/Board/GetAlarmDataReal', Board.GetAlarmDataReal);  // APK看板使用  获取报警状态设备数据
    app.post('/Board/GetAllDataReal', Board.GetAllDataReal);  // APK看板使用  获取所有状态设备数据
    Board.lhWebServer(app)
}