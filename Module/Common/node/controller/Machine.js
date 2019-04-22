var path = require('path');
var request = require('request');
var config = require('../../../../routes/config.js')
var post_argu = require('../../../../routes/post_argu.js');
const fs = require('fs');
var db = require('../../../../routes/db.js')
exports.machineload = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/machine', 'view', )) {
            res.render(path.resolve(__dirname, '../../web/view/machine/index'), {
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

exports.getClientName = function(req, res) {
    let sql = "select COMPANY_NAME as text,COMPANY_NO as value from COMPANY_INFO";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset
        });
    });
}

exports.postBindClientName = function(req, res) {
    let sql = "UPDATE COMPANY_INFO  SET MAC_GP_NBR='" + req.body.MAC_GP_NBR + "'  WHERE  COMPANY_NO ='" + req.body.nodeid + "'";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}
//获取所有的设备组list
async function GetGrouplist(res, method, args, req) {
    var groupID = { user_id: req.session.user.UserId };
    let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/GetUserMacGroup', groupID);
    if (result.Data.userInfo.length > 0) {
        if (result.Data.userInfo[0].SECURITY_LEVEL != 1) {
            result.Data.MacGroup.push({
                GP_NAME: result.Data.userInfo[0].GP_NAME,
                GP_NBR: result.Data.userInfo[0].MAC_GP_NBR,
                PID: 0,
                RANK_NUM: 0
            })
        }
    }
    result.Data = result.Data.MacGroup;
    res.json(result);
    res.end();
}
//获取所有的设备组list
async function GetGrouplist_Customer(res, method, args) {
    var data = { groupID: 0 };
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

//按关键字查询设备组list
async function GetKeywordGrouplist(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//按组ID获取设备list
async function GetMachineList(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}
//新增设备组
async function AddMachineGroup(res, method, args, req) {

    var macgroup = {
        macgroup: args
    };
    if (await post_argu.permission(req.session.user.UserId, 'AddMachineGroup')) {
        let result = await post_argu.post_argu(method, macgroup);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }

    //post_argu.permission(req, res, 'AddMachineGroup', "AddMachineGroup", method, macgroup);

}
//按关键字获取设备list
async function GetKeywordMachinelist(res, method, args) {

    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}


//修改设备组
async function UpdMachineGroup(res, method, args, req) {
    var macgroup = { macgroup: args };
    if (await post_argu.permission(req.session.user.UserId, 'UpdMachineGroup')) {
        let result = await post_argu.post_argu(method, macgroup);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }

}
//删除设备组
async function DelMachineGroup(res, method, args, req) {
    if (await post_argu.permission(req.session.user.UserId, 'DelMachineGroup')) {
        // let result = await post_argu.post_argu(method, macgroup);
        let result = await post_argu.post_argu(method, { gourpID: req.body.gourpID });
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
    //post_argu.permission(req, res, 'DelMachineGroup', "DelMachineGroup", method, args);
}
//新增设备信息
async function AddMachine(res, method, args, req) {
    var machineInfo = { machineInfo: args };
    if (await post_argu.permission(req.session.user.UserId, 'AddMachine')) {
        let result = await post_argu.post_argu(method, machineInfo);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}
//修改设备信息
async function UpdMachine(res, method, args, req) {
    var machineInfo = { machineInfo: args };
    if (await post_argu.permission(req.session.user.UserId, 'UpdMachine')) {
        let result = await post_argu.post_argu(method, machineInfo);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}
//删除设备信息
async function DelMachine(res, method, args, req) {
    // var strs = args.macs.split(',');
    var mac = { mac_nbrS: args.macs, gp_nbr: +args.nodeid };
    if (await post_argu.permission(req.session.user.UserId, 'DelMachine')) {
        let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/DelMachine', mac);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: -1,
            Message: '没有权限！'
        })
    }
}
//将所选设备移到新组下面
async function MoveMachine(res, method, args) {
    var para = { new_gp_nbr: +args.groupId, mac_nbrS: args.machineiIds, old_gp_nbr: +args.nodeid };
    let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/MoveMachine', para);
    res.json(result);
    res.end();
}

//获取所有的设备组和设备
async function GetAllMachineAndMachineGroup(res, method, args, req) {
    //post_argu.post_argu(res, method, args);
    // let result = await post_argu.post_argu(method, args);
    // res.json(result);
    // res.end();

    var method = global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList';
    var groupID = { user_id: req.session.user.UserId }
    let result = await post_argu.post_argu(method, groupID);
    res.json(result);
    res.end();
}

//获取所有的设备组和设备
async function GetAllMachineAndMachineGroup_CustomerParameter(res, method, args, req) {
    if (await post_argu.permission(req.session.user.UserId, 'AllMachine')) {
        var groupID = { groupID: 0 }
        let result = await post_argu.post_argu(method, groupID);
        res.json(result);
        res.end();
    } else if (await post_argu.permission(req.session.user.UserId, 'OneMachine')) {
        var method = global.Webservice + '/PACommon/PACommon.asmx/getUserMachineList';
        var groupID = { user_id: req.session.user.UserId }
        let result = await post_argu.post_argu(method, groupID);
        res.json(result);
        res.end();
    } else {
        res.json({
            Status: 1,
            Data: null
        });
    }
    // var groupID = { groupID: 0 }
    // let result = await post_argu.post_argu(method, groupID);
    // res.json(result);
    // res.end();
}

function ShowAllPic(res, method, args) {
    var root = './public';
    var imagesDir = '/images/machine';
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
    let imagesDir = './public/images/machine/NoDefault/';
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

exports.location = (req, res) => {
    db.sql('select * from [MACHINE_LOCATION] where MAC_NBR =' + req.query.mac_nbr, (result) => {
        if (result.recordset.length > 0) {
            res.json({
                Status: 0,
                Data: result.recordset
            })
        } else {
            res.json({
                Status: 1,
                Data: null
            })
        }
    })
}

exports.addlocation = (req, res) => {
    db.sql('select * from [MACHINE_LOCATION] where MAC_NBR =' + req.body.MAC_NBR, (result) => {
        if (result.recordset.length > 0) {
            db.sql(`UPDATE [MACHINE_LOCATION]
            SET 
               [MAC_IP] = '${req.body.MAC_IP}'
               ,[latitude] = ${req.body.latitude}
               ,[longitude] = ${req.body.longitude}
               ,[major_IP] = '${req.body.major_ip}'
               ,[SIM_SUM] = '${req.body.SIMCardNumber}'
               ,[gather_Sum] = '${req.body.CollectionBoxNumber}'
          where MAC_NBR = ${req.body.MAC_NBR}`, (result_s) => {
                res.json({
                    Status: 0,
                    Message: '操作成功！'
                })
            })
        } else {
            db.sql(`INSERT INTO [MACHINE_LOCATION]
            ([MAC_NBR]
            ,[MAC_IP]
            ,[latitude]
            ,[longitude]
            ,[major_IP])
      VALUES(${req.body.MAC_NBR},'${req.body.MAC_IP}',${req.body.latitude},${req.body.longitude},'${req.body.major_ip}')`, (result_s) => {
                if (result_s) {
                    res.json({
                        Status: 0,
                        Message: '操作成功！'
                    })
                }
            })
        }
    })
}
exports.moveMove = (req, res) => {
    try {
        if (req.body.RANK_NUM < 0) {
            req.body.RANK_NUM = 0;
        }
        if (req.body.move == 'move_MoveUp') {
            let sqmoreover = `UPDATE MACHINE_INFO  SET RANK_NUM=${+req.body.RANK_NUM + 1}  WHERE  RANK_NUM = ${req.body.RANK_NUM}  and GP_NBR = ${req.body.nodeid}`;
            db.sql(sqmoreover, (result) => {
                //update picture as pic1,picture as pic2 set pic1.status =0,pic2.status=1 where pic1.id='3' and pic2.id='1'
                let sql = "UPDATE MACHINE_INFO  SET RANK_NUM=" + req.body.RANK_NUM + "  WHERE  MAC_NBR =" + req.body.id;
                db.sql(sql, (result) => {
                    res.json({
                        Status: 0,
                        Data: result.recordset,
                        Message: '操作成功！'
                    });
                });
            });
        } else {
            let sqmoreover = `UPDATE MACHINE_INFO  SET RANK_NUM= ${+req.body.RANK_NUM - 1}   WHERE  RANK_NUM = ${req.body.RANK_NUM}  and GP_NBR = ${req.body.nodeid}`;
            db.sql(sqmoreover, (result) => {
                //update picture as pic1,picture as pic2 set pic1.status =0,pic2.status=1 where pic1.id='3' and pic2.id='1'
                let sql = "UPDATE MACHINE_INFO  SET RANK_NUM=" + req.body.RANK_NUM + "  WHERE  MAC_NBR =" + req.body.id;
                db.sql(sql, (result) => {
                    res.json({
                        Status: 0,
                        Data: result.recordset,
                        Message: '操作成功！'
                    });
                });
            });
        }



    } catch (error) {
        res.json({
            Status: -999,
            Data: error
        });
    }
}



exports.getlocation = (req, res) => {
    var major_ip = req.query.major_ip;
    request.get('http://' + major_ip + '/cgi-bin/locatingInfo', (err, response, body) => {
        if (err) {
            res.json({
                Status: -9999,
                Message: err
            })
        } else {
            if (body) {
                try {
                    let temp = JSON.parse(body);
                    //只能处理返回小数点后6位数的算法
                    if (temp.result == 'success') {
                        if (temp.latitude == '' || temp.longitude == '') {
                            let lbslatitude = temp.lbslatitude;

                            let lbslongitude = temp.lbslongitude;
                            db.sql(`update [MACHINE_LOCATION] set latitude=${lbslatitude},longitude=${lbslongitude} where MAC_NBR=${req.query.MAC_NBR}`, (result) => {
                                res.json({
                                    Data: {
                                        lbslatitude: lbslatitude,
                                        lbslongitude: lbslongitude
                                    },
                                    Status: 0
                                })
                                res.close();
                            })
                        } else {
                            let latitude = temp.latitude.substr(0, temp.latitude.length - 1);
                            latitude = latitude.split('.');
                            latitude = Number(latitude[0]) + Number(latitude[1]) / 600000;


                            let longitude = temp.longitude.substr(0, temp.longitude.length - 1);
                            longitude = longitude.split('.');
                            longitude = Number(longitude[0]) + Number(longitude[1]) / 600000;
                            db.sql(`update [MACHINE_LOCATION] set latitude=${latitude},longitude=${longitude} where MAC_NBR=${req.query.MAC_NBR}`, (result) => {
                                res.json({
                                    Data: {
                                        lbslatitude: latitude,
                                        lbslongitude: longitude
                                    },
                                    Status: 0
                                })
                                res.close();
                            })
                        }
                    }

                } catch (error) {
                    res.json({
                        Status: -9999,
                        Message: error
                    })
                }
            }
        }

    })
}

exports.GetmachineByNewCollect = async(req, res) => {
    // let sql_command = `SELECT * FROM (SELECT ROW_NUMBER() OVER(ORDER BY MAC_NBR ASC) AS rowid,* FROM MACHINE_INFO where GP_NBR=${req.body.keyword})t WHERE t.rowid > ${(req.body.PageIndex-1)*req.body.PageSize} AND t.rowid <= ${req.body.PageIndex*req.body.PageSize}`;
    // db.sql(sql_command, (result) => {
    //     var Data = {
    //         Data: {
    //             List: result.recordset,
    //             PageInfo: {
    //                 RecordCount: result.rowsAffected,
    //                 PageSize: 0,
    //                 AUTO_ID: 0,
    //                 FirstIndex: 0,
    //                 PageIndex: 0
    //             }
    //         },

    //     };
    //     res.json(Data);
    //     // db.sql(`select count(*) as count FROM MACHIN_INFO where GP_NBR=${req.body.keyword}`, (result1) => {
    //     //     Data.Data.PageInfo.RecordCount = result1.recordset;
    //     //     res.json(Data);
    //     // })
    // })
    // if (await post_argu.permission(req.session.user.UserId, 'AllMachine')) {
    // var groupID = { user_id: -1 }
    var groupID = { gp_nbr: req.body.keyword, pageIndex: req.body.PageIndex, PageSize: req.body.PageSize };
    let result = await post_argu.post_argu(global.Webservice + '/PACommon/PACommon.asmx/GetPageMachineListByGPID', groupID);
    res.json(result);
    res.end();
    // } else if (await post_argu.permission(req.session.user.UserId, 'OneMachine')) {
    //     var method = global.Webservice + '/PACommon/PACommon.asmx/GetPageMachineListByGPID';
    //     var groupID = { gp_nbr: req.session.user.UserId, pageIndex: req.body.PageIndex, PageSize: req.body.PageSize }
    //     let result = await post_argu.post_argu(method, groupID);
    //     res.json(result);
    //     res.end();
    // } else {
    //     res.json({
    //         Status: 1,
    //         Data: {
    //             List: null,
    //             PageInfo: null
    //         }
    //     });
    // }
}

exports.UpdateMachineByNew = async(req, res) => {
    if (await post_argu.permission(req.session.user.UserId, 'UpdMachine')) {
        let Sql_Update = `UPDATE [MACHINE_INFO]
        SET [MAC_NO] = '${req.body.CATEGORY}'
           ,[MAC_NAME] = '${req.body.MAC_NAME}'
           ,[RANK_NUM] = ${req.body.RANK_NUM}
           ,[ELECTRICAL_SYSTEM] = '${req.body.ELECTRICAL_SYSTEM}'
           ,[CATEGORY] = '${req.body.MAC_NO}'
           ,[SERIAL_NO] = '${req.body.SERIAL_NO}'
           ,[PRICE] = ${req.body.PRICE}
           ,[MANUFACTURE] = '${req.body.MANUFACTURE}'
           ,[BORN_DATE] = '${req.body.BORN_DATE}'
           ,[BUY_PERSON] = '${req.body.BUY_PERSON}'
           ,[PHOTO] ='${req.body.PHOTO}'
           ,[MEMO] = '${req.body.MEMO}'
           ,[COUSTOMER] = '${req.body.COUSTOMER}'
           ,[COUSTOMER_ID] = '${req.body.COUSTOMER_ID}'
           ,[Nation] = '${req.body.Nation}'
           ,[Province] = '${req.body.Province}'
           ,[City] = '${req.body.City}'
           ,[CODE_NO] = '${req.body.CODE_NO}'
           ,[MAC_PROPERTY] = '${req.body.MAC_PROPERTY}'
           ,[Street] = '${req.body.Street}'
      WHERE MAC_NBR = ${req.body.MAC_NBR}`;
        db.sql(Sql_Update, (result) => {
            res.json({
                Status: 0,
                Message: 'OK',
            })
        })
    } else {
        res.json({
            Status: -1,
            Message: '没有权限'
        })
    }

}

exports.getCompanyNumber = async(req,res) => {
    let sqmoreover = `SELECT COMPANY_NO,COMPANY_NAME  from COMPANY_INFO  WHERE  COMPANY_NAME = '${req.body.COMPANY_NAME}'`;
    db.sql(sqmoreover, (result) => {
        //判断是否报错
        if(typeof  result.message !='undefined'){
            res.json({
                Status: -999,
                error: result.message,
            });
        }else{
            res.json({
                Status: 0,
                Data: result.recordset[0],
                Message: '操作成功！'
            });
        }
    });
}

exports.AddMachineByNew = async(req, res) => {
    if (await post_argu.permission(req.session.user.UserId, 'AddMachine')) {
        let sql_add = `INSERT INTO [MACHINE_INFO]
        ([GP_NBR]
        ,[MAC_NO]
        ,[MAC_NAME]
        ,[RANK_NUM]
        ,[ELECTRICAL_SYSTEM]
        ,[CATEGORY]
        ,[SERIAL_NO]
        ,[PRICE]
        ,[MANUFACTURE]
        ,[BORN_DATE]
        ,[BUY_PERSON]
        ,[PHOTO]
        ,[MEMO]
        ,[Nation]
        ,[Province]
        ,[City]
        ,[MAC_PROPERTY]
        ,[CODE_NO]
        ,[Street])
    VALUES
        (${req.body.GP_NBR}
        ,'${req.body.CATEGORY}'
        ,'${req.body.MAC_NAME}'
        ,${req.body.RANK_NUM}
        ,'${req.body.ELECTRICAL_SYSTEM}'
        ,'${req.body.MAC_NO}'
        ,'${req.body.SERIAL_NO}'
        ,${req.body.PRICE}
        ,'${req.body.MANUFACTURE}'
        ,'${req.body.BORN_DATE}'
        ,'${req.body.BUY_PERSON}'
        ,'${req.body.PHOTO}'
        ,'${req.body.MEMO}'
        ,'${req.body.Nation}'
        ,'${req.body.Province}'
        ,'${req.body.City}'
        ,'${req.body.MAC_PROPERTY}'
        ,'${req.body.CODE_NO}'
        ,'${req.body.Street}')`;
        db.sql(sql_add, (result) => {
            if (result.rowsAffected == 1) {
                res.json({
                    Status: 0,
                    Message: '一条记录添加成功'
                })
            } else if (result.rowsAffected == undefined) {
                res.json({
                    Status: -1,
                    Message: '有重复信息'
                })
            }
        })
    } else {
        res.json({
            Status: -1,
            Message: '没有权限'
        })
    }

}