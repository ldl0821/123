var path = require('path');
var request = require('request');
var config = require('../../../../routes/config.js')
var post_argu = require('../../../../routes/post_argu.js');
var db = require('../../../../routes/db.js')
var _ = require('underscore');
exports.diagnosispage = async(req, res) => {

    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/diagnosis', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/diagnosisview/index'), {
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
exports.diagnosisdetailpage = function(req, res) {
    if (!req.session.user)
        res.redirect('/');
    res.render(path.resolve(__dirname, '../../web/view/diagnosisview/indexDetail'), {
        menulist: req.session.menu,
        user: req.session.user,
        lang: post_argu.getLanguage(),
        config: config
    });
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
        args.push(req.session.user);
        doCallback(eval(req.params.method), args, res);
    }

}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}


async function GetMachinesByGourpId(res, method, args) {

    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();

}

async function GetImmediatelyparameter(res, method, args) {

    var para = { machineIds: args.machineIds.split(',') }
    let result = await post_argu.post_argu(method, para);
    res.json(result);
    res.end();

}

exports.GetMachinePara = (req, res) => {
    let StartTime = req.body.StartTime,
        EndTime = req.body.EndTime;
    let mac_nbr = req.body.ObjectIDs;
    let sql = "select RUNNING_DATE,P_INT1,P_INT2,P_INT3,P_INT4 from MACHINE_PARAMETER_201708 where MAC_NBR=" + mac_nbr + " and RUNNING_DATE>'" + StartTime + "' and RUNNING_DATE<='" + EndTime + "'";
    db.sql(sql, (err, result) => {
        if (err) {
            res.json({
                Status: -9999,
                Data: null
            })
        }
        return res.json({
            Status: 0,
            Data: _.sortBy(result, 'RUNNING_DATE')
        })
    })
}

//获取所有设备参数
exports.GetAllMachinePara = (req, res) => {
    let sql = 'Select mac_nbr,mac_no from machine_info';
    let method = post_argu.getpath(__filename, 'GetMixNow');
    db.sql(sql, (err, result) => {
        if (err) {
            res.json({
                Status: -9999,
                Data: null
            })
        } else {
            let mac_list = '';
            for (let i = 0; i < result.length; i++) {
                mac_list = mac_list + ',' + result[i].mac_nbr;
            }
            request.post({
                url: method,
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: { 'MAC_NBR': mac_list },
            }, (err, response, body) => {
                if (err) {
                    res.json({
                        Status: -9999,
                        Data: null
                    })
                }
                try {
                    global.para = JSON.parse(body.d);
                } catch (e) {
                    return res.json({
                        Message: e.Message,
                        Status: -9999
                    })
                }
                var list_ma = [];
                for (var i = 0; i < global.para.Data.length; i++) {
                    var mac_no = _.where(result, { "mac_nbr": +global.para.Data[i].Mac_nbr })[0].mac_no;
                    var datatemp = {
                        mac_no: mac_no,
                        data: global.para.Data[i]
                    }
                    list_ma.push(datatemp);
                }
                return res.json({
                    Data: list_ma,
                    Status: 0,
                })
            })
        }
    })
}


exports.GetGroupPara = (req, res) => {
    let mac_list = [];
    for (let i = 0; i < req.body['MacList[]'].length; i++) {
        let temp = _.where(global.para.Data, { 'Mac_nbr': req.body['MacList[]'][i] });
        if (temp.length > 0) {
            mac_list.push(temp);
        }
    }
    res.json(mac_list);
}

exports.getAllMac = function(req, res) {
    if (global.para) {
        res.json({
            Status: 0,
            Data: global.para.Data
        })
    } else {
        res.json({
            Status: -9999,
            Data: null
        })
    }
}


exports.mac = function(req, res) {
    var sql = "SELECT MAC_NAME,MAC_NBR,MAC_NO,PHOTO FROM dbo.MACHINE_INFO";
    db.sql(sql, function(result) {
        res.json({
            Status: 0,
            Data: result.recordset
        })
    })
}

//获取混合采集机床数据
exports.GetMixCollection = function(req, res) {
    let method = post_argu.getpath(__filename, 'GetMixNow');
    let Group_Sql = `select mac_nbr from machine_info mi inner join machine_group_info mgi on mgi.Mac_Nbr = mi.Mac_Nbr
    where mi.GP_NBR=${req.body.Group_Id}`;
    db.sql(Group_Sql, (err, result) => {
        if (err) {
            res.json({
                Status: -9999,
                Data: null
            })
        } else {
            let mac_list = '';
            for (let i = 0; i < result.length; i++) {
                mac_list = mac_list + ',' + result[i].mac_nbr;
            }
            request.post({
                url: method,
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: { 'MAC_NBR': mac_list },
            }, (err, response, body) => {
                if (err) {
                    res.json({
                        Status: -9999,
                        Data: null
                    })
                }
                global.para = JSON.parse(body.d);
                return res.json({
                    Status: 0,
                })
            })
        }
    })
}

exports.NewCollection = (req, res) => {
    if (global.machine == null) {
        db.sql('select * from MACHINE_INFO', (result) => {
            global.machine = result.recordset;
            getNewCollect(req, res, global.machine);
        })
    } else {
        getNewCollect(req, res, global.machine);
    }
}

//新采集
function getNewCollect(req, res, machine) {
    let mac_list = [];
    machine.forEach(key => {
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
                res.json({
                    Status: 0,
                    Data: JSON.parse(body)
                })
            }
        }
    })
}

async function GetUserMacGroup(res, method, args, user) {
    var para = { user_id: user.UserId };
    method = global.Webservice + '/PACommon/PACommon.asmx/GetUserMacGroup';
    let result = await post_argu.post_argu(method, para);
    if (result.Data.userInfo.length > 0) {
        if (result.Data.userInfo[0].SECURITY_LEVEL == 0) {
            result.Data.MacGroup.push({
                GP_NBR: result.Data.userInfo[0].MAC_GP_NBR,
                PID: 0,
                GP_NAME: result.Data.userInfo[0].GP_NAME
            })
        }
    }

    res.json({ Data: result.Data.MacGroup, Message: '操作成功', Status: 0 });
    res.end();
}

exports.pinganCollection = (req, res) => {
    request.get({ url: 'http://' + config.collect.ip + ':' + config.collect.port + config.collect.method + '?macNbrs=' + req.body.machineIds, timeout: 3000 }, (err, response, body) => {
        if (err) {
            res.json({
                Status: -999,
                Data: null
            })
        } else {
            if (body) {
                res.json({
                    Status: 0,
                    Data: JSON.parse(body)
                })
            }
        }
    })
}


exports.DataCenter = (req, res) => {
    request.post({
        url: 'http://' + config.dataIP + ':' + config.dataport + '/DataCenter/GetItems',
        timeout: 30000,
        headers: {
            "content-type": "application/json",
        },
        json: true,
        body: req.body.machineIds.split(',')
    }, (err, response, body) => {
        if (err) {
            res.json({
                Status: -999,
                Data: null
            })
        } else {
            if (body) {
                res.json({
                    Status: 0,
                    Data: body
                })
            }
        }
    })
}