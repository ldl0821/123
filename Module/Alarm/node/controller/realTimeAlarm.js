var db = require('../../../../routes/db.js');
var path = require('path');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
var moment = require('moment');
var async = require('async');
exports.Index = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/RealTimeAlarm', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/RealTimeAlarm/index'), {
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

exports.getAlarm = function(req, res) {
    // var sql = `SELECT TOP(20) AD.ALARM_NBR,AD.ALARM_DATE,AD.MAC_NBR,MI.MAC_NAME,AD.ALARM_MESSAGE 
    // FROM dbo.ALARM_DATA AD LEFT JOIN  dbo.MACHINE_INFO MI 
    // ON AD.MAC_NBR=MI.MAC_NBR WHERE ALARM_DATE>'2017-09-18'
    // ORDER BY ALARM_DATE DESC`
    var date = moment().format('YYYY-MM-DD');
    var sql = `SELECT TOP(20) AD.ALARM_NBR,AD.ALARM_DATE,AD.MAC_NBR,MI.MAC_NAME,AD.ALARM_MESSAGE 
        FROM dbo.ALARM_DATA AD LEFT JOIN  dbo.MACHINE_INFO MI 
        ON AD.MAC_NBR=MI.MAC_NBR WHERE ALARM_DATE>'${date}'
        ORDER BY ALARM_DATE DESC`

    db.sql(sql, function(err, data) {
        if (err) {
            res.json({
                Data: data,
                Status: 1,
                Message: err
            })
        }
        res.json({
            Data: data,
            Status: 0,
            Message: '操作成功'
        })
    })
}

exports.getAlarmNum = function(req, res) {
    async.waterfall([
        function(cb) {
            var macSql = 'SELECT MAC_NAME,MAC_NBR FROM dbo.MACHINE_INFO';
            db.sql(macSql, function(err, data) {
                cb(null, data)
            })
        },
        function(mac, cb) {
            var date = moment().format('YYYY-MM-DD');
            var alarmNumSql = `SELECT MAC_NBR FROM dbo.ALARM_DATA WHERE ALARM_DATE>'${date}' ORDER BY ALARM_DATE DESC`;
            //var alarmNumSql = `SELECT MAC_NBR FROM dbo.ALARM_DATA WHERE ALARM_DATE>'2017-09-18' ORDER BY ALARM_DATE DESC`;
            db.sql(alarmNumSql, function(err, data) {
                if (data.length == 0) {
                    cb(null, [], mac)
                } else {
                    cb(null, data, mac)
                }

            })
        },
        function(data, mac, cb) {
            mac.forEach(function(v, i) {
                v.value = 0;
            });
            mac.forEach(function(v, i) {
                data.forEach(function(j, k) {
                    if (v.MAC_NBR == j.MAC_NBR) {
                        v.value += 1;
                    }
                })
            })
            cb(null, mac);

        }
    ], function(err, result) {
        if (err) {
            res.json({
                Data: err,
                Status: 1,
                Message: err
            })
        } else {
            res.json({
                Data: result,
                Status: 0,
                Message: '操作成功'
            })
        }
    })
}