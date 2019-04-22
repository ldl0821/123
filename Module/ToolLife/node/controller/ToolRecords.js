/**
 * Created by htc on 2018/12/03.
 */
var path = require('path');
var request = require('request');
var config = require('../../../../routes/config.js')
var post_argu = require('../../../../routes/post_argu.js');
const fs = require('fs');
var db = require('../../../../routes/db.js')
exports.ToolRecord = async(req, res) => {
    if (!req.session.user)
        res.redirect('/');
    else {
        if (await post_argu.permission(req.session.user.UserId, '/ToolRecords', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/ToolRecord/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(),
                config:config
            });
        }
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
        method = post_argu.getpath(__filename, req.params.method);
        args.push(method);
        args.push(req.body);
        doCallback(eval(req.params.method), args, res);
    }
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

//刀具履历---产量（重汽三期）
async function GetCutterHisLifeList(res, method, args) {
    var NEW_CUTTER_NO = args.filter.filters[0].value;
    var BEIN_DATE = args.filter.filters[1].value;
    var END_DATE = args.filter.filters[2].value;
    var MAC_NBR = args.filter.filters[3].value;

    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCutterHisLifeList";
    var result = await post_argu.post_argu(method, { pageIndex: args.page, PageSize: args.pageSize, NEW_CUTTER_NO: NEW_CUTTER_NO,dt_begin:BEIN_DATE,dt_end:END_DATE,mac_nbr:MAC_NBR });

    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//刀具履历---用时（大和）
async function GetCutterDurationHisLifeList(res, method, args) {
    var NEW_CUTTER_NO = args.filter.filters[0].value;
    var BEIN_DATE = args.filter.filters[1].value;
    var END_DATE = args.filter.filters[2].value;
    var MAC_NBR = args.filter.filters[3].value;

    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCutterDurationHisLifeList";
    var result = await post_argu.post_argu(method, { pageIndex: args.page, PageSize: args.pageSize, NEW_CUTTER_NO: NEW_CUTTER_NO,dt_begin:BEIN_DATE,dt_end:END_DATE,mac_nbr:+MAC_NBR });
  
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}