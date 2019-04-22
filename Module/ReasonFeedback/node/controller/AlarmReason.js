const path = require('path');
const moment = require('moment');
const db = require('../../../../routes/db.js');
const config = require('../../../../routes/config');
const post_argu = require('../../../../routes/post_argu.js');
const multiparty = require('multiparty');
const fs = require('fs');
const request = require('request');
const http = require('http');
const WebSocket = require('ws');

exports.AlarmReason = async(req, res) => {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/AddStaff/index'));
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/AlarmReasons', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/AlarmReason/index'), {
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

exports.ReasonList = function(req, res) {
    if (req.body.filter == undefined) {
        req.body.filter = {};
        req.body.filter.filters = '';
    }
    let RecordCount;
    let sql = `select ID from ALARM_REASON_LIST WHERE SCHEME_NAME like '%${req.body.filter.filters}%' and IS_SUCCESS=0`;
    db.sql(sql, (result) => {
        RecordCount = result.recordset.length;
    });
    let sql_command = `SELECT t.*,mgi.MAC_NO,mgi.MAC_NAME,mgi.CATEGORY,bji.REASON as REASON_NAME FROM (SELECT ROW_NUMBER() OVER(ORDER BY DATA_TIME DESC) AS rowid,* FROM ALARM_REASON_LIST  where IS_SUCCESS=0) t left join MACHINE_INFO mgi on t.MAC_NBR=mgi.MAC_NBR left join ALARM_REASON bji on t.REASONS=bji.ID WHERE t.rowid > ${(req.body.page-1)*req.body.pageSize} AND t.rowid <= ${req.body.page*req.body.pageSize} and SCHEME_NAME like '%${req.body.filter.filters}%' and IS_SUCCESS=0`;
    db.sql(sql_command, (result) => {
        for(let i = 0; i < result.recordset.length;i++){
            // 0 是手输   1 是下拉
            result.recordset[i].START_DATE = moment(result.recordset[i].START_DATE).subtract(8,'h').format('YYYY-MM-DD HH:mm:ss')
            if(result.recordset[i].REASONS == 0) {
                result.recordset[i].REASON_NAME = result.recordset[i].ADD_REASONS;
            }
        }
        var Data = {
            Data: {
                List: result.recordset,
                PageInfo: {
                    RecordCount: RecordCount,
                    PageSize: 0,
                    AUTO_ID: 0,
                    FirstIndex: 0,
                    PageIndex: 0
                }
            },
            Status: 0,
            Message: "操作成功"
        };
        res.json(Data);
    })
}

exports.ScreenViewCutterList = (req,res) => {
    if (req.body.filter == undefined) {
        req.body.filter = {};
        req.body.filter.filters = '';
    }
    let RecordCount;
    let sql = `select ID from ALARM_REASON_LIST WHERE SCHEME_NAME like '%${req.body.filter.filters}%' and IS_SUCCESS=0`;
    db.sql(sql, (result) => {
        RecordCount = result.recordset.length;
    });
    let sql_command = `SELECT t.*,mgi.MAC_NO,mgi.MAC_NAME,mgi.CATEGORY,bji.REASON as REASON_NAME FROM (SELECT ROW_NUMBER() OVER(ORDER BY ID ASC) AS rowid,* FROM ALARM_REASON_LIST  where IS_SUCCESS=0) t left join MACHINE_INFO mgi on t.MAC_NBR=mgi.MAC_NBR left join ALARM_REASON bji on t.REASONS=bji.ID WHERE t.rowid > ${(req.body.page-1)*req.body.pageSize} AND t.rowid <= ${req.body.page*req.body.pageSize} and SCHEME_NAME like '%${req.body.filter.filters}%' and IS_SUCCESS=0 and dbo.find_in_set(t.MAC_NBR,(select FACILITY from MEMBER_INFO where MEM_NBR=${req.body.user_id}))>0 order by START_DATE desc`;
    db.sql(sql_command, (result) => {
        for(let i = 0; i < result.recordset.length;i++){
            // 0 是手输   1 是下拉
            result.recordset[i].START_DATE = moment(result.recordset[i].START_DATE).subtract(8,'h').format('YYYY-MM-DD HH:mm:ss');
            if(result.recordset[i].REASONS == 0){
                result.recordset[i].REASON_NAME = result.recordset[i].ADD_REASONS;
            }
        }
        var Data = {
            Data: {
                List: result.recordset,
                PageInfo: {
                    RecordCount: RecordCount,
                    PageSize: 0,
                    AUTO_ID: 0,
                    FirstIndex: 0,
                    PageIndex: 0
                }
            },
            Status: 0,
            Message: "操作成功"
        };
        res.json(Data);
    })
}


exports.ScreenViewCutterListAndroid = (req,res) => {
    if (req.body.filter == undefined) {
        req.body.filter = {};
        req.body.filter.filters = '';
    }
    let getAlarmDataLength = new Promise((resolve,reject) => {
        let sql = `select ID from ALARM_REASON_LIST WHERE SCHEME_NAME like '%${req.body.filter.filters}%'`;
        db.sql(sql, (result) => {
            resolve(result.recordset.length);
        });
    })

    let getAlarmData = new Promise((resolve,reject) => {
        let sql_command = `SELECT 
        TEMP.* FROM 
        (
        SELECT  ROW_NUMBER() OVER(ORDER BY T.MAC_NBR ASC) AS ROW_INDEX, t.*
           ,mgi.MAC_NO,mgi.MAC_NAME,mgi.CATEGORY,bji.REASON as REASON_NAME FROM 
           (
            SELECT A.* FROM ALARM_REASON_LIST A INNER JOIN (SELECT * FROM [FN_GET_TEMP_TB](NULL)) B ON A.MAC_NBR=B.MAC_NBR AND A.DATA_TIME=B.DATETIME
           ) T
          left join MACHINE_INFO mgi on t.MAC_NBR=mgi.MAC_NBR 
          left join ALARM_REASON bji on t.REASONS=bji.ID) TEMP 
          WHERE TEMP.ROW_INDEX > 0 AND TEMP.ROW_INDEX <= 9999 and SCHEME_NAME 
          like '%%'  order by START_DATE desc`;
        db.sql(sql_command, (result) => {
            for(let i = 0; i < result.recordset.length;i++) {
                // stateFlag   1 是联网   3 是未联网   2 是联网但是没有产生报警
                result.recordset[i].START_DATE = moment(result.recordset[i].START_DATE).subtract(8,'h').format('YYYY-MM-DD HH:mm:ss');
                if(result.recordset[i].REASONS == 0) {
                    result.recordset[i].REASON_NAME = result.recordset[i].ADD_REASONS;
                }
                result.recordset[i].stateFlag = 1;
            }
            resolve(result.recordset);
            // var Data = {
            //     Data: {
            //         List: result.recordset,
            //         PageInfo: {
            //             RecordCount: RecordCount,
            //             PageSize: 0,
            //             AUTO_ID: 0,
            //             FirstIndex: 0,
            //             PageIndex: 0
            //         }
            //     },
            //     Status: 0,
            //     Message: "操作成功"
            // };
            // res.json(Data);
        })
    })


    let getUserData = new Promise((resolve,reject) => {
        let sql = `select * from MEMBER_INFO`;
        db.sql(sql, (result) => {
            resolve(result.recordset);
        });
    })

    let getFacilityData = new Promise((resolve,reject) => {
        let sql = `select * from MACHINE_INFO`;
        db.sql(sql, (result) => {
            resolve(result.recordset);
        });
    })

    let getRealData = new Promise((resolve,reject) => {
        request.get({ url: 'http://' + config.dataIP + ':' + config.dataport + '/DataCenter/GetAll', timeout: 30000 }, (err, response, body) => {
            if (err) {
                reject(err);
            } else {
                if (body) {
                    resolve(JSON.parse(body));
                }
            }
        })
    })

    Promise.all([getAlarmDataLength, getAlarmData, getUserData, getFacilityData, getRealData]).then((result)=>{
        var resultArrSole = [];
        for (var i = 0; i < result[3].length; i++) {
            var obj = result[3][i];
            var num = obj.MAC_NBR;
            var flag = false;
            for (var j = 0; j < result[4].length; j++) {
                var aj = result[4][j];
                var n = aj.MacNbr;
                if (n == num) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                resultArrSole.push(obj);
            }
        }
        for(let m = 0;m < resultArrSole.length;m++){
            // 这里新增的都是未联网的
            result[1].push({
                rowid: result[1].length + m+1,
                CATEGORY:resultArrSole[m].CATEGORY,
                DESCRIBE: '',
                FILE_NAME:'',
                IS_ADD: '',
                IS_FILE: false,
                IS_SUCCESS: false,
                MAC_NAME: resultArrSole[m].MAC_NAME,
                MAC_NBR: resultArrSole[m].MAC_NBR,
                MAC_NO: resultArrSole[m].MAC_NO,
                MAC_NO: resultArrSole[m].MAC_NO,
                REASONS:'',
                REASON_NAME: '',
                SCHEME_NAME:'',
                START_DATE: undefined,
                STATE: '',
                stateFlag:3,
            })
        }


        var resultArrSoleNone = [];
        for (var i = 0; i < result[3].length; i++) {
            var obj = result[3][i];
            var num = obj.MAC_NBR;
            var flag = false;
            for (var j = 0; j < result[1].length; j++) {
                var aj = result[1][j];
                var n = aj.MAC_NBR;
                if (n == num) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                resultArrSoleNone.push(obj);
            }
        }


        for(let m = 0;m < resultArrSoleNone.length;m++){
            // 这里新增的都是以联网的 但是没有数据的
            result[1].push({
                rowid: result[1].length + m+1,
                CATEGORY:resultArrSoleNone[m].CATEGORY,
                DESCRIBE: '',
                FILE_NAME:'',
                IS_ADD: '',
                IS_FILE: false,
                IS_SUCCESS: false,
                MAC_NAME: resultArrSoleNone[m].MAC_NAME,
                MAC_NBR: resultArrSoleNone[m].MAC_NBR,
                MAC_NO: resultArrSoleNone[m].MAC_NO,
                MAC_NO: resultArrSoleNone[m].MAC_NO,
                REASONS:'',
                REASON_NAME: '',
                SCHEME_NAME:'',
                START_DATE:undefined,
                STATE: '',
                stateFlag: 2,
            })
        }

        result[1].sort(function(x,y){
            return x.stateFlag - y.stateFlag;
        })

        for(let w = 0; w < result[2].length; w++){
            let arrFacility = result[2][w].FACILITY.split(',');
            for(let i = 0; i < result[1].length; i++) {
                if(arrFacility.indexOf(String(result[1][i].MAC_NBR)) != -1) {
                    result[1][i].userName = result[2][w].MEM_NAME;
                    result[1][i].userNo = result[2][w].MEMBER_NO;
                }
            }
        }
        var Data = {
            Data: {
                List: result[1],
                PageInfo: {
                    RecordCount: result[1].length,
                    PageSize: 0,
                    AUTO_ID: 0,
                    FirstIndex: 0,
                    PageIndex: 0
                }
            },
            Status: 0,
            Message: "操作成功"
        };
        res.json(Data);
    }).catch((error) => {
        res.json({
            Status:-999,
            data: '发生错误'
        })
    })
}

// exports.GetAllUrgrncytext = function(req, res) {
//     let sql = "select Cutting_Content as text from TOOLS_INFO";
//     db.sql(sql, (result) => {
//         res.json({
//             Status: 0,
//             Data: result.recordset
//         });
//     });
// }

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
        " " + date.getHours() + seperator2 + date.getMinutes() +
        seperator2 + date.getSeconds();
    return currentdate;
}
exports.AddReason = function(req, res) {
    let sql = "INSERT  INTO ALARM_REASON (REASON) VALUES ('" + req.body.REASON + "')";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}
