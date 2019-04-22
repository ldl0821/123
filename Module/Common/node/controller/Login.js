var path = require('path');
var logger = require('../../../../routes/logger.js');
var config = require('../../../../routes/config.js');
var errorcode = require('../../../../routes/error.js');
var request = require('request');
var _ = require('underscore');
var session = require('express-session');
var crypto = require('crypto');
var db = require('../../../../routes/db.js');
var post_argu = require('../../../../routes/post_argu.js');
var async = require('async');
const ADMIN_MENU_SQL = 'select * from menu where menu_enable = 1';

exports.loginpage = function(req, res) {
    constIP = req.ip;
    res.render(path.resolve(__dirname, '../../web/view/login/index'), { lang: post_argu.getLanguage(req) });
}
exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);;
    args.push(method);
    args.push(req.body);
    args.push(req);
    doCallback(eval(req.params.method), args, res, req);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

exports.main = async(req, res, next) => {
    var menu = [];
    if (!req.session.user) {
        req.session.error = "请先登录";
        res.redirect("/login");
    } else if (!req.session.menu) {
        if (req.session.user.UserId == 10) {
            db.sql(ADMIN_MENU_SQL, function(result) {
                var menulist = result.recordset;
                GetSubMenu(menulist, 0, menu, req);
                req.session.menu = menu;
                // res.render(path.resolve(__dirname, '../../web/view/main/index'), {
                //     menulist: menu,
                //     user: req.session.user,
                //     lang: post_argu.getLanguage(),
                //     config: config
                // });
                // var method = global.Webservice + '/PACommon/PACommon.asmx/GetUserTable';
                // var groupID = { UserId: req.session.user.UserId }
                // let result = await post_argu.post_argu(method, groupID);
                res.redirect("/compiles");
            })
        } else {
            var menu_list = [];
            UserMenu(req, res, req.session.user.UserId, menu_list);
            // res.redirect("/compiles");
        }
    } else {
        res.redirect("/compiles");
    }

}

exports.checkuser = function(req, res) {
    var md5 = crypto.createHash('md5');
    var pwd = md5.update(req.body.Pwd).digest('hex');
    request.post({ url: post_argu.getpath(__filename, 'AccountLogin'), form: { name: req.body.Name, pwd: pwd } }, function(error, response, body) {
        if (error) {
            res.json({
                Status: 200,
                Message: errorcode["Return_Code" + 200]
            })
        } else {
            var data = JSON.parse(splitwebService(body));
            if (data.StatusCode == 0) {
                req.session.user = data.Data;
                res.json({
                    Status: 0,
                    Data: { UserId: req.session.user.UserId },
                    Message: "登录成功！"
                })
            } else if (data.StatusCode == 1) {
                res.json({
                    Status: 1,
                    Message: "用户名密码错误！"
                })
            } else if (data.StatusCode == -500) {
                res.json({
                    Status: 1,
                    Message: "账号已过期！"
                })
            } else {
                res.json({
                    Status: 1,
                    Message: "出现未知错误"
                })
            }
        }
    })
}

//递归菜单
function GetSubMenu(data, pid, menu, req) {
    var SubMenu = _.where(data, { "MENU_PID": pid });
    var OrderSubMenu = _.sortBy(SubMenu, "MENU_ORDER");

    var language = post_argu.getLanguage(req); //获取语言

    if (OrderSubMenu.length > 0) {
        for (var i = 0; i < OrderSubMenu.length; i++) {
            var SubMenuChild = _.where(data, { "MENU_PID": +OrderSubMenu[i].MENU_NBR });
            var son = {};
            menu.push(son);
            son.nbr = OrderSubMenu[i].MENU_NBR;
            if (req.session.language == 'cn.js') {
                son.pagename = OrderSubMenu[i].MENU_NAME;
            } else {
                son.pagename = language.Menu[OrderSubMenu[i].MENU_NAME];
            }
            son.ico = OrderSubMenu[i].MENU_ICO;
            son.order = OrderSubMenu[i].MENU_ORDER;
            if (SubMenuChild.length > 0) {
                son.submenu = [];
                GetSubMenu(data, +OrderSubMenu[i].MENU_NBR, son.submenu, req);
            } else {
                son.submenu = 0;
                son.url = OrderSubMenu[i].MENU_URL;
            }

        }
    }

}

exports.logout = function(req, res) {
    req.session.user = null;
    req.session.menu = null;
    res.redirect('/login');
}

function checkLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        res.redirect('back');
    }
    next();
}

//加载菜单
exports.loadmenu = function(req, res) {
    res.json({
        Status: 0,
        Data: {
            PID: global.pid,
            ID: global.sid
        }
    })
}

//保存菜单
exports.savemenu = function(req, res) {
    if (req.params.id == "pid") {
        global.pid = req.query.id;
        global.sid = null;
    } else {
        global.pid = req.query.pid;
        global.sid = req.query.id;
    }
}

//检测IP冲突
function checkIP(IP, UserID) {
    for (let i = 0; i < global.Client.length; i++) {
        if (global.Client[i].UserID == UserID && global.Client[i].IP != IP) {
            global.ws.clients.forEach(function each(client) {
                if (_.indexOf(global.Client[i].ClientId, client._ultron.id) > -1) {
                    client.send(JSON.stringify({
                        msg: "你的账户已在其他地方登录!"
                    }));
                    global.Client.splice(i, 1);
                    return;
                }
            })
        }
    }
}


