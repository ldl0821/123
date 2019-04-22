var path = require('path');
var request = require('request');
var logger = require('../../../../routes/logger.js');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
exports.partsummarypage = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/partsummarys', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/partsummary/index'), {
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

exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    args.push(req);
    doCallback(eval(req.params.method), args, res, req);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

async function GetPartSummary(res, method, args,req){
    var product_name=null;
    var macs=[];
    var sttime=null;
    var edtime=null;
        if(args.filter!=null){
            product_name=args.filter.filters[0].value;
            macs=args.filter.filters[1].value;
            sttime=args.filter.filters[2].value;
            edtime=args.filter.filters[3].value;
    }
    var paras={pagesize:args.pageSize,pageindex:args.page,macs:macs,product_name:product_name,program_no:"",sttime:sttime,edtime:edtime};
    let result = await post_argu.post_argu(method, paras);  
    res.json(result);
    res.end();
}