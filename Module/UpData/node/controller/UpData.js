var path = require('path');
var http = require('http');
var fs = require('fs');
var request = require('request');
var db = require('../../../../routes/db.js');
var logger = require('../../../../routes/logger')
var config = require('../../../../routes/config');
var post_argu = require('../../../../routes/post_argu.js');



exports.UpData = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/statusrate', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/UpData/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(req),
                config: config
            })
        }
    } else {
        res.redirect("/login");
    }
    //post_argu.permission(req, res, '/UpData', 'view', path.resolve(__dirname, '../../web/view/UpData/index'));
}

exports.GetColumns = (req, res) => {
    //req.body.macNbrs
    request.get('http://' + config.dataIP + ':' + config.dataport + '/DataCenter/GetColumns?macNbr=' + req.body.macNbrs, (err, response, body) => {
        if (err) {
            res.json({
                Status: -999,
                Data: err
            })
        } else {
            if (body) {
                try {
                    res.json({
                        Status: 0,
                        Data: JSON.parse(body),
                    })
                } catch (e) {
                    res.json({
                        Status: -999,
                        Data: null,

                    })
                }
            } else {
                res.json({
                    Status: -999,
                    Data: null
                })
            }
        }
    })
}

exports.GetItems = (req, res) => {
    request.post({
        url: 'http://' + config.dataIP + ':' + config.dataport + '/DataCenter/GetItems',
        timeout: 30000,
        headers: {
            'content-type': 'application/json',
        },
        json: true,
        body: [req.body.macNbrs]
    }, (err, response, body) => {
        if (err) {
            res.json({
                Status: -999,
                Data: err
            })
        } else {
            if (body) {
                try {
                    for (let i = 0; i < body.length; i++) {
                        body[i].Value = [];
                        for (let item in body[i].Items) {
                            body[i].Value.push(body[i].Items[item])
                        }
                    }
                    res.json({
                        Status: 0,
                        Data: body,
                    })
                } catch (e) {
                    res.json({
                        Status: -999,
                        Data: null,

                    })
                }
            } else {
                res.json({
                    Status: -999,
                    Data: null
                })
            }
        }
    })
}

exports.GetPara = async(req, res) => {
    let methods = global.Webservice + '/ProcessParameters/ProcessParameters.asmx/GetParameterList_MongoDb';
    let para = {
        "macNo": 70,
        "BeginDate": 1531192473,
        "EndDate": 1531192492,
        "SignList": [
            "STD::Status"
        ]
    };
    let result = await post_argu.post_argu(methods, para);
    res.json(result);
    res.end();
}