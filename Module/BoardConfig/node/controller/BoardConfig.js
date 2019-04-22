const path = require('path');
const http = require('http');
const request = require('request');
const fs = require('fs');
const post_argu = require('../../../../routes/post_argu.js');
const config = require('../../../../routes/config.js');
const db = require('../../../../routes/db.js');


exports.BoardConfig = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/BoardConfigs', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/BoardConfig/index'), {
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

exports.writeFile = async(req, res) => {
    //判断有文件去读文件 没有文件 返回1
    try {
        if (fs.existsSync(`./public/BoardConfig/${req.session.user.UserId}.json`)) {
            fs.readFile(path.resolve(`./public/BoardConfig/${req.session.user.UserId}.json`), 'utf8', function(err, data) {
                if (err) throw err;
                res.json({
                    Data: data,
                    Status: 0,
                    Message: "操作成功"
                })
            });
        } else {
            res.json({
                Status: 1,
                Message: "操作成功"
            })
        }
    } catch (error) {
        res.json({
            error: error,
            Status: -999,
            Message: "操作失败"
        })
    }
}



exports.createFile = async(req, res) => {
    //判断有文件去修改文件，没有文件生成文件
    try {
        let sql = "update Customer_Page  set Show='False'  where  Customer_Id ='" + req.body.GetClientInformation + "'";
        db.sql(sql, (result) => {
            let sqlUpdata = "update Customer_Page  set Show='True'  where  Customer_Id ='" + req.body.GetClientInformation + "' and Num_Name='" + req.body.Num_Name + "'";
            db.sql(sqlUpdata, (result) => {

            })
        })
        if (fs.existsSync(`./public/BoardConfig/${req.session.user.UserId}.json`)) {
            fs.writeFile(path.resolve(`./public/BoardConfig/${req.session.user.UserId}.json`), JSON.stringify(req.body), function(err) {
                if (err) console.error(err);
                res.json({
                    Status: 0,
                    Message: "操作成功"
                })
            });
        } else {
            fs.createWriteStream(`./public/BoardConfig/${req.session.user.UserId}.json`);
            fs.writeFile(path.resolve(`./public/BoardConfig/${req.session.user.UserId}.json`), JSON.stringify(req.body), function(err) {
                if (err) console.error(err);
                res.json({
                    Status: 0,
                    Message: "操作成功"
                })
            });
        }
    } catch (error) {
        res.json({
            error: error,
            Status: -999,
            Message: "操作失败"
        })
    }
}