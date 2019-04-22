var Factoryctrl = require('../controller/Factory.js');

module.exports = function(app) {

    //账户页面
    app.get('/Factory', Factoryctrl.index);

    //各种事件
    app.post('/account/:method', Factoryctrl.fun);

    app.get('/account/:method', Factoryctrl.fun);

}