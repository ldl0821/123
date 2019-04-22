let BoardConfig = require('../controller/BoardConfig.js');

module.exports = app => {
    app.get('/BoardConfigs', BoardConfig.BoardConfig);
    //进入页面默认去读文件
    app.get('/BoardConfig/writeFile', BoardConfig.writeFile);
    //点击提交去写文件
    app.post('/BoardConfig/createFile', BoardConfig.createFile);
}