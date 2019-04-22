/**
 * Created by qb on 2016/11/24.
 */
var path = require('path');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
exports.shift = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/Shift', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/shift/NewIndex'), {
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
exports.ArrangeIndex = (req, res) => {
    if (!req.session.user)
        res.redirect('/');
    else {
        res.render(path.resolve(__dirname, '../../web/view/shift/NewArrangeIndex'), {
            menulist: req.session.menu,
            user: req.session.user,
            lang: post_argu.getLanguage(),
            config: config
        });
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
        args.push(req);
        doCallback(eval(req.params.method), args, res);
    }

}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}
// 获取设备和设备组
async function GetAllMachineAndMachineGroup(res, method, args,req) {
    var groupID = { groupID: 0 }
    let result = await post_argu.post_argu(method, groupID);
    res.json(result);
    res.end();
    //post_argu.post_argu(res, method, groupID);
}
//根据设备组ID获取设备信息
async function GetKeywordMachinelist(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//根据设备ID获取解决方案信息
async function Getsolutionlist(res, method, args) {
    if (args.machineId == 'NaN') {
        return;
    } else {
        let result = await post_argu.post_argu(method, args);
        res.json(result);
        res.end();
    }

}
//显示方案
async function GetAllShift(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//新增设备解决方案
async function AddMachineShift(res, method, args, req) {
    var data = {
        machineId: JSON.parse(args.machineId),
        machineshiftlist: JSON.parse(args.machineshiftlist),
    }
    if (await post_argu.permission(req.session.user.UserId, 'AddMachineShift')) {
        let result = await post_argu.post_argu(method, data);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.post_argu(res, method, data);
    //post_argu.permission(req, res, 'AddMachineShift', "AddMachineShift", method, data);
}
//删除某台设备关联的方案
async function DelMachineShift(res, method, args, req) {

    if (await post_argu.permission(req.session.user.UserId, 'DelMachineShift')) {
        let result = await post_argu.post_argu(method, args);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }

    //post_argu.permission(req, res, 'DelMachineShift', "DelMachineShift", method, args);
}
//获取权限设备组和设备    LH 2018/10/16
async function GetRecursionMacInGroupByUserId(res, method, args, req){
    var groupID = { user_id: req.session.user.UserId };
    let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/GetRecursionMacInGroupByUserId  ', groupID);
    result.Data.GetAllMachineList = result.Data.MAC;
    result.Data.GetAllMachineGroupList = result.Data.MAC_GROUP;
    delete result.Data.MAC;
    delete result.Data.MAC_GROUP;
    // resulta = JSON.stringify(result).replace(/MAC/g, "GetAllMachineList").replace(/MAC_GROUP/g, "GetAllMachineGroupList");
    res.json(result);
    res.end();
}
//跟新方案
async function UpdateShift(res, method, args, req) {
    var data = {
        solution: {
            SoluationID: args.SoluationID,
            SolutionName: args.SolutionName,
            li: JSON.parse(args.li)
        }
    }

    if (await post_argu.permission(req.session.user.UserId, 'DelMachineShift')) {
        let result = await post_argu.post_argu(method, data);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.post_argu(res, method, data);

    //post_argu.permission(req, res, 'UpdateShift', "UpdateShift", method, data);
}
//新增方案
async function AddShift(res, method, args, req) {

    var data = {
        solution: {
            SoluationID: args.SoluationID,
            SolutionName: args.SolutionName,
            li: JSON.parse(args.li)
        }
    }
    if (await post_argu.permission(req.session.user.UserId, 'AddShift')) {
        let result = await post_argu.post_argu(method, data);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.post_argu(res, method, data);

    //post_argu.permission(req, res, 'AddShift', "AddShift", method, data);
}
//删除方案
async function DeleteShift(res, method, args, req) {
    var a = []
    a.push(args['SolutiondArrayId[]']);
    var data = {
        SolutiondArrayId: a
    }

    //post_argu.post_argu(res, method, data);
    if (await post_argu.permission(req.session.user.UserId, 'DeleteShift')) {
        let result = await post_argu.post_argu(method, data);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'DeleteShift', "DeleteShift", method, data);
}
//修改传递的参数 htc:20171213
async function UpdMachineShift(res, method, args, req) {
    var data = {
        machineId: JSON.parse(args.machineId),
        machineshiftlist: JSON.parse(args.machineshiftlist),
    }

    // post_argu.post_argu(res, method, data);

    // post_argu.permission(req, res, 'UpdMachineShift', "UpdMachineShift", method, data);

    //htc:20180629
    if (await post_argu.permission(req.session.user.UserId, 'UpdMachineShift')) {
        let result = await post_argu.post_argu(method, data);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}

//邬峰版新增班次排班 htc:20180704
async function AddShiftWF(res, method, args, req) {
    if (await post_argu.permission(req.session.user.UserId, 'AddShift')) {
        let result = await post_argu.post_argu('http://' + config.webIP + ':' + config.webPort + '/Modules/PACommon/PACommon.asmx/AddShift', args);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}

//htc:20180711
//新版班次查询（根据客户）
async function getShiftSolutionList(res, method, args, req) {
    if (await post_argu.permission(req.session.user.UserId, 'getShiftSolutionList')) {
        args.user_id = req.session.user.UserId;
        let result = await post_argu.post_argu('http://' + config.webIP + ':' + config.webPort + '/Modules/PACommon/ComonShift.asmx/getShiftSolutionList', args);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}
//新版班次方案新增(绑定客户)
async function AddSolutionShift(res, method, args, req) {
    if (await post_argu.permission(req.session.user.UserId, 'AddSolutionShift')) {
        args.Li_shift = JSON.parse(args.Li_shift);
        let result = await post_argu.post_argu('http://' + config.webIP + ':' + config.webPort + '/Modules/PACommon/ComonShift.asmx/AddSolutionShift', args);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}
//新版班次方案修改
async function ModifySolutionShift(res, method, args, req) {
    if (await post_argu.permission(req.session.user.UserId, 'ModifySolutionShift')) {
        args.Li_shift = JSON.parse(args.Li_shift);
        let result = await post_argu.post_argu('http://' + config.webIP + ':' + config.webPort + '/Modules/PACommon/ComonShift.asmx/ModifySolutionShift', args);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}