var path = require('path');
var request = require('request');
var logger = require('../../../../routes/logger.js');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
var fs = require('fs');
//加载页面
exports.index = async(req, res) => {
    if (req.session.user) {
        if (post_argu.permission(req.session.user.UserId, '/member', 'view', )) {
            res.render(path.resolve(__dirname, '../../web/view/member/index'), {
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
        args.push(method = post_argu.getpath(__filename, req.params.method));
        args.push(req.body);
        args.push(req);
        doCallback(eval(req.params.method), args, res);
    }
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}
//加载用户组
async function GetGrouplist(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
// 根据人员组ID获取人员信息 (分页)
async function GetMemberlist(res, method, args) {
    var para = { pinfo: args, keyword: args.keyword }
    let result = await post_argu.post_argu(method, para);
    res.json(result);
    res.end();
}
//新增组
async function AddGroup(res, method, args, req) {

    var membergroupinfo = {
        membergroupinfo: args
    };
    if (await post_argu.permission(req.session.user.UserId, 'AddGroup')) {
        let result = await post_argu.post_argu(method, membergroupinfo);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}
//编辑组
async function UpdGroup(res, method, args, req) {
    var membergroupinfo = {
        membergroupinfo: args
    };
    if (await post_argu.permission(req.session.user.UserId, 'UpdGroup')) {
        let result = await post_argu.post_argu(method, membergroupinfo);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'UpdGroup', "UpdGroup", method, membergroupinfo);
}
//删除组
async function DelGroup(res, method, args, req) {
    if (await post_argu.permission(req.session.user.UserId, 'DelGroup')) {
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
//新增人员
async function AddMember(res, method, args, req) {
    var para = { memberinfo: args };
    //post_argu.post_argu(res, method, para);
    if (await post_argu.permission(req.session.user.UserId, 'AddMember')) {
        let result = await post_argu.post_argu(method, para);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'AddMember', "AddMember", method, para);

}
//删除人员
async function DelMember(res, method, args, req) {

    var arg;
    for (var i in args) {
        arg = i;
    }
    //post_argu.post_argu(res, method, JSON.parse(arg));
    if (await post_argu.permission(req.session.user.UserId, 'DelMember')) {
        let result = await post_argu.post_argu(method, arg);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'DelMember', "DelMember", method, JSON.parse(arg));
}
//移动租的时候下拉框的查询
async function GetKeywordGrouplist(res, method, args) {
    var para = { pinfo: args, keyword: args.keyword }
    let result = await post_argu.post_argu(method, para);
    res.json(result);
    res.end();
}
//移动组
async function MoveMemberGroup(res, method, args, req) {
    //将人员id转数组 htc:20171213
    var memberIdsArr = convenient_tool(args['memberIds[]']);
    // var para = { groupId: args.groupId, memberIds: args["memberIds[]"] };
    var para = { groupId: args.groupId, memberIds: memberIdsArr }
        //post_argu.post_argu(res, method, para);
        //post_argu.permission(req, res, 'MoveMemberGroup', "MoveMemberGroup", method, para);
    if (await post_argu.permission(req.session.user.UserId, 'MoveMemberGroup')) {
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
//人员修改
async function UpdMember(res, method, args, req) {
    var para = { memberinfo: args };
    //post_argu.post_argu(res, method, para);
    if (await post_argu.permission(req.session.user.UserId, 'UpdMember')) {
        let result = await post_argu.post_argu(method, para);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'UpdMember', "UpdMember", method, para);
}
//关键字查询
async function GetKeywordMemberlist(res, method, args) {
    var para = { pinfo: args, keyword: args.keyword }
    let result = await post_argu.post_argu(method, para);
    res.json(result);
    res.end();
}
// //显示所有图片
// function ShowAllPic(res, method, args) {
//     post_argu.post_argu(res, method);
// }
//上传
function UpLoadFileWithCut(res, method, args) {
    //post_argu.post_argu(res,method);
}

function ShowAllPic(res, method, args) {
    var root = './public';
    var imagesDir = '/images/people';
    var body = {},
        data = [];
    fs.readdirSync(root + imagesDir).forEach(function(file) {
        if (fs.lstatSync(root + imagesDir + '/' + file)) {
            var dirname = file;
            // var img = {};
            // img.FileDesc = "file";
            fs.readdirSync(root + imagesDir + '/' + file).forEach(function(file) {
                data.push({ FileName: file, FilePath: imagesDir + '/' + dirname + '/' + file, FileDesc: dirname });
            })
            body.Data = data;
        }
    })
    body.Status = 0;
    body.Message = "上传成功！";
    res.json(body);

}

function DeleteFile(res, method, args) {
    let filename = args.fileName;
    let imagesDir = './public/images/people/NoDefault/';
    fs.unlink(path.resolve(imagesDir + filename), (err) => {
        var body = {};
        if (err) {
            body.Status = -9999;
            body.Message = err;
            res.json(body);
        }
        body.Status = 0;
        body.Message = "删除成功！";
        res.json(body);
    })
}

function convenient_tool(arr) {
    var re = [];
    if ((typeof arr) == 'string') {
        re.push(arr);
    } else {
        re = arr;
    }
    return re;
}

async function GetAllMemberAndMemberGroup(res, method, args) {
    let result = await post_argu.post_argu(method, { groupID: 0 });
    res.json(result);
    res.end();
}