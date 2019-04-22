var path = require('path');
var request = require('request');
var config = require('../../../../routes/config.js')
var post_common = require('../../../../routes/post_argu.js');
var fs = require('fs');
exports.activationpage = function(req, res) {
    post_common.permission(req, res, '/machineactivation', 'view', path.resolve(__dirname, '../../web/view/machineactivation/index'));
}


exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    args.push(method = post_common.getpath(__filename, req.params.method));

    args.push(req.body);

    doCallback(eval(req.params.method), args, res);

}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

function GetGroupActivation(res, method, args) {
    var data = {
        machineMode: args.machineMode,
        objectIds: args.objectIds.split(','),
        startTime: args.startTime,
        endTime: args.endTime
    };
    post_common.post_argu(res, method, data);
}

function GetActivation(res, method, args) {
    post_common.post_argu(res, method, args);
}

function GetMachineActivation(res, method, args) {
    var data = {
        machineMode: args.machineMode,
        objectIds: args.objectIds.split(','),
        startTime: args.startTime,
        endTime: args.endTime
    };
    post_common.post_argu(res, method, data);
}

exports.OutPutIndex = function(req, res) {
    res.render(path.resolve(__dirname, '../../web/view/machineactivation/index_detail'), {
        menulist: req.session.menu,
        user: req.session.user,
        lang: post_common.getLanguage()
    });
}

exports.MachineActivationDetail = function(req, res) {
    var data;
    for (var temp in req.body) {
        data = JSON.parse(temp);
    }
    data.objectIds = data.objectIds.split(',');
    var method = post_common.getpath(__filename, 'GetMachineActivation');
    post_common.post_argu(res, method, data);
}

exports.GroupActivationDetail = function(req, res) {
    var data;
    for (var temp in req.body) {
        data = JSON.parse(temp);
    }
    data.objectIds = data.objectIds.split(',');
    var method = post_common.getpath(__filename, 'GetGroupActivation');
    post_common.post_argu(res, method, data);

}


exports.downloadExcel = (req, res) => {
    var method = global.Webservice + '/Report/Excel.asmx/MachineActivationExcel';
    req.query.fromPath = path.resolve('./ReportTemplate/设备稼动率(按设备导出).xlsm');
    req.query.toPath = path.resolve('./tempfiles/11.xlsm');
    fs.exists(req.query.toPath, (exist) => {
        if (exist) {
            fs.unlink(req.query.toPath, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    request.post({
                        url: method,
                        json: true,
                        headers: {
                            "content-type": "application/json"
                        },
                        body: req.query
                    }, function(error, response, body) {
                        if (body.d) {
                            try {
                                var result = JSON.parse(body.d);
                                if (result.StatusCode == 0) {
                                    fs.exists(req.query.toPath, function(exist) {
                                        if (exist) {
                                            res.set({
                                                "Content-type": "application/octet-stream",
                                                "Content-Disposition": "attachment;filename=" + encodeURI("设备稼动率(按设备导出).xlsm")
                                            });
                                            fReadStream = fs.createReadStream(req.query.toPath);
                                            fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
                                            fReadStream.on("end", function() {
                                                res.end();
                                            });
                                        } else {
                                            res.set("Content-type", "text/html");
                                            res.send("file not exist!");
                                            res.end();
                                        }
                                    })
                                }
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    })
                }
            })
        } else {
            request.post({
                url: method,
                json: true,
                headers: {
                    "content-type": "application/json"
                },
                body: req.query
            }, function(error, response, body) {
                if (body.d) {
                    try {
                        var result = JSON.parse(body.d);
                        if (result.StatusCode == 0) {
                            fs.exists(req.query.toPath, function(exist) {
                                if (exist) {
                                    res.set({
                                        "Content-type": "application/octet-stream",
                                        "Content-Disposition": "attachment;filename=" + encodeURI("设备稼动率(按设备导出).xlsm")
                                    });
                                    fReadStream = fs.createReadStream(req.query.toPath);
                                    fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
                                    fReadStream.on("end", function() {
                                        res.end();
                                    });
                                } else {
                                    res.set("Content-type", "text/html");
                                    res.send("file not exist!");
                                    res.end();
                                }
                            })
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            })
        }
    })
}