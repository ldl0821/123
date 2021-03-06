var diagnosisctrl = require('../controller/Diagnosis.js');

module.exports = function(app) {
    //加载设备管理页面
    app.get('/diagnosis', diagnosisctrl.diagnosispage);
    app.get('/diagnosisdetail', diagnosisctrl.diagnosisdetailpage);
    app.post('/diagnosis/:method', diagnosisctrl.fun);

    app.post('file/:filename', function(req, res, next) {
        var fileName = req.params.fileName;
        var filePath = path.join(__dirname, fileName);
        var stats = fs.statSync(filePath);
        if (stats.isFile()) {
            res.set({
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename=' + fileName,
                'Content-Length': stats.size
            });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.end(404);
        }
    });

    app.post('/diagnosis/r/GetMachinePara', diagnosisctrl.GetMachinePara);

    app.post('/diagnosis/r/getallpara', diagnosisctrl.GetAllMachinePara);

    app.post('/diagnosis/r/GetGroupPara', diagnosisctrl.GetGroupPara);

    app.post('/diagnosis/r/getAllMac', diagnosisctrl.getAllMac);

    app.get('/diagnosis/r/mac', diagnosisctrl.mac);

    app.get('/diagnosis/r/NewCollection', diagnosisctrl.NewCollection);

    app.post('/diagnosis/r/pinganCollection', diagnosisctrl.pinganCollection);

    app.post('/diagnosis/r/DataCenter', diagnosisctrl.DataCenter);

}