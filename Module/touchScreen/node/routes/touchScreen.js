var db = require('../../../../routes/db.js');
var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
module.exports = (app) => {
    app.post('/touchScreenLogin',(req,res)=>{
        var md5 = crypto.createHash('md5');
        var pwd = md5.update(req.body.Pwd).digest('hex');
        db.sql(`SELECT g.*,ur.USER_NAME,ur.PASSWORD from MEMBER_INFO g left join dbo.USER_INFO ur on g.USER_ID=ur.USER_NBR`, function(result) {
            let user_list = result.recordset;
            let userData = {};
            for(let i = 0; i < user_list.length;i++){
                if(user_list[i].MEMBER_NO == req.body.Name){
                    userData = user_list[i];
                    break;
                }
            }
            if(JSON.stringify(userData) != '{}'){
                if(pwd == userData.PASSWORD){
                    res.json({
                        Status: 0,
                        Data: {
                            "UserId": userData.MEM_NBR,
                        },
                        Message: "登录成功！"
                    })
                }else{
                    res.json({
                        Status: 1,
                        Message: "用户名密码错误！"
                    })
                }
            }else{
                res.json({
                    Status: 1,
                    Message: "账号不存在"
                })
            }
        })
    })
    app.post('/touchScreen/GetUserPermisson',(req,res)=>{
        var menu_list = [];
        db.sql(`SELECT USER_ID,MEMBER_NO from MEMBER_INFO where MEM_NBR=${+req.body.UserId}`,(result)=>{
            let userId = result.recordset[0].USER_ID;
            const userName = result.recordset[0].MEMBER_NO;
            UserMenu(req, res, +userId, menu_list,userName);
        })
    })
}
//查看用户菜单
function UserMenu(req, res, user_id, menu_list,userName) {
    async.waterfall([
        function(callback) {
            db.sql(`select me.*,PERMISSION from USER_FUNCTION uf left join MENU_PERMISSION mp on uf.FUNC_NBR = mp.Permission_Nbr
            left join MENU me on me.MENU_NBR = mp.Menu_Nbr
            where uf.USER_NBR = ${user_id} and mp.Function_Name = 'ScreenView'`, function(result) {
                menu_list = result.recordset;
                callback(null, user_id, menu_list);
            })
        },
        function(user_id, menu_list, callback) {
            var sql_command = "select gi.*,ur.USER_NBR from GROUP_INFO gi left join USER_GROUP ur on gi.GP_NBR = ur.GP_NBR";
            db.sql(sql_command, function(result) {
                var temp = _.where(result.recordset, { 'USER_NBR': user_id });
                var g_id;
                if (temp.length > 0) {
                    g_id = _.where(result.recordset, { 'USER_NBR': user_id })[0].GP_NBR;
                } else {}
                var g_list = [];
                Get_F_(result.recordset, g_id, g_list, 2);
                gp_list(g_list);
                callback(null, g_list, menu_list);
            })
        },
        function(g_list, menu_list, callback) {
            var gf = gp_list(g_list);
            db.sql(`
            select me.*,PERMISSION from GROUP_FUNCTION gf left join MENU_PERMISSION mp on gf.FUNC_NBR = mp.Permission_Nbr
            left join MENU me on me.MENU_NBR = mp.Menu_Nbr
            where gf.GP_NBR in  (select C1 from dbo.func_splitstring('${gf}',',')) and mp.Function_Name = 'ScreenView' order by GP_NBR desc`, function(result) {
                for (let i = 0; i < result.recordset.length; i++) {
                    if (_.where(menu_list, { 'MENU_NBR': result.recordset[i].MENU_NBR }).length == 0) {
                        menu_list.push(result.recordset[i]);
                    }
                }
                menu_list = _.where(menu_list, { 'PERMISSION': 1 });
                menu_list = _.uniq(menu_list, false, 'MENU_NBR');
                res.json({
                    Status:0,
                    Data:menu_list,
                    name:userName,
                    Message:'操作成功'
                })
            })
        }
    ])

}

//递归返回
function Get_F_(Data, id, list, type) {
    if (type == 1)
        var Group = _.where(Data, { 'userid': id });
    else
        var Group = _.where(Data, { 'GP_NBR': id });
    if (Group.length > 0) {
        list.push({ id: id, type: type });
        list = Get_F_(Data, Group[0].PID, list, 2);
    } else {
        return list;
    }
}

//获取字符串列表
function gp_list(list) {
    var str;
    for (var i = 0; i < list.length; i++) {
        if (i == 0) {
            str = list[i].id;
            // } else if (i == list.length) {
            //     str = str + ',' + list[i - 1].id;
        } else {
            str = str + ',' + list[i].id;
        }
    }
    return str;
}