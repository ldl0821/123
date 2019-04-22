var path = require('path');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
exports.statusrate = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/statusrate', 'view', )) {
            res.render(path.resolve(__dirname, '../../web/view/statusrate/pinganIndex'), {
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
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    doCallback(eval(req.params.method), args, res);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}
// 获取设备和设备组
async function GetAllMachineAndMachineGroup(res, method, args) {
    var groupID = { groupID: 0 }
    let result = await post_argu.post_argu(method, groupID);
    res.json(result);
    res.end();
}
//根据设备组ID获取设备信息
async function GetKeywordMachinelist(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//获取设备状态分布数据并以日期进行分组  GetMachineStatusListByDate
async function GetHistoryStatusList(res, method, args) {
    var arr = [];
    if ((typeof args['ObjectIDs[]']) == 'string') {
        arr.push(args['ObjectIDs[]']);
    } else {
        arr = args['ObjectIDs[]'];
    }
    var data = {
        StartTime: args.StartTime,
        EndTime: args.EndTime,
        ShowDetails: args.ShowDetails,
        ObjectIDs: arr
    }
    let result = await post_argu.post_argu(method, data);
    res.json(result);
    res.end();
}
//统计子状态的用时比
async function GetSunStatusRate(res, method, args) {
    console.log(args)
    var re = [];
    if (args.MAC_NBR_LIST == undefined) {
        if ((typeof args['MAC_NBR_LIST[]']) == 'string') {
            re.push(args['MAC_NBR_LIST[]']);
        } else {
            re = args['MAC_NBR_LIST[]'];
        }

    } else {
        re.push(args.MAC_NBR_LIST);
    }
    var data = {
        beginDate: args.beginDate,
        endDate: args.endDate,
        Isdetail: args.Isdetail,
        MAC_NBR_LIST: re
    }
    let result = await post_argu.post_argu(method, data);
    res.json(result);
    res.end();
}
//状态具体内容
async function GetMachineStatusDetails(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//获取某一台设备的指定时间段的状态分布数据并以班次进行分组
async function GetMachineStatusListByShift(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//获取设备状态分布数据并以设备进行分组
async function GetMachineStatusListByName(res, method, args) {
    //console.log(args);
    var arr = [];
    if ((typeof args['ObjectIDs']) == 'string') {
        arr.push(args['ObjectIDs']);
    } else {
        arr = args['ObjectIDs'];
    }
    var data = {
        StartTime: args.StartTime,
        EndTime: args.EndTime,
        ShowDetails: args.ShowDetails,
        ObjectIDs: arr
    }
    let result = await post_argu.post_argu(method, data);
    res.json(result);
    res.end();
}
//修改状态描述
async function ModifyStatus(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

//用时分析模块
exports.StatusOccupancyRate = (req, res) => {
    if (req.session.user) {
        if (post_argu.permission(req.session.user.UserId, '/StatusOccupancyRate', 'view', )) {
            res.render(path.resolve(__dirname, '../../web/view/StatusOccupancyRate/index'), {
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

async function GetStatusOccupancy(res, method, args) {
    args.machineIds = JSON.parse(args.machineIds);
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

async function GetStatusOccupancyGroup(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

exports.GetStatusList = async(req, res) => {
    let method = global.Webservice + '/MacStatus/MacStatus.asmx/GetStatusHistort';
    let result = await post_argu.post_argu(method, req.body);
    res.json(result);
    res.end();
}