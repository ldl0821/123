var MachineCtrl = require('../controller/MachineCtrl.js');
module.exports = function(app) {
    app.get('/MachineAlarm', MachineCtrl.Index);
    app.post('/MachineAlarm/:method', MachineCtrl.fun);
    app.get('/MachineAlarm/:method', MachineCtrl.fun);

    //add htc:20180626
    app.get('/MachineAlarm/r/outExcel', MachineCtrl.outExcel);
}