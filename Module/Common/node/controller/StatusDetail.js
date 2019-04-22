var path = require('path');
var post_argu = require('../../../../routes/post_argu.js');
var config = require('../../../../routes/config.js');
var request = require('request');
exports.StatusDetail = function(req, res) {
    post_argu.permission(req, res, '/StatusDetail', 'view', path.resolve(__dirname, '../../web/view/StatusDetail/index'));
}
exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    // for(var i in req.body)
    // {
    //     var temp = {};
    //     temp[i] = req.body[i];
    //     args.push(temp);
    // }
    doCallback(eval(req.params.method), args, res);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}

// 获取设备和设备组
async function GetAllMachineAndMachineGroup(res, method, args) {
    var groupID = { groupID: 0 }
    let result = await post_argu.post_argu(method, groupID);
    res.json(result);
    res.end();
}

function GetKeywordMachinelist(res, method, args) {
    post_argu.post_argu(res, method, args);
}

function GetMachineStatusListByName(res, method, args) {
    var ObjectIDs = [];
    ObjectIDs.push(args.ObjectIDs);
    var data = {
        StartTime: args.StartTime,
        EndTime: args.EndTime,
        ShowDetails: args.ShowDetails,
        ObjectIDs: ObjectIDs
    }
    post_argu.post_argu(res, method, data);
}