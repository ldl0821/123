var path = require('path')
var post_argu = require('../../../../routes/post_argu.js')
var request = require('request')
var config = require('../../../../routes/config.js')
var db = require('../../../../routes/db.js')
var _ = require('underscore')
module.exports = (app) => {
    app.get('/MachinePara', (req, res) => {
        if (req.session.user) {
            res.render(path.resolve(__dirname, '../../web/view/ProcessParameters/index'), {
                menulist: req.session.menu,
                user: req.session.user,
                lang: post_argu.getLanguage(req),
                config: config
            });
        } else {
            res.redirect("/login");
        }
    });

    app.post('/MachinePara/GetMogonPara', async(req, res) => {
        let methods = global.Webservice + '/ProcessParameters/ProcessParameters.asmx/GetParameterList_MongoDb';
        let result = await post_argu.post_argu(methods, req.body);
        res.json(result);
        res.end();
    })

    app.post('/MachinePara/GetMachine_Info', (req, res) => {
        db.sql(`select mac_no,mac_name,CATEGORY from machine_info where mac_nbr=${req.body.mac_nbr}`, (result) => {
            res.json(result.recordset);
        })
    })
}