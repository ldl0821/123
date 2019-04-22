var path = require('path');
var request = require('request');
var config = require('../../../../routes/config.js')
var post_common = require('../../../../routes/post_argu.js');
var db = require('../../../../routes/db.js');
exports.activationpage = function(req, res) {
    post_common.permission(req, res, '/machineactivation', 'view', path.resolve(__dirname, '../../web/view/machineactivation/wf_index'));
    // if (!req.session.user)
    //     res.redirect('/');
    // else
    //     res.render(path.resolve(__dirname, '../../web/view/machineactivation/index'), {
    //         menulist: req.session.menu,
    //         user: req.session.user,
    //         lang: post_common.getLanguage()
    //     });
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
    res.render(path.resolve(__dirname, '../../web/view/machineactivation/wf_index_detail'), {
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



exports.getData = function(req, res) {
    var beginDay = req.body.beginDay;
    var endDay = req.body.endDay;
    var macine_type = req.body.macine_type;
    var formula = req.body.formula;
    var date_type = req.body.date_type;
    var machine_nbrs = req.body.machine_nbrs;
    var machine_group = req.body.machine_group;
    // @beginDay DATETIME,
    // @endDay DATETIME,
    // @macine_type INT,
    // @formula INT,
    // @date_type INT,
    // @machine_nbrs NVARCHAR(max),
    // @machine_group NVARCHAR(max)
    var sql = `exec MAC_OR_GROUP_ACTIVATION_RATE '${beginDay}','${endDay}',${macine_type},${formula},${date_type},'${machine_nbrs}','${machine_group}'`;
    db.sql(sql, function(err, result) {

        try {
            // console.log(result)
            res.json({
                Status: 0,
                Message: '',
                Data: result
            })

        } catch (e) {
            res.json({
                Status: -9999,
                Message: e
            })
        }

    })
}