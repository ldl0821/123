/**
 * Created by htc on 2018/12/03.
 */
var path = require('path');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
exports.ToolRunningTime = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/ToolRunningTime', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/ToolRunningTime/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(req),
                config: config
            })
        }
    } else {
        res.redirect("/login");
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