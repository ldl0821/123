var path = require('path');
var db = require('../../../../routes/db.js');
var config = require('../../../../routes/config');
var post_argu = require('../../../../routes/post_argu.js');

exports.ReasonConfig = async(req, res) => {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/AddStaff/index'));
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/ReasonConfigs', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/ReasonConfig/index'), {
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
    let sql = `select ID from ALARM_REASON_CONFIG WHERE SCHEME_NAME like '%${req.body.filter.filters}%'`;
    db.sql(sql, (result) => {
        RecordCount = result.recordset.length;
    });
    // let sql_command = `SELECT * FROM (SELECT ROW_NUMBER() OVER(ORDER BY ID ASC) AS rowid,* FROM ALARM_REASON_CONFIG) t WHERE t.rowid > ${(req.body.page-1)*req.body.pageSize} AND t.rowid <= ${req.body.page*req.body.pageSize} and SCHEME_NAME like '%${req.body.filter.filters}%'`;
    let sql_command = `EXEC [GetMac_status] ${req.body.page},${req.body.pageSize},'${req.body.filter.filters}'`;
    db.sql(sql_command, (result) => {
        for(let i = 0; i < result.recordset.length;i++){
            result.recordset[i].MAC_NBR_ALLList = result.recordset[i].MAC_NBR_ALL.split('|');
            for(let w = 0; w <  result.recordset[i].MAC_NBR_ALLList.length-1;w++){
                result.recordset[i].MAC_NBR_ALLList[w] = result.recordset[i].MAC_NBR_ALLList[w].split('(');
                // result.recordset[i].MAC_NBR_ALLList[w][z] 
                result.recordset[i].MAC_NBR_ALLList[w] = result.recordset[i].MAC_NBR_ALLList[w][1].replace(')','')
            }
            result.recordset[i].MAC_NBR_ALLList = result.recordset[i].MAC_NBR_ALLList.join('--');
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

        };
        res.json(Data);
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
    let sql = "INSERT  INTO ALARM_REASON_CONFIG (SCHEME_NAME, OUT_TIME,STATE, MAC_NBR_ALL,IS_OPEN,DESCRIBE) VALUES ('" + req.body.SCHEME_NAME + "'," + req.body.OUT_TIME + "," + req.body.STATE + ",'" + req.body.MAC_NBR_ALL + "','False','"+req.body.DESCRIBE+"')";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}
exports.UpdataState = (req,res) => {
    let sql = "UPDATE ALARM_REASON_CONFIG SET IS_OPEN='" + req.body.IS_OPEN + "' WHERE  ID =" + req.body.ID ;
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

exports.DeleteReasonList = function(req, res) {
    let sql = " DELETE FROM ALARM_REASON_CONFIG WHERE ID = '" + req.body.ID + "'";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

exports.UpdataReasonList = function(req, res) {
    let sql = "UPDATE ALARM_REASON_CONFIG  SET SCHEME_NAME='" + req.body.SCHEME_NAME + "',OUT_TIME=" + req.body.OUT_TIME + ",STATE=" + req.body.STATE + ",MAC_NBR_ALL='" + req.body.MAC_NBR_ALL + "',DESCRIBE='" + req.body.DESCRIBE + "'  WHERE  ID =" + req.body.ID;
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });

}

