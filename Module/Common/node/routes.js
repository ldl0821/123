var Common = {};
Common.login = require('./routes/Login.js');
Common.account = require('./routes/Account.js');
Common.machine = require('./routes/machine.js');
Common.member = require('./routes/member.js');
Common.fclendar = require('./routes/FactoryCalendar.js');
Common.Alarm = require('./routes/Alarm.js');
Common.Shift = require('./routes/Shift.js');
Common.StatusDetail = require('./routes/StatusDetail.js');
Common.StatusData = require('./routes/statusdata.js');
Common.Main = require('./routes/main.js');
Common.Permission = require('./routes/permission.js');
Common.Factory = require('./routes/Factory.js');
Common.Personnel = require('./routes/personnel.js');  // 人员模块

module.exports = function(app) {
    Common.login(app);
    Common.account(app);
    Common.machine(app);
    Common.member(app);
    Common.fclendar(app);
    Common.Alarm(app);
    Common.Shift(app);
    Common.StatusDetail(app);
    Common.StatusData(app);
    Common.Main(app);
    Common.Permission(app);
    Common.Factory(app);
    Common.Personnel(app);
}