exports.getAlarmReason = (req,res)=>{
    let sql = "SELECT *  FROM ALARM_REASON";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}
exports.CompleteStateList = (req,res)=>{
    let sql = " UPDATE ALARM_REASON_LIST SET IS_SUCCESS='1' WHERE  ID =" + req.body.ID;
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

exports.GetSchemeName = (req,res) =>{
    let sql = "SELECT * FROM ALARM_REASON_CONFIG";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

exports.AddScreenList = (req,res) => {
    let sql = `
    INSERT  INTO ALARM_REASON_LIST 
    (MAC_NBR, START_DATE,SCHEME_NAME, STATE,DATA_TIME, IS_FILE,IS_SUCCESS,IS_ADD) VALUES
    ('${req.body.MAC_NBR}','${req.body.START_DATE}','${req.body.SCHEME_NAME}','${req.body.STATE}','${moment().format('YYYY-MM-DD HH:MM:ss')}','False','False','True')
    `;
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

exports.updataAlarmReason = (req,res)=>{
    // 0 是手输   1 是下拉
    let sql;
    if(req.body.ifAdd == 0){
        sql = "UPDATE ALARM_REASON_LIST  SET REASONS=" + 0 + ",ADD_REASONS=" + req.body.REASON + " WHERE  ID =" + req.body.ID;
    }else{
        sql = "UPDATE ALARM_REASON_LIST  SET REASONS=" + req.body.REASON  + ",ADD_REASONS=" + null + " WHERE  ID =" + req.body.ID;
    }
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}
exports.uploadFile = (req,res)=>{
    var form = new multiparty.Form();
    // form.encoding = 'utf-8';
    form.uploadDir = './Module/ReasonFeedback/file';
    form.keepExtensions = true; //保留后缀
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.send(err);
            return;
        } else {
            let dstPath = './Module/ReasonFeedback/file/' + moment().format('MMDDHHmmss')+files['file[]'][0].originalFilename;
            fs.renameSync('./'+files['file[]'][0].path, dstPath); //重命名
            let sql = "UPDATE ALARM_REASON_LIST  SET IS_FILE='1',FILE_NAME='" + moment().format('MMDDHHmmss')+files['file[]'][0].originalFilename + "' WHERE ID=" + fields.ID[0];
            db.sql(sql, (result) => {
                res.json({
                    Status: 0,
                    Data: result.recordset,
                    Message: "操作成功"
                });
            });
        }
    })
}




