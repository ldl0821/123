var path = require('path');
var http = require('http');
var request = require('request');
var fs = require('fs');
var WebSocket = require('ws');
var post_argu = require('../../../../routes/post_argu.js');
var config = require('../../../../routes/config.js');
const db = require('../../../../routes/db.js');

let fsContent;  // 保存APK看板文件内容 如果读取过就不在读取

exports.BoardAndroid = async(req, res) => {
    if (req.query.uid) {
        req.session.user = {};
        req.session.user.UserId = req.query.uid;
    }
    if (await post_argu.permission(req.session.user.UserId, '/boards', 'view')) {
        res.render(path.resolve(__dirname, '../../web/view/Board/index'))
    } else {
        res.redirect("/login");
    }

}

exports.Board = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/boards', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/board/index'), {
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
exports.lhWebServer = async(app) => {
    var server = http.createServer(app);
    var wss = new WebSocket.Server({server});
    wss.on('connection', function connection(ws) {
        console.log('开始连接！');
        ws.on('message', function incoming(data) {
             console.log('接收到了消息！');
            /**
             * 把消息发送到所有的客户端
             * wss.clients获取所有链接的客户端
             */
            wss.clients.forEach(function each(client) {
                client.send(data);
            });
        });
    });
    server.listen(config.cutterWebSocketPort, function listening() {
        console.log('看板刀补服务器启动成功！端口' + config.cutterWebSocketPort);
    });
}



exports.getTxt = async(req, res) => {
    try {
        if (fs.existsSync(`./public/BoardConfig/${req.session.user.UserId}.json`)) {
            fs.readFile(path.resolve(`./public/BoardConfig/${req.session.user.UserId}.json`), 'utf8', function(err, data) {
                if (err) console.log(err);
                res.json({
                    data: data,
                    Status: 0,
                    Message: "操作成功"
                })
            });
        } else {
            res.json({
                data: {},
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

exports.GetAlarmDataOrder = async(req,res) => {
    const result = await post_argu.post_argu(global.Webservice + '/NewCutter/NewCutter.asmx/GetAlarmDataOrder', req.body);
    res.json({
        data:result.Data,
        Status:0,
        Message: '操作成功'
    })
}


// APK看板使用  获取所有状态设备数据
exports.GetAllDataReal = async(req ,res) => {
    if(fsContent == undefined || fsContent == null ){
        fsContent = fs.readFileSync(path.resolve(`./public/company/company.json`), 'utf8');
        fsContent = JSON.parse(fsContent)
    }
    let macNbrs = req.body.macNbrs;
    macNbrs = macNbrs.split(',');
       request.post({
        url: 'http://' + config.dataIP + ':' + config.dataport + '/DataCenter/GetItems',
        timeout: 10000,
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
                    let macNbrArr = [];
                    let bodyNumAlarm = [...body]
                    for(let i = 0; i < bodyNumAlarm.length;i++){
                        macNbrArr.push(bodyNumAlarm[i].MacNbr)
                    }
                    const sql = `select *,1 as flag from MACHINE_INFO where mac_nbr in (select c1 from dbo.func_splitstring('${macNbrArr.join()}',','))
                    UNION ALL
                    select *,0 as flag from MACHINE_INFO where mac_nbr NOT IN (select c1 from dbo.func_splitstring('${macNbrArr.join()}',','))
                    `;
                    db.sql(sql,function(result){
                        let mac_list = result.recordset;
                        for(let i = 0;i < mac_list.length;i++) {
                            for(let w = 0; w < bodyNumAlarm.length;w++) {
                                if(mac_list[i].MAC_NBR == bodyNumAlarm[w].MacNbr) {
                                    mac_list[i].value = bodyNumAlarm[w].Items['STD::Status'].Value
                                    // bodyNumAlarm[w].MAC_NO = mac_list[i].MAC_NO;
                                    // bodyNumAlarm[w].MAC_NAME = mac_list[i].MAC_NAME;
                                    break;
                                }
                            }
                        }
                        for(let z = 0; z < mac_list.length;z++){
                            for(let m = 0; m < fsContent.length; m++){
                                if(mac_list[z].MAC_NBR == fsContent[m].id){
                                    mac_list[z].path = fsContent[m].path;
                                    break;
                                }
                            }
                        }
                        res.json({
                            Status: 0,
                            Data: mac_list,
                        })
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


// APK看板使用  获取报警状态设备数据
exports.GetAlarmDataReal = async(req, res) => {
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
                    let macNbrArr = [];
                    let bodyNumAlarm = body.filter(function(x){
                        return x.Items['STD::Status'].Value == 1
                    });
                    for(let i = 0; i < bodyNumAlarm.length;i++){
                        macNbrArr.push(bodyNumAlarm[i].MacNbr)
                    }
                    const sql = `select * from MACHINE_INFO where mac_nbr in (select c1 from dbo.func_splitstring('${macNbrArr.join()}',','))`
                    db.sql(sql,function(result){
                        let mac_list = result.recordset;
                        for(let i = 0;i < mac_list.length;i++ ){
                            for(let w = 0; w < bodyNumAlarm.length;w++){
                                if(mac_list[i].MAC_NBR == bodyNumAlarm[w].MacNbr){
                                    bodyNumAlarm[w].MAC_NO = mac_list[i].MAC_NO;
                                    bodyNumAlarm[w].MAC_NAME = mac_list[i].MAC_NAME;
                                    break;
                                }
                            }
                        }
                        res.json({
                            Status: 0,
                            Data: bodyNumAlarm,
                        })
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

exports.getActivationData = async(req,res) => {
    const result = await post_argu.post_argu(global.Webservice + '/NewCutter/NewCutter.asmx/getRunPerHour', req.body);
    res.json({
        data:result.Data,
        Status:0,
        Message: '操作成功'
    })
}

exports.getTxtAndroid = async(req, res) => {
    try {
        if (fs.existsSync(`./public/BoardConfig/${req.body.id}.json`)) {
            fs.readFile(path.resolve(`./public/BoardConfig/${req.body.id}.json`), 'utf8', function(err, data) {
                if (err) console.log(err);
                res.json({
                    data: data,
                    Status: 0,
                    Message: "操作成功"
                })
            });
        } else {
            res.json({
                data: {},
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

