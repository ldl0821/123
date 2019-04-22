var activation = require('../controller/wf_MachineActivations.js');

module.exports = function(app) {
    //加载设备管理页面
    app.get('/wfMachineactivation', activation.activationpage);
    app.post('/machineactivation/:method', activation.fun);

    app.get('/wfMachineOutPutIndex', activation.OutPutIndex);

    app.post('/machineactivation/r/GetMachineActivation', activation.MachineActivationDetail);

    app.post('/machineactivation/r/GetGroupActivation', activation.GroupActivationDetail);

    app.post('/machineactivation/r/getData', activation.getData)
}