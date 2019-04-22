var path = require('path');
var http = require('http');
var request = require('request');
var fs = require('fs');
var post_argu = require('../../../../routes/post_argu.js');
var db = require('../../../../routes/db.js');
var config = require('../../../../routes/config.js');
var _ = require('underscore');


exports.MAPConfig = function(req, res) {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/MAP/index'));
    res.render(path.resolve(__dirname, '../../web/view/MAPConfig/index'), {
        menulist: req.session.menu,
        user: req.session.user,
        lang: post_argu.getLanguage(req),
        config: config
    });
}

exports.MapGroupList = async(req, res) => {
    // if (req.body.list.length == 0) {
    //     var groupID = { user_id: req.session.user.UserId };
    //     let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList', groupID);

    //     let sql = 'select mi.MAC_NBR,mi.GP_NBR,mi.BUY_PERSON as GP_NAME,ml.latitude,ml.longitude from MACHINE_INFO mi  left join MACHINE_LOCATION ml on mi.MAC_NBR = ml.MAC_NBR ';
    //     //  select mac_nbr from MACHINE_INFO mi left join MACHINE_GROUP_INFO mgi on mi.GP_NBR = mgi.GP_NBR where mgi.PID = 0
    //     db.sql(sql, (result) => {
    //         let mac_list = [];
    //         result.recordset.forEach(key => {
    //             mac_list.push(key.MAC_NBR);
    //         });
    //         getmac_list(result, mac_list, res, req)
    //     })
    // } else {
    //     var groupID = { user_id: req.session.user.UserId };
    //     let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList', groupID);
    //     //  select mac_nbr from MACHINE_INFO mi left join MACHINE_GROUP_INFO mgi on mi.GP_NBR = mgi.GP_NBR where mgi.PID = 0
    //     let sql = 'select mi.MAC_NBR,mi.GP_NBR,mi.BUY_PERSON as GP_NAME,ml.latitude,ml.longitude from MACHINE_INFO mi  left join MACHINE_LOCATION ml on mi.MAC_NBR = ml.MAC_NBR ';
    //     db.sql(sql, (result) => {
    //         let mac_list = [];
    //         req.body.list.forEach(key => {
    //             mac_list.push(key.MAC_NBR);
    //         });
    //         getmac_list(result, mac_list, res, req)
    //     })
    // }

    var groupID = { user_id: req.session.user.UserId };
    let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList', groupID);
    //  select mac_nbr from MACHINE_INFO mi left join MACHINE_GROUP_INFO mgi on mi.GP_NBR = mgi.GP_NBR where mgi.PID = 0
    let mac_list = [];
    if (result.Data.GetAllMachineList == undefined) {
        res.json({
            Status: 0,
            Data: '',
            Mac_List: ''
        })
    } else {
        result.Data.GetAllMachineList.forEach(key => {
            mac_list.push(key.MAC_NBR);
        });
        getmac_list(result, mac_list, res, req)
    }
}

exports.MapGroupListAndroid = async(req, res) => {
    var groupID = { user_id: req.body.id };
    let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList', groupID);
    //  select mac_nbr from MACHINE_INFO mi left join MACHINE_GROUP_INFO mgi on mi.GP_NBR = mgi.GP_NBR where mgi.PID = 0
    let mac_list = [];
    if (result.Data.GetAllMachineList == undefined) {
        res.json({
            Status: 0,
            Data: '',
            Mac_List: ''
        })
    } else {
        result.Data.GetAllMachineList.forEach(key => {
            mac_list.push(key.MAC_NBR);
        });
        getmac_list(result, mac_list, res, req)
    }
}



function getmac_list(result, mac_list, res, req) {
    request.post({
        url: 'http://' + config.dataIP + ':' + config.dataport + '/DataCenter/GetItems',
        timeout: 30000,
        headers: {
            'content-type': 'application/json',
        },
        json: true,
        body: mac_list
    }, (err, response, body) => {
        if (err) {
            res.json({
                Status: -999,
                Data: err
            })
        } else {
            if (body) {
                try {
                    for (let i = 0; i < body.length; i++) {
                        body[i].Value = [];
                        for (let item in body[i].Items) {
                            body[i].Value.push(body[i].Items[item])
                        }
                    }
                    res.json({
                        Status: 0,
                        Data: body,
                        Mac_List: result
                    })
                } catch (e) {
                    res.json({
                        Status: -999,
                        Data: null,
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
}


exports.MapGroup = function(req, res) {
    let sql = 'select GP_NBR,MAC_NBR from MACHINE_INFO';
    //  select mac_nbr from MACHINE_INFO mi left join MACHINE_GROUP_INFO mgi on mi.GP_NBR = mgi.GP_NBR where mgi.PID = 0
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset
        });
        // res.json({
        //     Status: -999,
        //     Data: null
        // })
    })
}