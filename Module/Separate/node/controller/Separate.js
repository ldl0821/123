var path = require('path');
var http = require('http');
var request = require('request');
var fs = require('fs');
var post_argu = require('../../../../routes/post_argu.js');
var config = require('../../../../routes/config.js');


exports.Separate = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/Separates', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/Separate/index'), {
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