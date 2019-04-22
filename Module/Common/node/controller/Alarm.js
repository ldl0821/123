/**
 * Created by qb on 2016/11/23.
 */
var path = require('path');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
exports.Alarm = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/Alarm', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/Alarm/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(req),
                config: config
            })
        }
    } else {
        res.redirect("/login");
    }
}
exports.fun = function(req, res) {
    if (!req.session.user) {
        res.json({
            Status: -2,
            Message: 'session失效，请重新登陆！'
        });
    } else {
        var args = [];
        args.push(res);
        method = post_argu.getpath(__filename, req.params.method);
        args.push(method);
        args.push(req.body);
        doCallback(eval(req.params.method), args, res);
    }
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}


// 原来的获取设备组
async function GetAllMachineAndMachineGroup(res, method, args) {
    var groupID = { groupID: 0 }
    let result = await post_argu.post_argu(method, groupID);
    res.json(result);
    res.end();
}

//李浩 2018/6/15 重新调取GetAllMachineAndMachineGroup 改变 数据格式
async function GetAllMachineAndMachineGroupLiHao(res, method, args) {
    var groupID = { groupID: 0 };
    //http://localhost:27516/Modules/Common/Alarm.asmx/GetAllMachineAndMachineGroup
    let result = await post_argu.post_argu(global.Webservice + '/Common/Alarm.asmx/GetAllMachineAndMachineGroup', groupID);
    [result.Data.GetAllMachineListLiHao, result.Data.GetAllMachineList] = [result.Data.GetAllMachineList, []];
    // result.Data.GetAllMachineListLiHao = result.Data.GetAllMachineList;
    // result.Data.GetAllMachineList = [];
    res.json(result);
    res.end();
}


async function GetKeywordMachinelist(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

async function GetMachineByAlarmInfo(res, method, data) {
    var MachineIds = [];;
    if (typeof(data['MachineIds[]']) == 'string') {
        MachineIds.push(data['MachineIds[]']);
    } else {
        MachineIds = data['MachineIds[]'];
    }
    var re = {
        MachineIds: MachineIds,
        StartTime: data.StartTime,
        EndTime: data.EndTime,
        QueryType: parseInt(data.QueryType)
    }
    let result = await post_argu.post_argu(method, re);
    res.json(result);
    res.end();
}

async function GetLookupAlarmInfo(res, method, args) {
    let result = await post_argu.post_argu(method, { pagermodel: args });
    res.json(result);
    res.end();
}
//修改故障原因
async function UpdAlarm(res, method, args) {
    var d = new Date(args.ALARM_DATE);
    var date = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    var data = {
        ALARM_DATE: date,
        ALARM_MESSAGE: args.ALARM_MESSAGE,
        ALARM_NBR: args.ALARM_NBR,
        ALARM_NO: args.ALARM_NO,
        ALARM_REASON: args.ALARM_REASON,
        MAC_NAME: args.MAC_NAME,
        MAC_NBR: args.MAC_NBR
    }
    let result = await post_argu.post_argu(method, { alarminfo: data });
    res.json(result);
    res.end();
}