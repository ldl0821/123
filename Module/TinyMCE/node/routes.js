var path = require('path');
var config = require('../../../routes/config.js');
var post_argu = require('../../../routes/post_argu.js');
var multer = require('multer');
var multiparty = require('multiparty');
var fs = require('fs');
var db = require('../../../routes/db.js');
module.exports = async function(app) {
    app.get('/TinyMCES', (req, res) => {
        if (req.session.user) {
            res.render(path.resolve(__dirname, '../../TinyMCE/web/view/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(req),
                config: config
            })
        } else {
            res.redirect("/login");
        }
    });

    app.get('/compiles', (req, res) => {
        if (req.session.user) {
            res.render(path.resolve(__dirname, '../../TinyMCE/web/view/compiles'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(req),
                config: config
            })
        } else {
            res.redirect("/login");
        }
    });

    app.post('/TinyMCE/getNum_Name', (req, res) => {
        try {
            let sql = "select Num_Name,Show from Customer_Page where Customer_Id='" + req.body.name + "'";
            db.sql(sql, (result) => {
                res.json({
                    Status: 0,
                    Data: result.recordset
                });
            });

        } catch (error) {
            res.json({
                Status: -999,
                error: erroe
            });
        }

    })

    //请求ID拿到客户
    app.post('/TinyMCE/GetUserTable', async(req, res) => {
        var method = global.Webservice + '/PACommon/PACommon.asmx/GetUserTable';
        var groupID = { user_id: req.session.user.UserId }
        let result = await post_argu.post_argu(method, groupID);
        res.json({
            Status: 0,
            Data: result.Data,
        })
    })

    //请求ID拿到客户
    app.post('/TinyMCE/GetUserTableAndroid', async(req, res) => {
        var method = global.Webservice + '/PACommon/PACommon.asmx/GetUserTable';
        var groupID = { user_id: req.body.id }
        let result = await post_argu.post_argu(method, groupID);
        res.json({
            Status: 0,
            Data: result.Data,
        })
    })



    app.post('/TinyMCE/upload', (req, res) => {
        var form = new multiparty.Form();
        form.encoding = 'utf-8';
        form.uploadDir = './Module/TinyMCE/web/images';
        form.keepExtensions = true; //保留后缀
        form.type = true;
        form.parse(req, function(err, fields, files) {
            if (err) {
                res.send(err);
                return;
            } else {
                var dstPath = './Module/TinyMCE/web/images/' + files.file[0].originalFilename;
                fs.renameSync(files.file[0].path, dstPath); //重命名
                res.send({
                    key: files.file[0].originalFilename,
                    Message: "操作成功！",
                    url: './TinyMCE/web/images/' + files.file[0].originalFilename
                });
            }
        })
    })

    app.get('/TinyMCE/getClientName', async(req, res) => {
        // let sql = "select COMPANY_NAME as text from COMPANY_INFO";
        // db.sql(sql, (result) => {
        //     res.json({
        //         Status: 0,
        //         Data: result.recordset
        //     });
        // });

        let method = global.Webservice + '/PACommon/PACommon.asmx/GetUserCustomerList';
        let result = await post_argu.post_argu(method, { user_id: req.session.user.UserId });
        res.json(result);
        res.end();
    })

    app.post('/TinyMCE/readData', (req, res) => {
        try {
            let sql = "select Content as text from Customer_Page where Customer_Id='" + req.body.name + "'";

            if (req.body.Num_name != undefined || req.body.Num_name != null) {
                sql += "and Num_Name='" + req.body.Num_name + "'";
            }
            // let sql = "select Content as text from Customer_Page where Customer_Id='" + req.body.name + "'";
            db.sql(sql, (result) => {
                res.json({
                    Status: 0,
                    Data: result.recordset[0]
                });
            });
        } catch (error) {
            res.json({
                Status: -999,
                error: error
            });
        }
    })
    app.post('/TinyMCE/readDataBoard', (req, res) => {
        try {
            // let sql = "select Content as text from Customer_Page where Customer_Id='" + req.body.name + "' and Show='True'";
            let sql = "select Content as text,Show from Customer_Page where Customer_Id='" + req.body.name + "'";
            db.sql(sql, (result) => {
                for (let i = 0; i < result.recordset.length; i++) {
                    if (result.recordset[i].Show == true) {
                        res.json({
                            Status: 0,
                            Data: result.recordset[i]
                        });
                        return;
                    }
                }
                res.json({
                    Status: 0,
                    Data: result.recordset[0]
                });
            });
        } catch (error) {
            res.json({
                Status: -999,
                error: error
            });
        }
    })

    app.post('/TinyMCE/postText', (req, res) => {
        let sql = "select *  from Customer_Page where Customer_Id='" + req.body.name + "' and Num_Name='" + req.body.Num_name + "'";
        db.sql(sql, (result) => {
            if (result.recordset == undefined || result.recordset.length == 0) {
                let sql = "INSERT  INTO Customer_Page (Customer_Id, Content,Num_Name,Show) VALUES ('" + req.body.name + "', '" + req.body.text + "','" + req.body.Num_name + "','False')";
                db.sql(sql, (result) => {
                    res.json({
                        Status: 0,
                        Data: result.recordset,
                        Message: "操作成功"
                    });
                })
            } else {
                let sql = "update Customer_Page  set Content='" + req.body.text + "'  where  Customer_Id ='" + req.body.name + "' and Num_Name='" + req.body.Num_name + "'";
                db.sql(sql, (result) => {
                    res.json({
                        Status: 0,
                        Data: result.recordset,
                        Message: "操作成功"
                    });
                })
            }

        });
    })

    app.post('/TinyMCE/deleteText', (req, res) => {
        let sql = "select *  from Customer_Page where Customer_Id='" + req.body.name + "' and Num_Name='" + req.body.Num_name + "'";
        db.sql(sql, (result) => {
            if (result.recordset == undefined || result.recordset.length == 0) {
                res.json({
                    Status: -9999,
                    error: '模板信息不存在',
                });
            } else {
                let sql = " DELETE FROM Customer_Page where Customer_Id='" + req.body.name + "' and Num_Name='" + req.body.Num_name + "'";
                db.sql(sql, (result) => {
                    res.json({
                        Status: 0,
                        Data: result.recordset,
                        Message: "操作成功"
                    });
                });
            }

        });
    })
}