exports.CreateAlarmReasonList = (app) => {
    // const server = http.createServer(app);
    // const wss = new WebSocket.Server({server});
    // wss.on('connection', function connection(ws,http) {
    //     console.log('开始连接！');
    //     ws.on('message', function incoming(data) {
    //          console.log('接收到了消息！');
    //         /**
    //          * 把消息发送到所有的客户端
    //          * wss.clients获取所有链接的客户端
    //          */
    //         wss.clients.forEach(function each(client) {
    //             client.send(data);
    //         });
    //     });
    // });
    // server.listen(config.alarmWebSocketPort, function listening() {
    //     console.log('报警服务启动成功！端口' + config.alarmWebSocketPort);
    // });


    let addDataAlarm = ()=>{
        let getAlarmReasonConfig = new Promise((resolve, reject)=>{
            let selectSql = `select * from ALARM_REASON_CONFIG where IS_OPEN=1`;
            db.sql(selectSql, (result) => {
                resolve(result.recordset)
            });
        });
        let getAlarmTimeOut = new Promise((resolve,reject)=>{
            let selectSql = `select * from ORIGINAL_VISUAL_STATUS`;
            db.sql(selectSql, (result) => {
                resolve(result.recordset)
            });
        })
        Promise.all([getAlarmReasonConfig,getAlarmTimeOut]).then(result=>{
                let macNbrArrConfig = [];
                for ( let i = 0; i < result[0].length;i++ ) {
                    result[0][i].MAC_NBR_ALL = result[0][i].MAC_NBR_ALL.split(',');
                    for(let w = 0;w <result[0][i].MAC_NBR_ALL.length;w++){
                        macNbrArrConfig.push({
                            MAC_NBR:result[0][i].MAC_NBR_ALL[w],
                            DESCRIBE:result[0][i].DESCRIBE,
                            IS_OPEN:result[0][i].IS_OPEN,
                            ID:result[0][i].ID,
                            OUT_TIME:result[0][i].OUT_TIME,
                            SCHEME_NAME:result[0][i].SCHEME_NAME,
                            STATE:result[0][i].STATE,
                        })
                    }
                }
                let macNbrArrList = [];
                for(let w = 0;w <result[1].length;w++ ){
                    for(let z = 0;z < macNbrArrConfig.length;z++){
                        if(result[1][w].MAC_NBR == macNbrArrConfig[z].MAC_NBR && result[1][w].STATUS_NBR == macNbrArrConfig[z].STATE) {
                            macNbrArrList.push({
                                MAC_NBR:result[1][w].MAC_NBR,
                                STATE:macNbrArrConfig[z].STATE,
                                START_DATE:moment(result[1][w].START_DATE).subtract(8,'h').format('YYYY-MM-DD HH:mm:ss'),
                                SCHEME_NAME: macNbrArrConfig[z].SCHEME_NAME,
                                OUT_TIME: macNbrArrConfig[z].OUT_TIME,
                                DESCRIBE: macNbrArrConfig[z].DESCRIBE,
                            })
                        }
                    }
                }
                let dataSQL =  macNbrArrList.filter((x)=>{
                    return moment(x.START_DATE).add(x.OUT_TIME,'m').isBefore(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
                })
                for(let i = 0 ; i < dataSQL.length; i++){
                    let selectSql = `if not exists (select 1 from ALARM_REASON_LIST where MAC_NBR = ${dataSQL[i].MAC_NBR} and START_DATE='${dataSQL[i].START_DATE}')
                        insert into ALARM_REASON_LIST(MAC_NBR,STATE,SCHEME_NAME,DESCRIBE,REASONS,IS_FILE,FILE_NAME,IS_SUCCESS,START_DATE,DATA_TIME)
                                               VALUES(${dataSQL[i].MAC_NBR},${dataSQL[i].STATE},'${dataSQL[i].SCHEME_NAME}','${dataSQL[i].DESCRIBE}',0,0,'',0,'${dataSQL[i].START_DATE}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}')`;
                    db.sql(selectSql, (result) => {
                        result.rowsAffected.length != 0 && console.log('数据添加成功');
                    });
                }
            }
        ).catch(error => {
                console.error('服务器发生错误');
            }
        )
    }
    addDataAlarm();
    setInterval(addDataAlarm,60000);
}

