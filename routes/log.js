let mongoose = require('mongoose');
let moment = require('moment');

mongoose.connect('mongodb://106.14.201.77:27017/Logs', { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('连接失败');
    } else {
        console.log('连接成功');
    }
});

let schema = new mongoose.Schema({
    userID: Number,
    routes: String,
    Time: Date,
    Type: Boolean
});

//日志记录
//userID 操作人，routes 方法名称，type 操作状态,argus 其他参数
exports.SaveLogs = (userID, routes, type, argus) => {
    let Logs = mongoose.model('Logs', schema);
    let log = {};
    log.userID = userID;
    log.routes = routes;
    log.Type = type;
    log.Time = moment().format('x');
    Logs.create(log);
}