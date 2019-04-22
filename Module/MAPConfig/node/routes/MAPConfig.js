var MAPConfig = require('../controller/MAPConfig.js');
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');


module.exports = function(app) {
    app.get('/MAPConfigs', MAPConfig.MAPConfig);
    app.post('/MAPConfig/upload/addImg', function(req, res) {
        var form = new multiparty.Form();
        form.encoding = 'utf-8';
        form.uploadDir = './Module/MAPConfig/web/image';
        form.keepExtensions = true; //保留后缀
        form.type = true;
        form.parse(req, function(err, fields, files) {
            if (err) {
                res.send(err);
                return;
            } else {
                var dstPath = './Module/MAPConfig/web/image/' + files['files[]'][0].originalFilename;
                fs.renameSync(files['files[]'][0].path, dstPath); //重命名
                res.send({
                    Status: 0,
                    Message: "操作成功！",
                    Data: files['files[]'][0].originalFilename
                });
            }
        })
    });
    app.post('/MAPConfig/upload/addBackgroundImg', function(req, res) {
        var form = new multiparty.Form();
        form.encoding = 'utf-8';
        form.uploadDir = './Module/MAPConfig/web/background';
        form.keepExtensions = true; //保留后缀
        form.type = true;
        form.parse(req, function(err, fields, files) {
            if (err) {
                res.send(err);
                return;
            } else {
                var dstPath = './Module/MAPConfig/web/background/' + files['files[]'][0].originalFilename;
                fs.renameSync(files['files[]'][0].path, dstPath); //重命名
                res.send({
                    Status: 0,
                    Message: "操作成功！",
                    Data: files['files[]'][0].originalFilename
                });
            }
        })
    });
    app.post('/MAPConfig/getImg', function(req, res) {
        var root = './Module';
        var imagesDir = '/MAPConfig/web/image';
        var body = {},
            data = [];
        fs.readdirSync(root + imagesDir).forEach(function(file) {
            if (fs.lstatSync(root + imagesDir + '/' + file)) {
                var dirname = file;
                // var img = {};
                // img.FileDesc = "file";
                data.push({ FileName: file, FilePath: imagesDir + '/' + dirname });
                body.Data = data;
            }
        })
        body.Status = 0;
        body.Message = "操作成功！";
        res.json(body);
        res.end();
    });
    app.post('/MAPConfig/deleteImgs', function(req, res) {
        let filename = req.body.name;
        let imagesDir = './Module/MAPConfig/web/image/';
        var body = {};
        fs.unlink(path.resolve(imagesDir + filename), (err) => {
            var body = {};
            if (err) {
                body.Status = -9999;
                body.Message = err;
                res.json(body);
            }
            body.Status = 0;
            body.Message = "删除成功！";
            res.json(body);
        });
    });
    app.post('/MAPConfig/saveJson', function(req, res) {
        try {
            if (fs.existsSync(`./Module/MAPConfig/location.json`)) {
                fs.writeFile(path.resolve(`./Module/MAPConfig/location.json`), req.body.saveJson, function(err) {
                    if (err) console.error(err);
                    res.json({
                        Status: 0,
                        Message: "操作成功"
                    })
                });
            } else {
                fs.createWriteStream(`./Module/MAPConfig/location.json`);
                fs.writeFile(path.resolve(`./Module/MAPConfig/location.json`), req.body.saveJson, function(err) {
                    if (err) console.error(err);
                    res.json({
                        Status: 0,
                        Message: "操作成功"
                    })
                });
            }
        } catch (error) {
            res.json({
                Status: -999,
                error: error
            })
        }

    });
}