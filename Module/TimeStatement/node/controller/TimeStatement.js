var path = require('path');
var http = require('http');
var fs = require('fs');
var post_argu = require('../../../../routes/post_argu.js');
var config = require('../../../../routes/config.js');
// exports.TimeStatement = async(req, res) => {
//     if (req.session.user) {
//         if (await post_argu.permission(req.session.user.UserId, '/TimeStatement', 'view')) {
//             res.render(path.resolve(__dirname, '../../web/view/TimeStatement/index'), {
//                 menulist: req.session.menu,
//                 user: req.session.user,
//                 lang: post_argu.getLanguage(),
//                 config: config
//             })
//         }
//     } else {
//         res.redirect("/login");
//     }
// }

exports.TimeStatement = async(req, res) => {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/Statement/index'));
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/timestatements', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/TimeStatement/index'), {
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