//递归返回
function Get_F_(Data, id, list, type) {
    if (type == 1)
        var Group = _.where(Data, { 'userid': id });
    else
        var Group = _.where(Data, { 'GP_NBR': id });
    if (Group.length > 0) {
        list.push({ id: id, type: type });
        list = Get_F_(Data, Group[0].PID, list, 2);
    } else {
        return list;
    }
}

//查看用户菜单
function UserMenu(req, res, user_id, menu_list) {
    async.waterfall([
        function(callback) {
            db.sql(`select me.*,PERMISSION from USER_FUNCTION uf left join MENU_PERMISSION mp on uf.FUNC_NBR = mp.Permission_Nbr
            left join MENU me on me.MENU_NBR = mp.Menu_Nbr
            where uf.USER_NBR = ${user_id} and mp.Function_Name = 'view'`, function(result) {
                menu_list = result.recordset;
                callback(null, user_id, menu_list);
            })
        },
        function(user_id, menu_list, callback) {
            var sql_command = "select gi.*,ur.USER_NBR from GROUP_INFO gi left join USER_GROUP ur on gi.GP_NBR = ur.GP_NBR";
            db.sql(sql_command, function(result) {
                var temp = _.where(result.recordset, { 'USER_NBR': user_id });
                var g_id;
                if (temp.length > 0) {
                    g_id = _.where(result.recordset, { 'USER_NBR': user_id })[0].GP_NBR;
                } else {}
                var g_list = [];
                Get_F_(result.recordset, g_id, g_list, 2);
                gp_list(g_list);
                callback(null, g_list, menu_list);
            })
        },
        function(g_list, menu_list, callback) {
            var gf = gp_list(g_list);
            db.sql(`
            select me.*,PERMISSION from GROUP_FUNCTION gf left join MENU_PERMISSION mp on gf.FUNC_NBR = mp.Permission_Nbr
            left join MENU me on me.MENU_NBR = mp.Menu_Nbr
            where gf.GP_NBR in  (select C1 from dbo.func_splitstring('${gf}',',')) and mp.Function_Name = 'view' order by GP_NBR desc`, function(result) {

                for (let i = 0; i < result.recordset.length; i++) {
                    if (_.where(menu_list, { 'MENU_NBR': result.recordset[i].MENU_NBR }).length == 0) {
                        menu_list.push(result.recordset[i]);
                    }
                }
                let menu = [];
                menu_list = _.where(menu_list, { 'PERMISSION': 1 });
                menu_list = _.uniq(menu_list, false, 'MENU_NBR');
                GetSubMenu(menu_list, 0, menu, req);
                req.session.menu = menu;
                res.render(path.resolve(__dirname, '../../../TinyMCE/web/view/compiles'), {
                    menulist: req.session.menu,
                    user: req.session.user,
                    lang: post_argu.getLanguage(req),
                    config: config
                });
            })
        }
    ])

}

//获取字符串列表
function gp_list(list) {
    var str;
    for (var i = 0; i < list.length; i++) {
        if (i == 0) {
            str = list[i].id;
            // } else if (i == list.length) {
            //     str = str + ',' + list[i - 1].id;
        } else {
            str = str + ',' + list[i].id;
        }
    }
    return str;
}
//剪裁webService返回的字符串  李浩 2018/9/11
function splitwebService(str) {
    return str.split('string')[1].split('/">')[1].split('</')[0]
}

//发送验证码 htc:20180705
exports.checkPhoneCode = function(req, res) {
        var method = "https://sms.yunpian.com/v2/sms/single_send.json";
        request.post({ url: method, form: req.body }, function(error, response, body) {
            var result = JSON.parse(body);
            if (result.code != 0) {
                res.json({
                    Status: result.code,
                    Message: result.msg
                })
            } else {
                if (error) {
                    res.json({
                        Status: 200,
                        Message: errorcode["Return_Code" + 200]
                    })
                } else {
                    res.json({
                        Status: 0,
                        Message: result.msg
                    })
                }
            }
        })
    }
    //检查账号是否关联手机 htc:20180709
async function checkPhone(res, method, args) {
    var method = "http://" + config.webIP + ":" + config.webPort + "/Modules/PACommon/PACommon.asmx/GetPhoneNoByUser_name";
    let ip = post_argu.GetIP(constIP);
    console.log(ip);
    args.ip = ip;
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//关联手机 htc:20180709
async function associatedPhone(res, method, args) {
    var method = "http://" + config.webIP + ":" + config.webPort + "/Modules/PACommon/PACommon.asmx/GetUserCellPhoneListByUserAccount";
    let ip = post_argu.GetIP(constIP);
    console.log("关联手机时的ip:" + ip);
    args.ip = ip;
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//判断该账号关联手机与修改手机是否一致 htc:20180709
async function idSamePhone(res, method, args) {
    var method = "http://" + config.webIP + ":" + config.webPort + "/Modules/PACommon/PACommon.asmx/GetCellPhoneUserBycellPhoneNo";
    args.user_id = res.req.session.user.UserId;
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//根据账号id获取该账号手机号 htc:20180710
async function getPhoneByUserId(res, method, args) {
    var method = "http://" + config.webIP + ":" + config.webPort + "/Modules/PACommon/PACommon.asmx/GetCellPhoneUserBycellUserId";
    args.user_id = res.req.session.user.UserId;
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//根据账号id删除手机号（注销手机号） htc:20180710
async function delPhoneUser(res, method, args) {
    var method = "http://" + config.webIP + ":" + config.webPort + "/Modules/PACommon/PACommon.asmx/DelPhoneUser";
    args.user_id = res.req.session.user.UserId;
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}