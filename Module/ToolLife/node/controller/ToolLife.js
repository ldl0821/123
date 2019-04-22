/**
 * Created by htc on 2018/12/03.
 */
var path = require('path');
var request = require('request');
var config = require('../../../../routes/config.js')
var post_argu = require('../../../../routes/post_argu.js');
const fs = require('fs');
var db = require('../../../../routes/db.js')
exports.ToolLife = async(req, res) => {
    if (!req.session.user)
        res.redirect('/');
    else {
        if (await post_argu.permission(req.session.user.UserId, '/ToolLifes', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/ToolLife/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(),
                config:config
            });
        }
    }
}
exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    doCallback(eval(req.params.method), args, res);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

//刀具寿命列表--产量（重汽三期）
async function GetCurrentCutterLifeList(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCurrentCutterLifeList";
    var result = await post_argu.post_argu(method, { pageIndex: args.pageIndex, PageSize: args.PageSize, CUTTTER_NO: args.CUTTTER_NO,mac_nbr:args.mac_nbr,CUTTER_STST:args.CUTTER_STST });
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//刀具寿命列表--用时（大和）
async function GetCurrentCutterDurationLifeList(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCurrentCutterDurationLifeList";
    var result = await post_argu.post_argu(method, { pageIndex: args.pageIndex, PageSize: args.PageSize, CUTTTER_NO: args.CUTTTER_NO,mac_nbr:args.mac_nbr,CUTTER_STST:args.CUTTER_STST });
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}


//刀具寿命列表--用时（触摸屏）
async function GetCurrentCutterDurationLifeListScreen(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCurrentCutterDurationLifeList";
    var result = await post_argu.post_argu(method, { pageIndex: args.pageIndex, PageSize: args.PageSize, CUTTTER_NO: args.CUTTTER_NO,mac_nbr:args.mac_nbr,CUTTER_STST:args.CUTTER_STST });
    const sql = `select FACILITY from MEMBER_INFO where MEM_NBR=${args.user_id}`;
    db.sql(sql,(sqlResult)=>{
        let selfFacility = {
            List:[],
            PageInfo:result.Data.PageInfo
        };
        let sqlResultSplit = sqlResult.recordset[0].FACILITY.split(',')
        for(let i = 0; i <result.Data.List.length;i++){
            for(let w = 0; w < sqlResultSplit.length;w++){
                if(result.Data.List[i].MAC_NBR == sqlResultSplit[w]){
                    selfFacility.List.push(result.Data.List[i]);
                    break;
                }
            }
        }
        selfFacility.PageInfo.RecordCount = selfFacility.List.length;
        res.json({
            Status:result.Status,
            Data:selfFacility,
            Message:result.Message
        })
    })
  
}

//刀具编辑
async function UpdateCurrentCutter(res,method,args){
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/UpdateCurrentCutter";
    var result = await post_argu.post_argu(method, { NEW_CUTTER_NO: args.NEW_CUTTER_NO, NEW_CUTTER_NO_NAME: args.NEW_CUTTER_NO_NAME, PROGRAM: args.PROGRAM,EXCEPT_LIFE:args.EXCEPT_LIFE,WARN_LIFE:args.WARN_LIFE,MAC_NBR:args.MAC_NBR,REAL_LIFE:args.REAL_LIFE,R_ID:args.R_ID,NEW_CUTTER_ID:args.NEW_CUTTER_ID });
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//刀具装刀  
async function InsertNewCutter(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/InsertNewCutter";
    var result = await post_argu.post_argu(method, {NEW_CUTTER_UNIQUE_NO: args.NEW_CUTTER_UNIQUE_NO, NEW_CUTTER_NO: args.NEW_CUTTER_NO, NEW_CUTTER_NO_NAME: args.NEW_CUTTER_NO_NAME, PROGRAM: args.PROGRAM,EXCEPT_LIFE:args.EXCEPT_LIFE,WARN_LIFE:args.WARN_LIFE,MAC_NBR:args.MAC_NBR,REAL_LIFE:args.REAL_LIFE,R_ID:args.R_ID });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//刀具卸载刀
async function UninstallCutter(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/UninstallCutter";
    var result = await post_argu.post_argu(method, { NEW_CUTTER_ID: args.NEW_CUTTER_ID });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//换刀
async function ChangeCutter(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/ChangeCutter";
    var result = await post_argu.post_argu(method, {NEW_CUTTER_UNIQUE_NO: args.NEW_CUTTER_UNIQUE_NO, NEW_CUTTER_ID:args.NEW_CUTTER_ID,NEW_CUTTER_NO: args.NEW_CUTTER_NO, NEW_CUTTER_NO_NAME: args.NEW_CUTTER_NO_NAME, PROGRAM: args.PROGRAM,EXCEPT_LIFE:args.EXCEPT_LIFE,WARN_LIFE:args.WARN_LIFE,MAC_NBR:args.MAC_NBR,REAL_LIFE:args.REAL_LIFE,R_ID:args.R_ID });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//刀具规则列表
async function GetCutterRuleList(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCutterRuleList";
    var result = await post_argu.post_argu(method, { pageIndex: args.pageIndex,PageSize: args.PageSize, program: args.program, mac_nbr: args.mac_nbr,type:args.type });
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//获取规则下配置信息
async function GetCutterRuleByR_ID(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCutterRuleByR_ID";
    var result = await post_argu.post_argu(method, { R_ID: args.R_ID });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}