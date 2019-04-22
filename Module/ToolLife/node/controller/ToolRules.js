/**
 * Created by htc on 2018/12/12.
 */
var path = require('path');
var config = require('../../../../routes/config');
var post_argu = require('../../../../routes/post_argu');
var session = require('express-session');
exports.NewCutter = async(req, res) => {
    // post_argu.permission(req, res, '/NewToolConfig', 'view', path.resolve(__dirname, '../../web/view/ToolRoles/index'));
    if (!req.session.user)
        res.redirect('/');
    else {
        if (await post_argu.permission(req.session.user.UserId, '/NewToolConfig', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/ToolRoles/index'), {
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
    //var method = config.webMachineWorkingStateService + '/'+ req.params.method;
    var method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    args.push(req);
    doCallback(eval(req.params.method), args, res, req);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

//刀具规则列表  
async function GetCutterRuleList(res, method, args) {
    var program = args.filter.filters[0].value;
    var mac_nbr = args.filter.filters[1].value;
    var type = args.filter.filters[2].value;
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCutterRuleList";
    var result = await post_argu.post_argu(method, { pageIndex: args.page,PageSize: args.pageSize, program: program, mac_nbr: mac_nbr,type:type });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//新增刀具规则
async function InsertCutterRule(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/InsertCutterRule";
    var result = await post_argu.post_argu(method, { R_NAME: args.R_NAME, STATUS_IDS: args.STATUS_IDS, EXCEPT_LIFE: args.EXCEPT_LIFE,WARN_LIFE:args.WARN_LIFE,MAC_NBR:args.MAC_NBR,CUTTER_GROUP_NBR:args.CUTTER_GROUP_NBR,R_TYPE:args.R_TYPE,PROGRAM:args.PROGRAM,TOL_NO:args.TOL_NO,TOL_NAME:args.TOL_NAME });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//更新刀具规则
async function UpdateCutterRule(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/UpdateCutterRule";
    var result = await post_argu.post_argu(method, { R_NAME: args.R_NAME, STATUS_IDS: args.STATUS_IDS, EXCEPT_LIFE: args.EXCEPT_LIFE,WARN_LIFE:args.WARN_LIFE,MAC_NBR:args.MAC_NBR,CUTTER_GROUP_NBR:args.CUTTER_GROUP_NBR,PROGRAM:args.PROGRAM,R_ID:args.R_ID,TOL_NO:args.TOL_NO,TOL_NAME:args.TOL_NAME });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//删除刀具规则
async function DelCutterRule(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/DelCutterRule";
    var result = await post_argu.post_argu(method, { R_ID: args.R_ID });
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}

//加载程序号
async function getProgramList(res, method, args) {
    var method = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/getProgramList";
    var result = await post_argu.post_argu(method, args);
    
    res.json({
        Status:result.Status,
        Data:result.Data,
        Message:result.Message
    })
}