var path = require('path');
var db = require('../../../../routes/db.js');
var config = require('../../../../routes/config');
var post_argu = require('../../../../routes/post_argu.js');

exports.index = async(req, res) => {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/AddStaff/index'));
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/personnels', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/personnel/index'), {
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
    let sql = `select MEMBER_NO from MEMBER_INFO WHERE MEMBER_NO like '%${req.body.filter.filters}%'`;
    db.sql(sql, (result) => {
        RecordCount = result.recordset.length;
        // let sql_command = `SELECT * FROM (SELECT ROW_NUMBER() OVER(ORDER BY MEMBER_NO ASC) AS rowid,* FROM MEMBER_INFO)t  WHERE t.rowid > ${(req.body.page-1)*req.body.pageSize} AND t.rowid <= ${req.body.page*req.body.pageSize} and MEMBER_NO like '%${req.body.filter.filters}%'`;
        let sql_command = `EXEC GetMan_infoX ${req.body.page},${req.body.pageSize},'${req.body.filter.filters}'`
        db.sql(sql_command, (result) => {
            for(let i = 0; i < result.recordset.length;i++){
                result.recordset[i].MAC_NBR_ALLList = result.recordset[i].FACILITY.split('|');
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
    });

}


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
    let selectSql = "select MEMBER_NO from MEMBER_INFO";
    db.sql(selectSql, (result) => {
        for (let i = 0; i < result.recordset.length; i++) {
            if (result.recordset[i].MEMBER_NO == req.body.MEMBER_NO) {
                res.json({
                    Status: 1,
                    Message: "编号重复"
                });
                return;
            }
        }
        let sql = "INSERT INTO MEMBER_INFO (GP_NBR, MEMBER_NO, RANK_NUM, SEX, USER_ID, FACILITY, MEM_NAME) VALUES ('1','" + req.body.MEMBER_NO + "','0'," + req.body.SEX + "," +  req.session.user.UserId + ",'"+ req.body.FACILITY +"','"+ req.body.MEM_NAME+"')";
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
    let sql = " DELETE FROM MEMBER_INFO WHERE MEM_NBR = '" + req.body.MEM_NBR + "'";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
}

exports.UpdataStateList = function(req, res) {
    // let selectSql = "select MEMBER_NO from MEMBER_INFO";
    // db.sql(selectSql, (result) => {
    //     for (let i = 0; i < result.recordset.length; i++) {
    //         if (result.recordset[i].MEMBER_NO == req.body.MEMBER_NO) {
    //             res.json({
    //                 Status: 1,
    //                 Message: "编号重复"
    //             });
    //             return;
    //         }
    //     }
    let sql = `UPDATE MEMBER_INFO SET MEMBER_NO='${req.body.MEMBER_NO}',SEX=${req.body.SEX},USER_ID=${req.session.user.UserId},FACILITY='${req.body.FACILITY}',MEM_NAME='${req.body.MEM_NAME}'  WHERE  MEM_NBR =${req.body.MEM_NBR}`;
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: "操作成功"
        });
    });
    // });
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