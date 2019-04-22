/**
 * Created by qb on 2016/12/13.
 */
var path = require('path');
var request = require('request');
var config = require('../../../../routes/config.js');
var post_common = require('../../../../routes/post_argu.js');
var session = require('express-session');
var logger = require('morgan');
var db = require('../../../../routes/db.js');
var _ = require('underscore');
exports.main = function(req, res) {
    if (!req.session.user)
        res.redirect('/');
    res.render(path.resolve(__dirname, '../../web/view/main/index'), {
        menulist: req.session.menu,
        user: req.session.user,
        lang: post_common.getLanguage(req),
    });
}
exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    method = post_common.getpath(__filename, req.params.method);;
    args.push(method);
    args.push(req.body);
    args.push(req);
    doCallback(eval(req.params.method), args, res, req);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

//新增主件
function GetAllWidgetList(res, method, args, req) {
    var UserId = req.session.user.UserId;
    logger('UserId=' + UserId);
    post_common.post_argu(res, method, { UserId: UserId });
}


Array.prototype.removeRepeat = function(GP_NBR, PID = '') {
    var res = [this[0]];
    for (var i = 1; i < this.length; i++) {
        var repeat = false;
        for (var j = 0; j < res.length; j++) {
            if (this[i].GP_NBR == res[j].GP_NBR && this[i].PID == res[j].PID) {
                repeat = true;
            }
        }
        if (!repeat) {
            res.push(this[i]);
        }
    }
    return res;
};

