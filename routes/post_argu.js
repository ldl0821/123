var request = require('request');
var config = require(__dirname + '/config.js');
var errorcode = require(__dirname + '/error.js');
var path = require('path');
var session = require('express-session');
var db = require(__dirname + '/db.js');
var _ = require('underscore');
var mogdb = require(__dirname + '/log.js');


//提交参数
exports.post_argu = (method, args) => {
    return new Promise((resolve, reject) => {
        request.post({
            url: method,
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: args,
        }, function(error, response, body) {
            if (error) {
                resolve({
                    Data: null,
                    Status: -9999,
                    Message: error
                })
            } else {
                if (body.d) {
                    var result = null;
                    try {
                        result = JSON.parse(body.d);
                    } catch (e) {
                        console.log(e);
                        resolve({
                            Data: null,
                            Status: -9999,
                            Message: error
                        })
                    }
                    resolve({
                        Data: result.Data,
                        Status: result.StatusCode,
                        Message: errorcode["Return_Code" + result.StatusCode]
                    });
                } else {
                    resolve({
                        Data: null,
                        Status: -9999,
                        Message: body.Message
                    })
                }
            }
        })

    })


}



//获取路径
exports.getpath = function(_path, method) {
    var pt = _path.split('\\');
    return global.Webservice + '/' + pt[pt.length - 4] + '/' + pt[pt.length - 1].split('.')[0] + '.asmx/' + method;
}

//获取语言
exports.getLanguage = function(req) {
    let Language;
    if (!req) {
        Language = 'cn.js'
    } else if (!req.session.language) {
        Language = 'cn.js';
        req.session.language = 'cn.js';
    } else {
        Language = req.session.language;
    }
    return require('../public/language/' + Language);
    
}

//检查权限
exports.permission = async(user_id, per_id, type, method) => {
    let result = false;
    if (user_id == 10) {
        mogdb.SaveLogs(10, per_id, true);
        return true;
    } else {
        result = await this.user_fun(user_id, per_id, type);
        if (result == null) {
            let group_list = await this.GetGroupList(user_id);
            result = await this.GetGroupPer(per_id, group_list);
            mogdb.SaveLogs(user_id, per_id, result);
            return result;
        } else {
            mogdb.SaveLogs(user_id, per_id, result);
            return result;
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

//函数权限(user_id:用户ID,routes:路由,type：页面属性（1：view,2:其他），method：(方法或者路径)，args：(参数),e:元页面)
function fun_per(user_id, routes, type, method, args, e, resolve) {
    async.waterfall([
        function(callback) {
            // if (type == 'view')
            //     routes = type;
            var sql_command = "select * from (select USER_NBR,permission_nbr,PERMISSION,(case when Function_Name='View' then MENU_URL else Function_Name end) as rount from USER_FUNCTION uf left join MENU_PERMISSION mp on mp.Permission_Nbr = uf.FUNC_NBR left join MENU me on me.MENU_NBR = mp.Menu_Nbr) tmp where USER_NBR=" + user_id + " and rount='" + routes + "'";
            db.sql(sql_command, function(result) {
                if (result.recordset.length > 0) {
                    if (result.recordset[0].PERMISSION == 1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }

                } else {
                    callback(null);
                }
            });
        },
        function(callback) {
            var sql_command = "select gi.*,ur.USER_NBR from GROUP_INFO gi left join USER_GROUP ur on gi.GP_NBR = ur.GP_NBR";
            db.sql(sql_command, function(result) {
                var temp = _.where(result.recordset, { 'USER_NBR': user_id });
                var g_id;
                if (temp.length > 0) {
                    g_id = _.where(result.recordset, { 'USER_NBR': user_id })[0].GP_NBR;
                } else {}
                var g_list = [];
                Get_F_(result.recordset, g_id, g_list, 2);
                callback(null, g_list);
            })
        },
        function(g_list, callback) {
            var gr = gp_list(g_list);
            db.sql("select * from (select GP_NBR,permission_nbr,PERMISSION,(case when MENU_URL=null then Function_Name else MENU_URL end) as rount from GROUP_FUNCTION uf left join MENU_PERMISSION mp on mp.Permission_Nbr = uf.FUNC_NBR left join MENU me on me.MENU_NBR = mp.Menu_Nbr) tmp where GP_NBR in (" + gr + ") and rount='" + routes + "'", function(result) {
                for (var i = 0; i < g_list.length; i++) {
                    var temp = _.where(result.recordset, { 'GP_NBR': g_list[i].id });
                    if (temp.length > 0) {
                        if (temp[0].PERMISSION == 1) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                    if (i == g_list.length - 1) {
                        resolve(false);
                    }
                }
            })
        }
    ])

}

exports.stringFormat = (args) => {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof(args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g"); // 这个在索引大于9时会有问题，谢谢何以笙箫的指出
                    　　　　　　　　　　　　
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

//获取IP
exports.GetIP = (IP) => {
        let ip = IP.split(':');
        return ip[ip.length - 1] == 1 ? '127.0.0.1' : ip[ip.length - 1];
    }
    //获取用户权限
exports.user_fun = (user_id, routes, type) => {
    return new Promise((resolve, reject) => {
        // if (type == 'view')
        //     routes = type;
        var sql_command = "select * from (select USER_NBR,permission_nbr,PERMISSION,(case when Function_Name='View' then MENU_URL else Function_Name end) as rount from USER_FUNCTION uf left join MENU_PERMISSION mp on mp.Permission_Nbr = uf.FUNC_NBR left join MENU me on me.MENU_NBR = mp.Menu_Nbr) tmp where USER_NBR=" + user_id + " and rount='" + routes + "'";
        db.sql(sql_command, function(result) {
            if (result.recordset.length > 0) {
                if (result.recordset[0].PERMISSION == 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(null);
            }
        });
    }).catch()

}

//获取组信息
exports.GetGroupList = (user_id) => {
    return new Promise((resolve, reject) => {
        var sql_command = "select gi.*,ur.USER_NBR from GROUP_INFO gi left join USER_GROUP ur on gi.GP_NBR = ur.GP_NBR";
        db.sql(sql_command, function(result) {
            var temp = _.where(result.recordset, { 'USER_NBR': user_id });
            var g_id;
            if (temp.length > 0) {
                g_id = _.where(result.recordset, { 'USER_NBR': user_id })[0].GP_NBR;
            } else {}
            var g_list = [];
            Get_F_(result.recordset, g_id, g_list, 2)
            resolve(g_list);
        })
    }).catch();
}


//获取组权限
exports.GetGroupPer = (routes, g_list) => {
    return new Promise((resolve, reject) => {
        var gr = gp_list(g_list);
        db.sql("select * from (select GP_NBR,permission_nbr,PERMISSION,(case when Function_Name='View' then MENU_URL else Function_Name end) as rount from GROUP_FUNCTION uf left join MENU_PERMISSION mp on mp.Permission_Nbr = uf.FUNC_NBR left join MENU me on me.MENU_NBR = mp.Menu_Nbr) tmp where GP_NBR in (" + gr + ") and rount='" + routes + "'", function(result) {
            for (var i = 0; i < g_list.length; i++) {
                var temp = _.where(result.recordset, { 'GP_NBR': g_list[i].id });
                if (temp.length > 0) {
                    if (temp[0].PERMISSION == 1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
                if (i == g_list.length - 1) {
                    resolve(false);
                }
            }
        })
    }).catch()

}