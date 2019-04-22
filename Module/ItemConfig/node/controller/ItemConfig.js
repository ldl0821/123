var path = require('path');
var db = require('../../../../routes/db.js');
var config = require('../../../../routes/config');
var post_argu = require('../../../../routes/post_argu.js');
var request = require('request');


exports.GetItems = (req, res) => {
    let macNbrs = req.body.macNbrs;
    macNbrs = macNbrs.split(',');
    request.post({
        url: 'http://' + config.dataIP + ':' + config.dataport + '/DataCenter/GetItems',
        timeout: 30000,
        headers: {
            'content-type': 'application/json',
        },
        json: true,
        body: macNbrs
    }, (err, response, body) => {
        if (err) {
            res.json({
                Status: -999,
                Data: err
            })
        } else {
            if (body) {
                try {
                    for (let i = 0; i < body.length; i++) {
                        body[i].Value = [];
                        for (let item in body[i].Items) {
                            body[i].Value.push(body[i].Items[item])
                        }
                    }
                    res.json({
                        Status: 0,
                        Data: body,
                    })
                } catch (e) {
                    res.json({
                        Status: -999,
                        Data: null,
                    })
                }
            } else {
                res.json({
                    Status: -999,
                    Data: null
                })
            }
        }
    })
    }

exports.ItemConfig = async(req, res) => {
    //post_argu.permission(req, res, '/Defective', 'view', path.resolve(__dirname, '../../web/view/AddStaff/index'));
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/ItemConfig', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/ItemConfig/index'), {
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


exports.addMACItem = function(req, res) {
    try {
        let {MAC_NBR,itemName,itemParticular} = req.body;
        let deletesql = `delete  dbo.MAC_ItemConfig where User_ID=${req.session.user.UserId} and MAC_NBR in(select c1 from  dbo.func_splitstring('${MAC_NBR}',','))`;
        db.sql(deletesql, (result) => {
            MAC_NBR = MAC_NBR.split(',');
            itemName = itemName.split(',');
            itemParticular = itemParticular.split(',');
            let sqlLang = 'INSERT MAC_ItemConfig (User_ID,MAC_NBR,Item,Particular) ';
            for(let i = 0;i < MAC_NBR.length;i++){
                for(let w = 0; w < itemName.length;w++){
                    if(i == MAC_NBR.length-1 && w == itemName.length-1){
                        sqlLang+=`SELECT ${req.session.user.UserId},${MAC_NBR[i]},'${itemName[w]}','${itemParticular[w]}' `
                    }else{
                        sqlLang+=`SELECT ${req.session.user.UserId},${MAC_NBR[i]},'${itemName[w]}','${itemParticular[w]}' UNION `
                    }
                }
            }
            db.sql(sqlLang, (result) => {
                res.json({
                    Status: 0,
                    Data: result.recordset,
                    Message: "操作成功"
                })
            })
        })
    } catch (error) {
        res.json({
            Status: -999,
            error: error
        })
    }
}

