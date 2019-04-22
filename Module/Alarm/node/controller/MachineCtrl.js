var db = require('../../../../routes/db.js');
var path = require('path');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
var moment = require('moment');
var fs = require('fs');
var el = require('../../../../routes/excel.js');
var Excel = require('exceljs');
var _ = require('underscore');

exports.Index = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/MachineAlarm', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/pinganAlarm/index'), {
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

//处理事件
exports.fun = function(req, res) {
    // if (!req.session.user) {
    //     res.json({
    //         Status: -2,
    //         Message: 'session失效，请重新登陆！'
    //     });
    // } else {
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    doCallback(eval(req.params.method), args, res);
    // }
}

function doCallback(fn, args, res) {
    fn.apply(args[1], args);
}

async function GetASlarmDataList(res, method, args) {
    method = global.Webservice + '/PACommon/PAALARMData.asmx/GetASlarmDataList';
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}

async function GetASlarmDataListBycons(res, method, args) {
    let result = await post_argu.post_argu(method, args);
    res.json(result);
    res.end();
}


//add 报警报表导出 htc:20180626
exports.outExcel = async(req, res) => {
    var toPath = path.resolve('./tempfiles/设备报警分析(按设备查看)报表.xlsx');
    let method = global.Webservice + '/WebReport/AlarmDataExport.asmx/GetNewAlarmDataList';
    let para = JSON.parse(req.query.keyValue);
    var queryData = {
        mars: para.mars,
        dt_begin: para.dt_begin,
        dt_end: para.dt_end,
    }
    let result = await post_argu.post_argu(method, queryData);

    let sortResult = _.sortBy(result.Data, function(item) { return parseInt(item.ALARM_NO); }); //排序，按报警号从小到大
    let data = _.groupBy(sortResult, 'MAC_NBR'); //分组，按MAC_NBR
    let keys = _.keys(data); //数组，获取上面分组的key值

    var workbook = new Excel.Workbook();

    var ws = workbook.addWorksheet("设备报警分析(按设备查看)");
    ws.mergeCells('B2:B2');
    ws.mergeCells('C2:C2');
    ws.mergeCells('D2:D2');
    ws.mergeCells('E2:E2');
    ws.mergeCells('F2:F2');
    ws.mergeCells('G2:G2');
    ws.mergeCells('H2:H2');
    ws.mergeCells('I2:I2');
    ws.mergeCells('J2:J2');
    ws.mergeCells('K2:K2');
    ws.mergeCells('L2:L2');

    let startIndex = 3;
    for (var i = 0; i < keys.length; i++) {
        MergeCells(startIndex, (data[keys[i]].length + startIndex - 1));
        startIndex = data[keys[i]].length + startIndex;
    }

    function MergeCells(num1, num2) {
        ws.mergeCells('B' + num1 + ':B' + num2);
        ws.mergeCells('C' + num1 + ':C' + num2);
        ws.mergeCells('D' + num1 + ':D' + num2);
        ws.mergeCells('E' + num1 + ':E' + num2);
        ws.mergeCells('F' + num1 + ':F' + num2);
        ws.mergeCells('G' + num1 + ':G' + num2);
        ws.mergeCells('H' + num1 + ':H' + num2);
        ws.mergeCells('I' + num1 + ':I' + num2);
    }

    el.InitCell(ws, 'B2', '工厂', 'FFA6A6A6');
    el.InitCell(ws, 'C2', '车间', 'FFA6A6A6');
    el.InitCell(ws, 'D2', '产线', 'FFA6A6A6');
    el.InitCell(ws, 'E2', '开始日期', 'FFA6A6A6');
    el.InitCell(ws, 'F2', '结束日期', 'FFA6A6A6');
    el.InitCell(ws, 'G2', '设备名称', 'FFA6A6A6');
    el.InitCell(ws, 'H2', '设备型号', 'FFA6A6A6');
    el.InitCell(ws, 'I2', '设备编号', 'FFA6A6A6');
    el.InitCell(ws, 'J2', '报警代码', 'FFA6A6A6');
    el.InitCell(ws, 'K2', '报警描述', 'FFA6A6A6');
    el.InitCell(ws, 'L2', '报警次数', 'FFA6A6A6');

    let startNum = 3;
    for (var i = 0; i < keys.length; i++) {
        el.InitCell(ws, 'B' + startNum, para.factory_name);
        el.InitCell(ws, 'C' + startNum, '');
        el.InitCell(ws, 'D' + startNum, '');
        el.InitCell(ws, 'E' + startNum, para.start_time);
        el.InitCell(ws, 'F' + startNum, para.end_time);

        el.InitCell(ws, 'G' + startNum, data[keys[i]][0].MAC_NAME);
        el.InitCell(ws, 'H' + startNum, data[keys[i]][0].CATEGORY);
        el.InitCell(ws, 'I' + startNum, data[keys[i]][0].MAC_NO);
        startNum = data[keys[i]].length + startNum;
    }

    let start = 3;
    for (var i = 0; i < keys.length; i++) {
        for (var j = 0; j < data[keys[i]].length; j++) {
            el.SetValue(ws, start, 10, data[keys[i]][j].ALARM_NO);
            el.SetValue(ws, start, 11, data[keys[i]][j].ALARM_MESSAGE);
            el.SetValue(ws, start, 12, data[keys[i]][j].COUNTE_ER);
            start++;
        }
    }

    workbook.xlsx.writeFile(toPath)
        .then(function() {
            fs.exists(toPath, (exist) => {
                if (exist) {
                    res.set({
                        "Content-type": "application/octet-stream",
                        "Content-Disposition": "attachment;filename=" + encodeURI("设备报警分析(按设备查看)报表.xlsx")
                    });
                    fReadStream = fs.createReadStream(toPath);
                    fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
                    fReadStream.on("end", function() {
                        res.end();
                    });
                }
            })
        });
}