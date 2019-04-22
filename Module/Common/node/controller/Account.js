var path = require('path');
var request = require('request');
var logger = require('../../../../routes/logger.js');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');

exports.accountpage = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/account', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/Account/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(req),
                config: config
            });
        }
    } else {
        res.redirect("/login");
    }
}

exports.getuser = function(req, res) {
    var para = {};
    para.pinfo = { "PageSize": req.body.PageSize, "PageIndex": req.body.PageIndex };
    para.keyword = req.body.keyword;
    para.userType = req.body.userType;
    request.post({
        url: global.Webservice + '/PACommon/PACommon.asmx/GetUserInflListByUserGroupId',
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: { pageIndex: req.body.PageIndex, PageSize: req.body.PageSize, gp_nbr: para.keyword }
    }, function(error, response, body) {
        var result = JSON.parse(body.d);
        res.json({
            Data: result.Data,
            Status: result.StatusCode,
            Message: "成功"
        });
    });
}

//处理事件
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
    fn.apply(args[1], args);
    // fn(...args)
}


//冻结用户
async function Switch(res, method, args, req) {
    var arg;
    for (var i in args) {
        arg = i;
    }
    if (await post_argu.permission(req.session.user.UserId, 'Switch')) {
        let result = await post_argu.post_argu(method, JSON.parse(arg));
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}

//删除用户
async function DeleteUser(res, method, args, req) {
    var arg;
    for (var i in args) {
        arg = i;
    }
    if (await post_argu.permission(req.session.user.UserId, 'DeleteUser', "DeleteUser")) {
        let result = await post_argu.post_argu(method, JSON.parse(arg));
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}

//获取账号组
async function FindSubGroupByParentIdRecycle(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}


//获取人员组
async function GetAllMemberAndMemberGroup(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}


//获取人员
async function GetKeywordMemberlist(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

//获取设备组
async function GetAllMachineAndMachineGroup(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

//获取设备
async function GetKeywordMachinelist(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

//添加用户
async function AddUser(res, method, args, req) {
    var para = { userInfo: args, GP_NBR: args.GP_NBR };
    if (await post_argu.permission(req.session.user.UserId, 'AddUser')) {
        let result = await post_argu.post_argu(method, para);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}

//修改用户
async function ModifyUser(res, method, args, req) {
    var para = { userInfo: args, GP_NBR: args.GP_NBR };
    if (await post_argu.permission(req.session.user.UserId, 'ModifyUser')) {
        let result = await post_argu.post_argu(method, para);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'ModifyUser', "ModifyUser", method, para);
}

//修改密码
async function ResetPassword(res, method, args, req) {
    if (args.userId == res.req.session.user.UserId) {
        let result = await post_argu.post_argu(method, args);
        res.json(result);
        res.end();
    } else if (await post_argu.permission(req.session.user.UserId, 'ResetPassword')) {
        if (args.userId == undefined) { args.userId = res.req.session.user.UserId; }
        let result = await post_argu.post_argu(method, args);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}

//添加用户组
async function AddGroup(res, method, args, req) {
    var para = { GroupInfo: args };
    if (await post_argu.permission(req.session.user.UserId, 'AddGroup')) {
        let result = await post_argu.post_argu(method, para);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'AddGroup', "AddGroup", method, para);
}

//修改用户组
async function ModifyGroup(res, method, args, req) {
    var para = { GroupInfo: args };
    if (await post_argu.permission(req.session.user.UserId, 'ModifyGroup')) {
        let result = await post_argu.post_argu(method, para);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'ModifyGroup', "ModifyGroup", method, para);
}

//删除用户组
async function DelGroupWithAccountUsers(res, method, args, req) {
    var para = { groupid: args.groupid };
    if (await post_argu.permission(req.session.user.UserId, 'DelGroupWithAccountUsers')) {
        let result = await post_argu.post_argu(method, para);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    // post_argu.permission(req, res, 'DelGroupWithAccountUsers', "DelGroupWithAccountUsers", method, args);
}

//关键字查询（按下Enter键） htc:20180109
async function GetUserPageKey(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}