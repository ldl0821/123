var Excel = require('exceljs');
var workbook = new Excel.Workbook();



//初始化
exports.InitCell = (ws, cell, value, color) => {
    ws.getCell(cell).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    ws.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
    };
    // ws.getCell(cell).font = {//设置字体样式
    //     bold: true
    // }
    ws.getCell(cell).value = value;
}

exports.SetValue = (ws, row, col, value) => {
    ws.getCell(row, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };
    ws.getCell(row, col).value = value == null ? 0 : value;
}