var activation = require('../controller/new_MachineActivations.js');

module.exports = function(app) {
    //加载设备管理页面
    app.get('/newMachineactivation', activation.activationpage);
    app.post('/machineactivation/:method', activation.fun);

    app.get('/newMachineOutPutIndex', activation.OutPutIndex);

    app.post('/machineactivation/r/GetMachineActivation', activation.MachineActivationDetail);

    app.post('/machineactivation/r/GetGroupActivation', activation.GroupActivationDetail);
}