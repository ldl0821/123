var path = require('path');
var http = require('http');
var fs = require('fs');
var email = require("emailjs");
var request = require('request');
var db = require('../../../../routes/db.js');
var logger = require('../../../../routes/logger')
var config = require('../../../../routes/config');
var post_argu = require('../../../../routes/post_argu.js');
var session = require('express-session');
var moment = require('moment');

exports.AddStaff = async(req, res) => {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/AddStaff/index'));
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/AddStaffs', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/AddStaff/index'), {
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


exports.CutterList = function(req, res) {
    if (req.body.filter == undefined) {
        req.body.filter = {};
        req.body.filter.filters = '';
    }
    let RecordCount;
    let sql = `select COMPANY_NO from COMPANY_INFO WHERE COMPANY_NAME like '%${req.body.filter.filters}%'`;
    db.sql(sql, (result) => {
        RecordCount = result.recordset.length;
    });
    let sql_command = `SELECT * FROM (SELECT ROW_NUMBER() OVER(ORDER BY COMPANY_NO ASC) AS rowid,* FROM COMPANY_INFO)t left join MACHINE_GROUP_INFO mgi on t.MAC_GP_NBR = mgi.GP_NBR WHERE t.rowid > ${(req.body.page-1)*req.body.pageSize} AND t.rowid <= ${req.body.page*req.body.pageSize} and COMPANY_NAME like '%${req.body.filter.filters}%'`;
    db.sql(sql_command, (result) => {
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

        };
        res.json(Data);
        // db.sql(`select count(*) as count FROM MACHIN_INFO where GP_NBR=${req.body.keyword}`, (result1) => {
        //     Data.Data.PageInfo.RecordCount = result1.recordset;
        //     res.json(Data);
        // })
    })

    //WHERE MEMO LIKE '%" + req.body.filter.filters ? '' : req.body.filter.filters + "%'
    // if (req.body.filter == undefined || req.body.filter == null) {
    //     let sql = "select top 50 * from TOOLS_MEASURED order by EVENT_DATE desc";
    //     db.sql(sql, (result) => {
    //         for (var i = 0; i < result.recordset.length; i++) {
    //             result.recordset[i].EVENT_DATE = moment(result.recordset[i].EVENT_DATE).subtract(8, 'h').format('YYYY-MM-DD HH:mm:ss');
    //         }
    //         res.json({
    //             Status: 0,
    //             Data: result.recordset
    //         });
    //     });
    // } else {
    //     let sql = "select top 50 * from TOOLS_MEASURED WHERE MEMO LIKE '%" + req.body.filter.filters + "%' order by EVENT_DATE desc";
    //     // let sql = "select top 50 * from TOOLS_MEASURED order by EVENT_DATE desc WHERE MEMO LIKE %" +  + "%";
    //     db.sql(sql, (result) => {
    //         for (var i = 0; i < result.recordset.length; i++) {
    //             result.recordset[i].EVENT_DATE = initTIme(result.recordset[i].EVENT_DATE);
    //         }
    //         res.json({
    //             Status: 0,
    //             Data: result.recordset
    //         });
    //     });
    // }
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
exports.AddStateList = function(req, res) {
    //COMPANY_NO  客户编号  COMPANY_NAME 客户名称  COMPANY_CODE 客户代码  P_STR1新增人  P_STR2 新增时间

    let selectSql = "select COMPANY_NO,COMPANY_NAME from COMPANY_INFO";
    db.sql(selectSql, (result) => {
        for (let i = 0; i < result.recordset.length; i++) {
            if (result.recordset[i].COMPANY_NO == req.body.COMPANY_NO) {
                res.json({
                    Status: 1,
                });
                return;
            }
            if (result.recordset[i].COMPANY_NAME == req.body.COMPANY_NAME) {
                res.json({
                    Status: 2,
                });
                return;
            }
        }
        let sql = "INSERT  INTO COMPANY_INFO (COMPANY_NO, COMPANY_NAME,COMPANY_CODE, P_STR1,P_STR2) VALUES ('" + req.body.COMPANY_NO + "','" + req.body.COMPANY_NAME + "','" + req.body.COMPANY_CODE + "'," + req.body.P_STR1 + ",'" + getNowFormatDate() + "')";
        db.sql(sql, (result) => {
            res.json({
                Status: 0,
                Data: result.recordset,
                Message: "操作成功"
            });
        });
    });

}

exports.DeleteStateList = function(req, res) {
    let sql = " DELETE FROM COMPANY_INFO WHERE COMPANY_NBR = '" + req.body.COMPANY_NBR + "'";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

exports.UpdataStateList = function(req, res) {
    let selectSql = "select COMPANY_NO,COMPANY_NAME,COMPANY_NBR from COMPANY_INFO";
    db.sql(selectSql, (result) => {
        for (let i = 0; i < result.recordset.length; i++) {
            if (result.recordset[i].COMPANY_NBR == req.body.COMPANY_NBR) {
                continue;
            }
            if (result.recordset[i].COMPANY_NO == req.body.COMPANY_NO) {
                res.json({
                    Status: 1,
                });
                return;
            }
            if (result.recordset[i].COMPANY_NAME == req.body.COMPANY_NAME) {
                res.json({
                    Status: 2,
                });
                return;
            }
        }
        let sql = "UPDATE COMPANY_INFO  SET COMPANY_NO='" + req.body.COMPANY_NO + "',COMPANY_NAME='" + req.body.COMPANY_NAME + "',COMPANY_CODE='" + req.body.COMPANY_CODE + "'  WHERE  COMPANY_NBR =" + req.body.COMPANY_NBR;
        db.sql(sql, (result) => {
            res.json({
                Status: 0,
                Data: result.recordset,
                Message: "操作成功"
            });
        });

    });
}

exports.GetCutterList = (req, res) => {
    let selectSql, COMPANY_NAME;
    COMPANY_NAME = req.body['filter[filters][0][value]'];
    if (COMPANY_NAME == undefined)
        selectSql = "select COMPANY_NO,COMPANY_NAME,COMPANY_NBR from COMPANY_INFO";
    else
        selectSql = `select COMPANY_NO,COMPANY_NAME,COMPANY_NBR from COMPANY_INFO where COMPANY_NAME like '%${COMPANY_NAME}%'`
    db.sql(selectSql, (result) => {
        res.json(result.recordset);
    });
}