async function getUserMachineList(res, method, args, req) {
    var groupID = { user_id: req.session.user.UserId };
    let result = await post_common.post_argu(global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList', groupID);
    res.json(result);
    res.end();
}

// function getUserMachineList(res, method, args, req) {
//     var groupID = { user_id: req.session.user.UserId };
//     request.post({
//         url: global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList',
//         json: true,
//         headers: {
//             "content-type": "application/json",
//         },
//         body: groupID,
//     }, (error, response, body) => {
//         res.json(body);
//     })
// }

//李浩 2018/6/15 调取 设备组 GetUserMacGroup
async function GetUserMacGroup(res, method, args, req) {
    var groupID = { user_id: req.session.user.UserId };
    let result = await post_common.post_argu(global.Webservice + '/PACommon/PACommon.asmx/GetUserMacGroup', groupID);
    result.Data.GetAllMachineGroupList = result.Data.MacGroup;
    result.Data.GetAllMachineList = [];
    if (result.Data.userInfo.length > 0) {
        if (result.Data.userInfo[0].SECURITY_LEVEL != 1) {
            result.Data.GetAllMachineGroupList.push({
                GP_NAME: result.Data.userInfo[0].GP_NAME,
                GP_NBR: result.Data.userInfo[0].MAC_GP_NBR,
                PID: 0,
                RANK_NUM: 0
            })
        }
    }
    res.json(result);
    res.end();
}
//李浩 2018/6/15 调取  GetMacNoList
async function GetMacNoList(res, method, args, req) {
    var groupID = { mac_name: req.body.mac_name };
    let result = await post_common.post_argu(global.Webservice + '/PACommon/PACommon.asmx/GetMacNoList', groupID);
    res.json(result);
    res.end();
}
//李浩 2018/6/15 调取 GetMacNameList
async function GetMacNameList(res, method, args, req) {
    var groupID = { gp_id: req.body.nodeID };
    let result = await post_common.post_argu(global.Webservice + '/PACommon/PACommon.asmx/GetMacNameList', groupID);
    res.json(result);
    res.end();
}

async function GetMacItemList(res,method,args,req){
    try {
        db.sql(`SELECT * FROM dbo.MAC_ItemConfig WHERE User_ID=${req.session.user.UserId} and MAC_NBR=${req.body.MAC_NBR}`, function(result) {
            res.json({
                Data: result.recordset,
                Status: 0,
                Message: '操作成功'
            });
        });
    } catch (error) {
        res.json({
            Status: -999,
            err: error
        });
    }
   
}

// //李浩 2018/6/8  客户 设备编号 设备 使用  调用树状数据
// async function getActivatityUserMachineList(res, method, args, req) {
//     var groupID = { user_id: req.session.user.UserId };
//     let result = await post_common.post_argu(global.Webservice + '/PACommon/PACommon.asmx/getActivatityUserMachineList', groupID);
//     var resulta = JSON.stringify(result).replace(/COMPANY_NAME/g, "BUY_PERSON").replace(/SECURITY_LEVEL/g, "RANK_NUM");
//     var resultb = JSON.parse(resulta);
//     let CaterortInMacNoLength = result.Data.CaterortInMacNo.length;
//     for (let i = 0; i < CaterortInMacNoLength; i++) {
//         for (let item in resultb.Data.CaterortInMacNo[i]) {
//             for (let q = 0; q < resultb.Data.CaterortInMacNo[i][item].length; q++) {
//                 resultb.Data.CaterortInMacNo.push(resultb.Data.CaterortInMacNo[i][item][q]);
//             }
//         }
//     }
//     resultb.Data.CaterortInMacNo.splice(0, CaterortInMacNoLength);
//     resultb.Data.GetAllMachineGroupList = resultb.Data.GetAllMachineGroupList.removeRepeat('GP_NBR', 'PID');
//     resultb.Data.GetAllMachineList = resultb.Data.GetAllMachineList.removeRepeat('MAC_NO');
//     for (let w = 0; w < resultb.Data.GetAllMachineList.length; w++) {
//         resultb.Data.GetAllMachineGroupList.unshift({
//             GP_NAME: '根节点',
//             GP_NBR: resultb.Data.GetAllMachineList[w].GP_NBR,
//             PID: 0,
//             RANK_NUM: 0
//         })
//     }
//     resultb.Data.GetAllMachineListStandby = resultb.Data.GetAllMachineList;
//     resultb.Data.GetAllMachineList = [];
//     res.json(resultb);
//     res.end();
// }

// //李浩 2018/6/11  客户 设备编号 设备 使用 直接调取数据
// async function GetMacsByGpid(res, method, args, req) {
//     var groupID = { group_id: req.body.group_id };
//     let result = await post_common.post_argu(global.Webservice + '/PACommon/PACommon.asmx/GetMacsByGpid', groupID);
//     res.json(result);
//     res.end();
// }


//小主件 主页面
async function GetStatusColorAndCount(res, method, args, req) {
    var groupID = { user_id: req.session.user.UserId };
    let result = await post_common.post_argu(global.Webservice + '/PACommon/PACommon.asmx/getActivatityUserMachineList', groupID);
    var mac_list = [];
    result.Data.GetAllMachineList.forEach(key => {
        mac_list.push(key.MAC_NBR);
    });
    request.get('http://' + config.collect.ip + ':' + config.collect.port + config.collect.method + '?macNbrs=' + mac_list, (err, response, body) => {
            if (err) {
                res.json({
                    Status: -999,
                    Data: null
                })
            } else {
                if (body) {
                    try {
                        var temp = JSON.parse(body),
                            Data = [];
                        for (var i = 0; i < temp.length; i++) {
                            var s_temp = _.where(temp[i].Value, { 'Name': 'STD::Status' });
                            if (s_temp.length > 0) {
                                var _ss_temp = _.where(Data, { 'STATUS_NBR': s_temp[0].Value })
                                if (_ss_temp.length > 0) {
                                    _ss_temp[0].MacCount++;
                                } else {
                                    Data.push({
                                        STATUS_NBR: s_temp[0].Value,
                                        MacCount: 1
                                    })
                                }
                            }
                        }
                        res.json({
                            Status: 0,
                            Data: Data
                        })
                    } catch (e) {
                        console.log(e.message);
                        res.json({
                            Status: -999,
                            Data: null
                        })
                    }
                } else {
                    res.json({
                        Status: -999,
                        Data: null
                    })
                }
            }
        })
        //post_common.post_argu(res, method, args);
}
//用于首页显示 获取所有设备在当天的状态比例占比图
function GetTodayAllMachineStatusPie(res, method, args) {
    post_common.post_argu(res, method, args);
}
//菜单列表
function GetPersonalSettingList(res, method, args, req) {
    var UserId = req.session.user.UserId;
    post_common.post_argu(res, method, { UserId: UserId });
}
//用于首页显示设备组稼动率
function GetAllMachineGroupActivation(res, method, args) {
    post_common.post_argu(res, method, args);
}
//删除主件
function DeleteWidget(res, method, args, req) {
    var UserId = req.session.user.UserId;
    var data = {
        UserId: UserId,
        typeList: args
    }
    post_common.post_argu(res, method, data);
}
//新增主件
function AddWidget(res, method, args, req) {
    var UserId = req.session.user.UserId;
    var data = {
        UserId: UserId,
        componentList: args
    }
    post_common.post_argu(res, method, data);
}
//获取菜单
function GetMenuInfo(res, method, args) {
    db.sql('select * from MENU where MENU_ENABLE=1', function(err, result) {
        if (err) {
            console.log(err);
            res({ Status: -1, Message: "连接失败！" });
        }
        var menulist = result;
        var menu = [];
        res.json({
            Data: GetSubMenu(menulist, 0, menu),
            Status: 0,
            Message: '操作成功'
        });
    });
    // post_common.post_argu(res, method, args);
}


function GetSubMenu(data, pid, menu) {
    var Menu_Son = _.where(data, { 'MENU_PID': +pid });
    for (var i = 0; i < Menu_Son.length; i++) {
        var menu_Detail = {};
        menu_Detail.expanded = true;
        menu_Detail.icon = Menu_Son[i].MENU_ICO;
        menu_Detail.text = Menu_Son[i].MENU_NAME;
        menu_Detail.url = Menu_Son[i].MENU_URL;
        menu_Detail.id = Menu_Son[i].MENU_NBR;
        menu_Detail.flag = 0;
        menu_Detail.items = [];
        var Menu_Son_son = _.where(data, { 'MENU_PID': +Menu_Son[i].MENU_NBR });
        if (Menu_Son_son.length > 0) {
            menu_Detail.flag = 1;

            menu_Detail.items = GetSubMenu(data, Menu_Son[i].MENU_NBR, menu_Detail.items);
        }
        menu.push(menu_Detail);
    }
    return menu;
}
//添加菜单
function AddPersonalSetting(res, method, args, req) {
    post_common.post_argu(res, method, { menuinfo: args, UserId: req.session.user.UserId });
}
//删除菜单
function DeletePersonalSetting(res, method, args, req) {
    var UserId = req.session.user.UserId;
    var data = {
        UserId: UserId,
        personalid: args.personalid
    }
    post_common.post_argu(res, method, data);
}