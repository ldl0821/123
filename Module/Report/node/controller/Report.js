var path = require('path');
var logger = require('../../../../routes/logger.js');
var config = require('../../../../routes/config.js')
var request = require('request');
var _ = require('underscore');
var session = require('express-session');
var fs = require('fs');
var post_argu = require('../../../../routes/post_argu.js');
var template = require('../../web/js/config');

var moment = require('moment');
var el = require('../../../../routes/excel.js');
var Excel = require('exceljs');

var db = require('../../../../routes/db.js');

exports.page = function(req, res) {
    //post_argu.permission(req, res, '/reports', 'view', path.resolve(__dirname, '../../web/view/report/index'));
    if (!req.session.menu) {
        res.redirect('/');
    }
    res.render(path.resolve(__dirname, '../../web/view/report/index'), {
        menulist: req.session.menu,
        report: path.resolve('./ReportTemplate'),
        user: req.session.user,
        lang: post_argu.getLanguage(),
        config: config
    });
}

//处理事件
exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    args.push(req);
    doCallback(eval(req.params.method), args, res);
}

function doCallback(fn, args, res) {
    fn.apply(args[1], args);
}

function GetRepostName(res, method, args) {

    var body = {};
    body.Data = [];
    // fs.readdirSync('./ReportTemplate').forEach(function(file) {
    //     data.push(file.split('.')[0]);
    // });
    for (let i = 0; i < template.template.length; i++) {
        body.Data.push(template.template[i].Report_name);
        body.par = template.template;
    }
    body.Status = 0;
    body.Message = "上传成功！";
    res.json(body);

}

function GetRepostType(res, method, args) {
    post_argu.post_argu(res, method);
}

exports.GetRepost = function(req, res) {
    var templateName = path.resolve('ReportTemplate/' + req.query.filename);
    var para = {
        filename: req.query.filename,
        filetype: req.query.filetype,
        parameters: req.query.parameters,
        templateName: templateName
    }


    // request(config.report + '/GetRepost?filename='+para.filename+'&filetype='+para.filetype+'&parameters='+para.parameters+'&templateName='+templateName).pipe('para.filename.xlsx');
    request.post({ url: post_argu.getpath(__filename, 'GetRepost'), form: para }, function(error, response, body) {
            if (error) {
                throw error;
            } else {
                // var rs = fs.createReadStream(body);
                // res.pipe(rs);
                // request(…..).pipe(fs.createWriteStream('xxx.xls'))
                res.pipe(body);
            }
        })
        // request.post({ url: config.report + '/GetRepost', form: para}).pipe().on('error',function(err){
        //     console.log(err);
        // });

}

