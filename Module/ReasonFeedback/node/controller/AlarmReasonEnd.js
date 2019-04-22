var path = require('path');
var moment = require('moment');
var db = require('../../../../routes/db.js');
var config = require('../../../../routes/config');
var post_argu = require('../../../../routes/post_argu.js');
var multiparty = require('multiparty');


exports.AlarmReason = async(req, res) => {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/AddStaff/index'));
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/AlarmReasonEnds', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/AlarmReasonEnd/index'), {
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
    let sql = `select ID from ALARM_REASON_LIST WHERE SCHEME_NAME like '%${req.body.filter.filters}%' and IS_SUCCESS=1`;
    db.sql(sql, (result) => {
        RecordCount = result.recordset.length;
    });
    let sql_command = `SELECT t.*,mgi.MAC_NO,mgi.MAC_NAME,mgi.CATEGORY,bji.REASON as REASON_NAME FROM (SELECT ROW_NUMBER() OVER(ORDER BY ID ASC) AS rowid,* FROM ALARM_REASON_LIST  where IS_SUCCESS=1) t left join MACHINE_INFO mgi on t.MAC_NBR=mgi.MAC_NBR left join ALARM_REASON bji on t.REASONS=bji.ID WHERE t.rowid > ${(req.body.page-1)*req.body.pageSize} AND t.rowid <= ${req.body.page*req.body.pageSize} and SCHEME_NAME like '%${req.body.filter.filters}%' and IS_SUCCESS=1 order by START_DATE desc`;
    db.sql(sql_command, (result) => {
        for(let i = 0; i < result.recordset.length;i++){
            result.recordset[i].START_DATE = moment(result.recordset[i].START_DATE).subtract(8,'h').format('YYYY-MM-DD HH:mm:ss')
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
