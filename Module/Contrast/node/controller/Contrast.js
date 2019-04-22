const path = require('path');
const http = require('http');
const db = require('../../../../routes/db.js');
const request = require('request');
const fs = require('fs');
const post_argu = require('../../../../routes/post_argu.js');
const config = require('../../../../routes/config.js');


exports.Contrast = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/Contrast', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/Contrast/index'), {
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

exports.GetContrast = async(req, res) => {
    let sql = `SELECT   PUR.MAC_NBR,PUR.PRO_GRAM,PUR.UPDATE_TIME,PUR.IS_DO_WITH,
    MF.GP_NBR,MF.MAC_NO,MF.MAC_NAME,MF.RANK_NUM,MF.CATEGORY,MF.SERIAL_NO,
     CMP.OLD_V,CMP.NEW_V,CMP.COMPARE_CONTENT,CMP.COMPARE_TIME,
     PRRT.LAST_V,PRRT.LAST_TIME,PRRT.TOTALL_LAST_V
             FROM PRO_UPDATE_RECORD PUR  INNER JOIN PRO_RECORD_REAL_TIME PRRT 
                                 ON PRRT.MAC_NBR = PUR.MAC_NBR AND PRRT.PRO_GRAM = PUR.PRO_GRAM
             INNER JOIN dbo.COMPARE_RECORD CMP ON CMP.PID = PRRT.PID AND CMP.UPDATE_TIME = PUR.UPDATE_TIME
             INNER JOIN dbo.MACHINE_INFO MF ON MF.MAC_NBR = PUR.MAC_NBR 
             WHERE PUR.MAC_NBR IN (SELECT C1 FROM dbo.func_splitstring('${req.body.id}',','))
             AND CMP.UPDATE_TIME>='${req.body.time}' AND CMP.UPDATE_TIME<'${req.body.timeEnd}'
             `;
    if (req.body.compiles != "") {
        sql += ` AND PUR.PRO_GRAM='${req.body.compiles}'  `;
    }
    sql += " ORDER BY PUR.MAC_NBR,PUR.PRO_GRAM,PUR.UPDATE_TIME DESC ";
    db.sql(sql, (result) => {
        var resultRecordset = [];
        for (let q = 0; q < result.recordset.length; q++) {
            result.recordset[q].COMPARE_CONTENT = JSON.parse(result.recordset[q].COMPARE_CONTENT);
            if (result.recordset[q].COMPARE_CONTENT.length == 0) {
                delete result.recordset[q];
            }
        }
        for (let z = 0; z < result.recordset.length; z++) {
            if (result.recordset[z] != null) {
                resultRecordset.push(result.recordset[z])
            }
        }
        // for (let q = 0; q < resultRecordset.length; q++) {

        // }
        res.json({
            Status: 0,
            Data: resultRecordset
        });
    });
}

exports.GetProGram = async(req, res) => {
    let sql = "select PRO_GRAM as text from PRO_RECORD_REAL_TIME";
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset
        });
    });
}