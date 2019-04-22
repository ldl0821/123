var sweedcodecontrol = require('../controller/Sweedcode.js');

module.exports = function (app) {
    // 账户页面
    app.get('/sweedcodes', sweedcodecontrol.sweedcodepage);
    app.post('/sweedcodes/:method', sweedcodecontrol.fun);
    app.get('/sweedcodes/:method', sweedcodecontrol.fun);
}
