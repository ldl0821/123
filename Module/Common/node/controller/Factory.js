var path = require('path');
var request = require('request');
var logger = require('../../../../routes/logger.js');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');

exports.index = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/Factory', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/Factory/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(),
                config: config
            });
        }
    } else {
        res.redirect("/login");
    }
}


//处理事件
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
        args.push(req);
        doCallback(eval(req.params.method), args, res);
    }

}