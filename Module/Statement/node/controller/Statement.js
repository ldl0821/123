var path = require('path');
var http = require('http');
var request = require('request');
var fs = require('fs');
var post_argu = require('../../../../routes/post_argu.js');
var config = require('../../../../routes/config.js');
var db = require('../../../../routes/db.js');
var el = require('../../../../routes/excel.js');
var Excel = require('exceljs');
var _ = require('underscore');


exports.Statement = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/statements', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/Statement/index'), {
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

exports.GetNewNULLActivation = async(req, res) => {
    let para = JSON.parse(req.body.key);
    let data = [];
    data.push((await post_argu.post_argu(global.Webservice + '/WebReport/PA_ACTIVACTION.asmx/GetNewNULLActivation', para)).Data);
    //let result = await post_argu.post_argu(method, req.body);
    res.json({ Data: data, Status: 0, Message: '操作成功!' });
    res.end();
    // post_argu.post_argu(res, method, req.body);
}


exports.GetClasses = function(req, res) {
    let sql = `select * from dbo.USER_INPUT_SHIFT_DATA_BY_MARS('${req.body.BEGIN_DATE}','${req.body.END_DATE}','${req.body.MARS}')  where SHIFT_DAY>='${req.body.BEGIN_DATE}' and SHIFT_DAY<='${req.body.END_DATE}'`;
    db.sql(sql, (result) => {
        res.json({
            Status: 0,
            Data: result.recordset,
            Message: '操作成功'
        });
    });
}

exports.outExcel = async(req, res) => {
    var toPath = path.resolve('./tempfiles/设备稼动率(按日期导出).xlsx');
    let method = global.Webservice + '/WebReport/PA_ACTIVACTION.asmx/GetArrayList';
    let para = JSON.parse(req.query.keyValue);
    let data = [];
    for (var k of para) {
        data = _.union(data, (await post_argu.post_argu(method, k)).Data);
    }
    data = _.groupBy(data, 'CATEGORY');
    var workbook = new Excel.Workbook();
    for (let val in data) {
        var ws = workbook.addWorksheet(val);
        ws.mergeCells('B2:B3');
        ws.mergeCells('C2:C3');
        ws.mergeCells('D2:D3');
        ws.mergeCells('E2:E3');
        ws.mergeCells('F2:F3');
        ws.mergeCells('B4:B10');
        ws.mergeCells('C4:C10');
        ws.mergeCells('D4:D10');
        ws.mergeCells('E4:E10');
        ws.mergeCells('F4:F10');

        el.InitCell(ws, 'B2', '工厂', 'FFA6A6A6');
        el.InitCell(ws, 'C2', '车间', 'FFA6A6A6');
        el.InitCell(ws, 'D2', '产线', 'FFA6A6A6');
        el.InitCell(ws, 'E2', '日期', 'FFA6A6A6');
        el.InitCell(ws, 'F2', '程序号', 'FFA6A6A6');
        el.InitCell(ws, 'G2', '设备', 'FFA6A6A6');
        el.InitCell(ws, 'G3', '班次', 'FFA6A6A6');
        el.InitCell(ws, 'G3', '班次', 'FFA6A6A6');
        el.InitCell(ws, 'G4', '总开机时间(h)', 'FF948A54');
        el.InitCell(ws, 'G5', '标准稼动率', 'FFC0504D');
        el.InitCell(ws, 'G6', '运行', 'FF92D050');
        el.InitCell(ws, 'G7', '空闲', 'FFFFC000');
        el.InitCell(ws, 'G8', '调试', 'FF0070C0');
        el.InitCell(ws, 'G9', '停机', 'FFFF0000');
        el.InitCell(ws, 'G10', '关机', 'FF808080');
        for (let i = 0; i < data[val].length; i++) {
            el.SetValue(ws, 4, 2, data[val][i].GP_NAME);
            el.SetValue(ws, 4, 3, data[val][i].CATEGORY);
            el.SetValue(ws, 4, 4, "");
            el.SetValue(ws, 4, 5, data[val][i].DAY_TYPE);
            el.SetValue(ws, 4, 6, data[val][i].PROG_NAME);
            el.SetValue(ws, 2, 8 + i, data[val][i].MAC_NO);
            el.SetValue(ws, 3, 8 + i, data[val][i].SHIFT_NAME == null ? "" : data[val][i].SHIFT_NAME);
            el.SetValue(ws, 4, 8 + i, data[val][i].SUM_DURATION);
            el.SetValue(ws, 5, 8 + i, data[val][i].OPEN_MAC_TIME);
            el.SetValue(ws, 6, 8 + i, data[val][i].RUN);
            el.SetValue(ws, 7, 8 + i, data[val][i].FREE);
            el.SetValue(ws, 8, 8 + i, data[val][i].DEBUG);
            el.SetValue(ws, 9, 8 + i, data[val][i].STOP);
            el.SetValue(ws, 10, 8 + i, data[val][i].DOWN);
        }
    }
    workbook.xlsx.writeFile(toPath)
        .then(function() {
            fs.exists(toPath, (exist) => {
                if (exist) {
                    res.set({
                        "Content-type": "application/octet-stream",
                        "Content-Disposition": "attachment;filename=" + encodeURI("设备稼动率(按日期导出).xlsx")
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