//新版导出报表
exports.downExcel = function(req, res) {
    var report_name = req.query.report_name;
    // db.sql('exec ')
    request.post({
        url: global.Webservice + '/report/Excel.asmx/OpenExcel',
        form: {

        }
    }, function(err, response, body) {
        if (err) {
            res.json({
                Status: -9999,
                Message: err.message
            })
        } else {
            try {
                var result = JSON.parse(body.d);
                var currFilePath = path.resolve('./tempfiles', report_name);
                fs.exists(currFilePath, function(exist) {
                    if (exist) {
                        res.set({
                            "Content-type": "application/octet-stream",
                            "Content-Disposition": "attachment;filename=" + encodeURI(report_name)
                        });
                        fReadStream = fs.createReadStream(currFilePath);
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
            } catch (e) {
                console.log(e);
                res.json({
                    Data: null,
                    Status: -9999,
                    Message: error
                })
            }
        }
    })
}

//导出 htc:20180806
exports.outExcel = (req, res) => {
    let para = JSON.parse(req.query.keyValue);
    var tempData = _.where(template.template, { "Report_name": para.exportName })
    var method = global.Webservice + tempData[0].url;
    var index = _.indexOf(template.template, tempData[0]);
    console.log(method);

    if (index == 0) {
        outExcelActicationDay(method, para, res);
    }
    // else if (index == 1) {
    //     outExcelActicationGroup(method, para, res);
    // } 
    else if (index == 1) {
        outExcelAlarmMac(method, para, res);
    } else if (index == 2) {
        outExcelParamsMac(method, para, res);
    } else if (index == 3) {
        outExcelYieldMac(method, para, res);
    }
}

//设备日稼动率报表导出
async function outExcelActicationDay(method, para, res) {
    var toPath = path.resolve('./tempfiles/设备稼动率报表.xlsx');
    let data = [];
    // var paras = {
    //     MARS: para.MARS,
    //     BEGIN_DATE: para.BEGIN_DATE,
    //     END_DATE: para.END_DATE,
    //     IS_CROSS_DAY: para.isAcrossDay,
    //     USER_ID: res.req.session.user.UserId
    // };
    var paras = {
        MARS: para.MARS,
        BEGIN_DATE: para.BEGIN_DATE,
        END_DATE: para.END_DATE,
        Flag: para.Flag,
        user_id: res.req.session.user.UserId,
        Show:2
    };
    data = await post_argu.post_argu(method, paras);

    var ShiftArr = _.groupBy(data.Data.LI, 'SHIFT_NAME'); //按班次分SHIFT
    var colunms = (new Date(para.END_DATE).getTime() - new Date(para.BEGIN_DATE).getTime()) / (1000 * 3600 * 24); //按查询日期个数生成列

    var workbook = new Excel.Workbook();
    if (data.Data.LI.length == 0) { //查询的稼动率数据为空
        var ws = workbook.addWorksheet("设备稼动率报表");
        ws.mergeCells('B2:B2');
        ws.mergeCells('C2:C2');
        ws.mergeCells('D2:D2');
        ws.mergeCells('E2:E2');
        ws.mergeCells('F2:F2');
        ws.mergeCells('G2:G2');
        // ws.mergeCells('B3:F3');

        el.InitCell(ws, 'B2', '设备厂家', 'FFA6A6A6');
        el.InitCell(ws, 'C2', '设备机号', 'FFA6A6A6');
        el.InitCell(ws, 'D2', '设备名称', 'FFA6A6A6');
        el.InitCell(ws, 'E2', '设备型号', 'FFA6A6A6');
        el.InitCell(ws, 'F2', '设备编号', 'FFA6A6A6');
        el.InitCell(ws, 'G2', '日期', 'FFA6A6A6');

        el.SetValue(ws, 3, 2, "暂无数据");
    } else {
        for (var val in ShiftArr) {
            if (val == null || val == "null") {
                var ws = workbook.addWorksheet("设备稼动率报表");
            } else {
                var ws = workbook.addWorksheet("设备稼动率报表" + "-" + val);
            }
            data = _.groupBy(ShiftArr[val], 'MAC_NO');

            var startRow = 3;
            var perMacRow = 11;
            ws.mergeCells('B2:B2');
            ws.mergeCells('C2:C2');
            ws.mergeCells('D2:D2');
            ws.mergeCells('E2:E2');
            ws.mergeCells('F2:F2');
            ws.mergeCells('G2:G2');
            for (let val in data) {
                ws.mergeCells('B' + startRow + ':B' + (startRow + perMacRow - 1));
                ws.mergeCells('C' + startRow + ':C' + (startRow + perMacRow - 1));
                ws.mergeCells('D' + startRow + ':D' + (startRow + perMacRow - 1));
                ws.mergeCells('E' + startRow + ':E' + (startRow + perMacRow - 1));
                ws.mergeCells('F' + startRow + ':F' + (startRow + perMacRow - 1));
                startRow = startRow + perMacRow;
            }

            el.InitCell(ws, 'B2', '设备厂家', 'FFA6A6A6');
            el.InitCell(ws, 'C2', '设备机号', 'FFA6A6A6');
            el.InitCell(ws, 'D2', '设备名称', 'FFA6A6A6');
            el.InitCell(ws, 'E2', '设备型号', 'FFA6A6A6');
            el.InitCell(ws, 'F2', '设备编号', 'FFA6A6A6');
            el.InitCell(ws, 'G2', '日期', 'FFA6A6A6');
            startRow = 3;
            for (let val in data) {
                el.InitCell(ws, 'G' + (startRow + 0), '总开机时间(h)', 'FF948A54');
                el.InitCell(ws, 'G' + (startRow + 1), '运行(h)', 'FF92D050');
                el.InitCell(ws, 'G' + (startRow + 2), '运行(%)', 'FF92D050');
                el.InitCell(ws, 'G' + (startRow + 3), '空闲(h)', 'FFFFC000');
                el.InitCell(ws, 'G' + (startRow + 4), '空闲(%)', 'FFFFC000');
                el.InitCell(ws, 'G' + (startRow + 5), '调试(h)', 'FF0070C0');
                el.InitCell(ws, 'G' + (startRow + 6), '调试(%)', 'FF0070C0');
                el.InitCell(ws, 'G' + (startRow + 7), '停机(h)', 'FFFF0000');
                el.InitCell(ws, 'G' + (startRow + 8), '停机(%)', 'FFFF0000');
                el.InitCell(ws, 'G' + (startRow + 9), '关机(h)', 'FF808080');
                el.InitCell(ws, 'G' + (startRow + 10), '关机(%)', 'FF808080');
                startRow = startRow + perMacRow;
            }

            for (var a = 0; a < colunms; a++) {
                el.SetValue(ws, 2, 8 + a, getDate(para.BEGIN_DATE, a));

                var tempStartRow = 3;
                for (let val in data) {
                    for (var i = 0; i < data[val].length; i++) {
                        if (getDate(para.BEGIN_DATE, a).toString() == data[val][i].DAY_TYPE.split("T")[0].toString()) {
                            // el.SetValue(ws, 2, 7 + i, data[val][i].DAY_TYPE.split("T")[0]);
                            el.SetValue(ws, tempStartRow, 2, data[val][i].GP_NAME);
                            el.SetValue(ws, tempStartRow, 3, data[val][i].CODE_NO);
                            el.SetValue(ws, tempStartRow, 4, data[val][i].CATEGORY);
                            el.SetValue(ws, tempStartRow, 5, data[val][i].MAC_NAME);
                            el.SetValue(ws, tempStartRow, 6, data[val][i].MAC_NO);
                            el.SetValue(ws, (tempStartRow + 0), 8 + a, secondToHour(data[val][i].OPEN_MAC_TIME));
                            el.SetValue(ws, (tempStartRow + 1), 8 + a, secondToHour(data[val][i].RUN));
                            el.SetValue(ws, (tempStartRow + 2), 8 + a, changeVal(data[val][i].RUN, data[val][i].SUM_DURATION));
                            el.SetValue(ws, (tempStartRow + 3), 8 + a, secondToHour(data[val][i].FREE));
                            el.SetValue(ws, (tempStartRow + 4), 8 + a, changeVal(data[val][i].FREE, data[val][i].SUM_DURATION));
                            el.SetValue(ws, (tempStartRow + 5), 8 + a, secondToHour(data[val][i].DEBUG));
                            el.SetValue(ws, (tempStartRow + 6), 8 + a, changeVal(data[val][i].DEBUG, data[val][i].SUM_DURATION));
                            el.SetValue(ws, (tempStartRow + 7), 8 + a, secondToHour(data[val][i].STOP));
                            el.SetValue(ws, (tempStartRow + 8), 8 + a, changeVal(data[val][i].STOP, data[val][i].SUM_DURATION));
                            el.SetValue(ws, (tempStartRow + 9), 8 + a, secondToHour(data[val][i].DOWN));
                            el.SetValue(ws, (tempStartRow + 10), 8 + a, changeVal(data[val][i].DOWN, data[val][i].SUM_DURATION));
                            break;
                        } else {
                            // el.SetValue(ws, 2, 7 + i, data[val][i].DAY_TYPE.split("T")[0]);
                            el.SetValue(ws, tempStartRow, 2, data[val][i].GP_NAME);
                            el.SetValue(ws, tempStartRow, 3, data[val][i].CODE_NO);
                            el.SetValue(ws, tempStartRow, 4, data[val][i].CATEGORY);
                            el.SetValue(ws, tempStartRow, 5, data[val][i].MAC_NAME);
                            el.SetValue(ws, tempStartRow, 6, data[val][i].MAC_NO);
                            el.SetValue(ws, (tempStartRow + 0), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 1), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 2), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 3), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 4), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 5), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 6), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 7), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 8), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 9), 8 + a, "");
                            el.SetValue(ws, (tempStartRow + 10), 8 + a, "");
                        }
                    }
                    tempStartRow = tempStartRow + perMacRow;
                }
            }
        }
    }

    workbook.xlsx.writeFile(toPath)
        .then(function() {
            fs.exists(toPath, (exist) => {
                if (exist) {
                    res.set({
                        "Content-type": "application/octet-stream",
                        "Content-Disposition": "attachment;filename=" + encodeURI("设备稼动率报表.xlsx")
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

function getDate(dateVal, dayNum) {
    var now = new Date(dateVal);
    now = new Date(now.getTime() + 86400000 * dayNum);
    var yyyy = now.getFullYear(),
        mm = (now.getMonth() + 1).toString(),
        dd = now.getDate().toString();
    if (mm.length == 1) { mm = '0' + mm; }
    if (dd.length == 1) { dd = '0' + dd; }
    return (yyyy + '-' + mm + '-' + dd);
}

function changeVal(fenzi, fenmu) {
    return fenzi == null ? "0.00%" : ((fenzi / fenmu) * 100).toFixed(2) + "%";
}
function secondToHour(val){
    return val==null?"0.00":(parseFloat(val)/3600).toFixed(2);
}

//设备组稼动率报表导出
async function outExcelActicationGroup(method, para, res) {
    var toPath = path.resolve('./tempfiles/设备稼动率(按组导出).xlsx');
    let data = [];
    var paras = {
        MARS: para.MARS,
        BEGIN_DATE: para.BEGIN_DATE,
        END_DATE: para.END_DATE,
        IS_CROSS_DAY: para.isAcrossDay,
    };
    data = await post_argu.post_argu(method, paras);
    data = _.groupBy(data.Data.LI, 'MAC_NO');

    var workbook = new Excel.Workbook();
    var ws = workbook.addWorksheet("设备稼动率(按组导出)");
    ws.mergeCells('B2:B2');

    el.InitCell(ws, 'B2', '设备', 'FFA6A6A6');
    el.InitCell(ws, 'B3', '总开机时间(h)', 'FF948A54');
    el.InitCell(ws, 'B4', '运行', 'FF92D050');
    el.InitCell(ws, 'B5', '空闲', 'FFFFC000');
    el.InitCell(ws, 'B6', '调试', 'FF0070C0');
    el.InitCell(ws, 'B7', '停机', 'FFFF0000');
    el.InitCell(ws, 'B8', '关机', 'FF808080');

    var n = 0;
    var allcount = 0;
    for (let val in data) {
        el.SetValue(ws, 2, 3 + n, data[val][0].CATEGORY + "/" + data[val][0].MAC_NAME + "/" + data[val][0].MAC_NO);
        el.SetValue(ws, 3, 3 + n, (parseFloat(cycleAdd(data[val], "OPEN_MAC_TIME")) / 3600).toFixed(2) + "h");
        el.SetValue(ws, 4, 3 + n, (parseFloat(cycleAdd(data[val], "RUN") / cycleAdd(data[val], "SUM_DURATION")) * 100).toFixed(2) + "%");
        el.SetValue(ws, 5, 3 + n, (parseFloat(cycleAdd(data[val], "FREE") / cycleAdd(data[val], "SUM_DURATION")) * 100).toFixed(2) + "%");
        el.SetValue(ws, 6, 3 + n, (parseFloat(cycleAdd(data[val], "DEBUG") / cycleAdd(data[val], "SUM_DURATION")) * 100).toFixed(2) + "%");
        el.SetValue(ws, 7, 3 + n, (parseFloat(cycleAdd(data[val], "STOP") / cycleAdd(data[val], "SUM_DURATION")) * 100).toFixed(2) + "%");
        el.SetValue(ws, 8, 3 + n, (parseFloat(cycleAdd(data[val], "DOWN") / cycleAdd(data[val], "SUM_DURATION")) * 100).toFixed(2) + "%");
        n++;
        allcount = allcount + data[val].length;
    }
    console.log(allcount);

    function cycleAdd(dataItems, val) {
        var num = 0;
        for (var i = 0; i < dataItems.length; i++) {
            if (val == "OPEN_MAC_TIME")
                num = num + dataItems[i].OPEN_MAC_TIME;
            if (val == "RUN")
                num = num + dataItems[i].RUN;
            if (val == "FREE")
                num = num + dataItems[i].FREE;
            if (val == "DEBUG")
                num = num + dataItems[i].DEBUG;
            if (val == "STOP")
                num = num + dataItems[i].STOP;
            if (val == "DOWN")
                num = num + dataItems[i].DOWN;
            if (val == "SUM_DURATION")
                num = num + dataItems[i].SUM_DURATION;
        }
        return num;
    }

    workbook.xlsx.writeFile(toPath)
        .then(function() {
            fs.exists(toPath, (exist) => {
                if (exist) {
                    res.set({
                        "Content-type": "application/octet-stream",
                        "Content-Disposition": "attachment;filename=" + encodeURI("设备稼动率(按组导出).xlsx")
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

//设备报警报表导出
async function outExcelAlarmMac(method, para, res) {
    var toPath = path.resolve('./tempfiles/设备报警分析(按设备查看)报表.xlsx');
    var queryData = {
        mars: para.MARS,
        dt_begin: para.BEGIN_DATE,
        dt_end: para.END_DATE,
    }
    let result = await post_argu.post_argu(method, queryData);

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

    el.InitCell(ws, 'B2', '设备厂家', 'FFA6A6A6');
    el.InitCell(ws, 'C2', '设备机号', 'FFA6A6A6');
    el.InitCell(ws, 'D2', '设备名称', 'FFA6A6A6');
    el.InitCell(ws, 'E2', '设备型号', 'FFA6A6A6');
    el.InitCell(ws, 'F2', '设备编号', 'FFA6A6A6');
    el.InitCell(ws, 'G2', '开始日期', 'FFA6A6A6');
    el.InitCell(ws, 'H2', '结束日期', 'FFA6A6A6');
    el.InitCell(ws, 'I2', '报警代码', 'FFA6A6A6');
    el.InitCell(ws, 'J2', '报警描述', 'FFA6A6A6');
    el.InitCell(ws, 'K2', '报警次数', 'FFA6A6A6');

    if (result.Data.length == 0) { //查询时报警数据为空
        ws.mergeCells('B3:L3');
        el.SetValue(ws, 3, 2, "暂无数据");
    } else {
        let sortResult = _.sortBy(result.Data, function(item) { return parseInt(item.ALARM_NO); }); //排序，按报警号从小到大
        let data = _.groupBy(sortResult, 'MAC_NBR'); //分组，按MAC_NBR
        let keys = _.keys(data); //数组，获取上面分组的key值

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
        }

        let startNum = 3;
        for (var i = 0; i < keys.length; i++) {
            el.InitCell(ws, 'B' + startNum, data[keys[i]][0].GP_NAME);
            el.InitCell(ws, 'C' + startNum, data[keys[i]][0].CODE_NO);
            el.InitCell(ws, 'D' + startNum, data[keys[i]][0].CATEGORY);
            el.InitCell(ws, 'E' + startNum, data[keys[i]][0].MAC_NAME);
            el.InitCell(ws, 'F' + startNum, data[keys[i]][0].MAC_NO);

            el.InitCell(ws, 'G' + startNum, para.BEGIN_DATE);
            el.InitCell(ws, 'H' + startNum, para.END_DATE);
            startNum = data[keys[i]].length + startNum;
        }

        let start = 3;
        for (var i = 0; i < keys.length; i++) {
            for (var j = 0; j < data[keys[i]].length; j++) {
                el.SetValue(ws, start, 9, data[keys[i]][j].ALARM_NO);
                el.SetValue(ws, start, 10, data[keys[i]][j].ALARM_MESSAGE);
                el.SetValue(ws, start, 11, data[keys[i]][j].COUNTE_ER);
                start++;
            }
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

//设备参数报表导出
async function outExcelParamsMac(method, para, res) {
    var toPath = path.resolve('./tempfiles/设备参数报表.xlsx');
    let data = [];
    var paras = {
        // macNo: parseInt(para.MARS),
        macNo: _.map(para.MARS.split(","), function(item) { return parseInt(item); }),
        BeginDate: +moment(para.BEGIN_DATE).format('X'),
        EndDate: +moment(para.END_DATE).format('X'),
        SignList: ["STD::SpindleSpeed", "STD::FeedSpeed", "STD::SpindleOverride", "STD::FeedOverride"],
    };
    data = await post_argu.post_argu(method, paras);

    var workbook = new Excel.Workbook();
    for (var a = 0; a < data.Data.length; a++) {
        var ws = workbook.addWorksheet("设备参数报表(" + data.Data[a].Mac_Name + " " + data.Data[a].Mac_No + ")");
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

        el.InitCell(ws, 'B2', '设备厂家', 'FFA6A6A6');
        el.InitCell(ws, 'C2', '设备机号', 'FFA6A6A6');
        el.InitCell(ws, 'D2', '设备名称', 'FFA6A6A6');
        el.InitCell(ws, 'E2', '设备型号', 'FFA6A6A6');
        el.InitCell(ws, 'F2', '设备编号', 'FFA6A6A6');
        el.InitCell(ws, 'G2', '运行时间', 'FFA6A6A6');
        el.InitCell(ws, 'H2', '主轴转速(单位)', 'FFA6A6A6');
        el.InitCell(ws, 'I2', '进给转速(单位)', 'FFA6A6A6');
        el.InitCell(ws, 'J2', '主轴倍率(单位)', 'FFA6A6A6');
        el.InitCell(ws, 'K2', '进给倍率(单位)', 'FFA6A6A6');

        if (data.Data[a].Data == null || data.Data[a].Data.length == 0) { //查询参数数据为空
            el.SetValue(ws, 3, 2, "暂无数据");
            el.SetValue(ws, 3, 3, "暂无数据");
            el.SetValue(ws, 3, 4, "暂无数据");
            el.SetValue(ws, 3, 5, "暂无数据");
            el.SetValue(ws, 3, 6, "暂无数据");
            el.SetValue(ws, 3, 7, "暂无数据");
            el.SetValue(ws, 3, 8, "暂无数据");
            el.SetValue(ws, 3, 9, "暂无数据");
            el.SetValue(ws, 3, 10, "暂无数据");
            el.SetValue(ws, 3, 11, "暂无数据");
        } else {
            for (let i = 0; i < data.Data[a].Data.length; i++) {
                el.SetValue(ws, 3 + i, 2, "");
                el.SetValue(ws, 3 + i, 3, "");
                el.SetValue(ws, 3 + i, 4, data.Data[a].Category);
                el.SetValue(ws, 3 + i, 5, data.Data[a].Mac_Name);
                el.SetValue(ws, 3 + i, 6, data.Data[a].Mac_No);
                el.SetValue(ws, 3 + i, 7, moment(data.Data[a].Data[i][0]).format("YYYY-MM-DD HH:mm:ss"));
                el.SetValue(ws, 3 + i, 8, data.Data[a].Data[i][1]);
                el.SetValue(ws, 3 + i, 9, data.Data[a].Data[i][2]);
                el.SetValue(ws, 3 + i, 10, data.Data[a].Data[i][3]);
                el.SetValue(ws, 3 + i, 11, data.Data[a].Data[i][4]);
            }
        }

    }

    workbook.xlsx.writeFile(toPath)
        .then(function() {
            fs.exists(toPath, (exist) => {
                if (exist) {
                    res.set({
                        "Content-type": "application/octet-stream",
                        "Content-Disposition": "attachment;filename=" + encodeURI("设备参数报表.xlsx")
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

//设备产量报表导出
async function outExcelYieldMac(method, para, res) {
    await db.execute('GetYieldSum', para.BEGIN_DATE, para.END_DATE, para.isAcrossDay, para.MARS, function(result) {
        var toPath = path.resolve('./tempfiles/设备产能计数报表.xlsx');
        let datas = [];

        datas = result;

        var workbook = new Excel.Workbook();
        if (datas.length == 0) { //查询数据为空
            var ws = workbook.addWorksheet("设备产能计数报表");
            ws.mergeCells('B2:B3');
            ws.mergeCells('C2:C3');
            ws.mergeCells('D2:D3');
            ws.mergeCells('E2:E3');
            ws.mergeCells('F2:F3');
            ws.mergeCells('G2:G3');
            ws.mergeCells('H2:H3');
            ws.mergeCells('B4:H4');

            el.InitCell(ws, 'B2', '设备厂家', 'FFA6A6A6');
            el.InitCell(ws, 'C2', '设备机号', 'FFA6A6A6');
            el.InitCell(ws, 'D2', '设备名称', 'FFA6A6A6');
            el.InitCell(ws, 'E2', '设备型号', 'FFA6A6A6');
            el.InitCell(ws, 'F2', '设备编号', 'FFA6A6A6');
            el.InitCell(ws, 'G2', '程序号', 'FFA6A6A6');
            el.InitCell(ws, 'H2', '项目', 'FFA6A6A6');
            el.SetValue(ws, 4, 2, "暂无数据");
        } else {
            datas = _.groupBy(datas, "PROD_DATE");

            for (var item in datas) {
                var sheetInfo = {
                    dateTime: moment(datas[item][0].PROD_DATE).format("MM-DD").replace("-", "月") + "日"
                }

                var ws = workbook.addWorksheet("设备产能计数报表(" + sheetInfo.dateTime + ")");

                //数据格式处理
                var dataMac = _.groupBy(datas[item], "MAC_NO");
                var data = [];
                for (var macItem in dataMac) {
                    var programs = [];
                    var sumOpenTime = 0;

                    var temp = _.groupBy(dataMac[macItem], "PROGRAME_NAME");
                    for (var t in temp) {
                        var sumProdCount = sumAvgTime = sumRunTime = 0;
                        for (var j = 0; j < temp[t].length; j++) {
                            sumProdCount = sumProdCount + temp[t][j].PROD_COUNT;
                            sumAvgTime = sumAvgTime + temp[t][j].AVG_RUNTIME;
                            sumRunTime = sumRunTime + temp[t][j].RUN_TIME;
                        }

                        programs.push({
                            programNo: t,
                            macNumYidle: sumProdCount,
                            avgWorkTime: sumAvgTime,
                            sumRunTime: sumRunTime
                        });
                        sumOpenTime = sumOpenTime + sumRunTime;
                    }

                    data.push({
                        factory: dataMac[macItem][0].GP_NAME,
                        codeNo: dataMac[macItem][0].CODE_NO,
                        macName: dataMac[macItem][0].CATEGORY,
                        macType: dataMac[macItem][0].MAC_NAME,
                        macNo: dataMac[macItem][0].MAC_NO,
                        sumOpenTime: sumOpenTime,
                        programs: programs
                    });
                }
                console.log(data);

                ws.mergeCells('B2:B3');
                ws.mergeCells('C2:C3');
                ws.mergeCells('D2:D3');
                ws.mergeCells('E2:E3');
                ws.mergeCells('F2:F3');
                ws.mergeCells('G2:G3');
                ws.mergeCells('H2:H3');
                ws.mergeCells('I2:I3');

                var rowNum = startRow = 4;
                var preProRows = 3;
                for (var i = 0; i < data.length; i++) {
                    ws.mergeCells('B' + startRow + ':B' + (startRow + data[i].programs.length * preProRows));
                    ws.mergeCells('C' + startRow + ':C' + (startRow + data[i].programs.length * preProRows));
                    ws.mergeCells('D' + startRow + ':D' + (startRow + data[i].programs.length * preProRows));
                    ws.mergeCells('E' + startRow + ':E' + (startRow + data[i].programs.length * preProRows));
                    ws.mergeCells('F' + startRow + ':F' + (startRow + data[i].programs.length * preProRows));
                    for (var j = 0; j < data[i].programs.length; j++) {
                        ws.mergeCells('G' + rowNum + ':G' + (rowNum + 2));
                        rowNum = rowNum + preProRows;
                    };
                    rowNum++;
                    ws.mergeCells('G' + (startRow + data[i].programs.length * preProRows) + ':H' + (startRow + data[i].programs.length * preProRows));
                    startRow = startRow + data[i].programs.length * preProRows + 1;
                };

                el.InitCell(ws, 'B2', '设备厂家', 'FFA6A6A6');
                el.InitCell(ws, 'C2', '设备机号', 'FFA6A6A6');
                el.InitCell(ws, 'D2', '设备名称', 'FFA6A6A6');
                el.InitCell(ws, 'E2', '设备型号', 'FFA6A6A6');
                el.InitCell(ws, 'F2', '设备出厂编号', 'FFA6A6A6');
                el.InitCell(ws, 'G2', '程序号', 'FFA6A6A6');
                el.InitCell(ws, 'H2', '项目', 'FFA6A6A6');
                el.InitCell(ws, 'I2', sheetInfo.dateTime, '');

                var startNum = 3;
                var rowNum = objectNum = valueNum = 4;
                for (var i = 0; i < data.length; i++) {
                    el.SetValue(ws, startNum + 1, 2, data[i].factory);
                    el.SetValue(ws, startNum + 1, 3, data[i].codeNo);
                    el.SetValue(ws, startNum + 1, 4, data[i].macName);
                    el.SetValue(ws, startNum + 1, 5, data[i].macType);
                    el.SetValue(ws, startNum + 1, 6, data[i].macNo);

                    for (var j = 0; j < data[i].programs.length; j++) {
                        el.SetValue(ws, rowNum, 7, data[i].programs[j].programNo);
                        rowNum = rowNum + preProRows;
                    };
                    el.SetValue(ws, rowNum, 7, "总开机时间(h)");
                    rowNum++;

                    //设置项目值
                    setObjects(data[i].programs);

                    startNum = startNum + data[i].programs.length * preProRows + 1;
                    //设置产能计数值
                    setValues(data[i].programs);

                    el.SetValue(ws, startNum, 9, (data[i].sumOpenTime / 3600).toFixed(2));
                };

                function setObjects(data) {
                    for (var i = 0; i < data.length; i++) {
                        el.SetValue(ws, objectNum, 8, "设备计数产出(个)");
                        el.SetValue(ws, objectNum + 1, 8, "平均加工用时(s)");
                        el.SetValue(ws, objectNum + 2, 8, "总运行时间(min)");
                        objectNum = objectNum + preProRows;
                    };
                    objectNum++;
                };

                function setValues(data) {
                    for (var i = 0; i < data.length; i++) {
                        el.SetValue(ws, valueNum, 9, data[i].macNumYidle);
                        el.SetValue(ws, valueNum + 1, 9, data[i].avgWorkTime);
                        el.SetValue(ws, valueNum + 2, 9, (data[i].sumRunTime / 60).toFixed(2));
                        valueNum = valueNum + preProRows;
                    }
                    valueNum++;
                }
            }
        }

        workbook.xlsx.writeFile(toPath).then(function() {
            fs.exists(toPath, (exist) => {
                if (exist) {
                    res.set({
                        "Content-type": "application/octet-stream",
                        "Content-Disposition": "attachment;filename=" + encodeURI("设备产能计数报表.xlsx")
                    });
                    fReadStream = fs.createReadStream(toPath);
                    fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
                    fReadStream.on("end", function() {
                        res.end();
                    });
                };
            });
        });
    })
}