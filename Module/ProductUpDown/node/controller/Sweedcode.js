var path = require('path');
var request = require('request');
var logger = require('../../../../routes/logger.js');
var config = require('../../../../routes/config.js');
var post_argu = require('../../../../routes/post_argu.js');
var db = require('../../../../routes/db.js');
exports.sweedcodepage = async(req, res) => {
    if (req.session.user) {
        if (await post_argu.permission(req.session.user.UserId, '/sweedcodes', 'view')) {
            res.render(path.resolve(__dirname, '../../web/view/sweedcode/index'), {
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
exports.fun = function(req, res) {
    var args = [];
    args.push(res);
    method = post_argu.getpath(__filename, req.params.method);
    args.push(method);
    args.push(req.body);
    args.push(req);
    doCallback(eval(req.params.method), args, res, req);
}

function doCallback(fn, args, res) {
    fn.apply(this, args);
}
// async function AddSweedcode(res, method, args, req) {
//     var para = { userInfo: args, GP_NBR: args.GP_NBR };
//     await post_argu.permission(req.session.user.UserId, 'ModifyUser') {
//         let result = await post_argu.post_argu(method, para);
//         res.json(result);
//         res.end();
   
//     }
//     //post_argu.permission(req, res, 'ModifyUser', "ModifyUser", method, para);
// }

async function GetUplineList(res, method, args,req){
    var macs=[];
    if(args.filter!=undefined){
        macs=args.filter.filters[0].value;
    }
    //int pagesize, int pageindex, string macs, string product_name, string program_no, DateTime sttime, DateTime edtime
    var paras={pagesize:args.pageSize,pageindex:args.page,macs:macs,product_name:"",program_no:"",sttime:null,edtime:null};
    let result = await post_argu.post_argu(method, paras);  
    res.json(result);
    res.end();
}


async function GetUplineListScreen(res, method, args) {
    // 此接口使用与触摸屏和看板  触摸屏传user_id（人员的id）  看板不需要传
    let sql = `
        select top ${args.pageSize * args.page} * from (
            SELECT   ROW_NUMBER()over(order by UP_DOWN_NBR)as NBR,mac.MAC_NO,mac.MAC_NAME,pud.MAC_NBR,pud.UP_DOWN_NBR,pud.UP_TIME,pud.DOWN_TIME,
                    pud.PRODUCT_NAME,pud.PROGRAM_NO,pud.UP_MEM,pud.DOWN_MEM,pud.MEMO,
                    upmem.[MEM_NAME] AS UPMEM_NAME,upmem.[MEMBER_NO] AS UPMEM_NO,downmem.[MEM_NAME] AS DOWNMEM_NAME,downmem.[MEMBER_NO] AS DOWNMEM_NO
                    FROM  PRODUCT_UP_DOWN  pud 
                    INNER JOIN  dbo.MACHINE_INFO mac ON(pud.MAC_NBR=mac.MAC_NBR)
                    left  JOIN dbo.MEMBER_INFO upmem ON(pud.UP_MEM=upmem.MEM_NBR)
                    left  JOIN dbo.MEMBER_INFO downmem ON(pud.DOWN_MEM=downmem.MEM_NBR)
                    WHERE  DOWN_TIME is  null ) dt WHERE  NBR>(${args.page}-1)*${args.pageSize} order by UP_TIME desc`;
    if(args.user_id){
        sql = `select top ${args.pageSize * args.page} * from (
            SELECT  ROW_NUMBER()over(order by UP_DOWN_NBR)as NBR,mac.MAC_NO,mac.MAC_NAME,pud.MAC_NBR,pud.UP_DOWN_NBR,pud.UP_TIME,pud.DOWN_TIME,
                    pud.PRODUCT_NAME,pud.PROGRAM_NO,pud.UP_MEM,pud.DOWN_MEM,pud.MEMO,
                    upmem.[MEM_NAME] AS UPMEM_NAME,upmem.[MEMBER_NO] AS UPMEM_NO,downmem.[MEM_NAME] AS DOWNMEM_NAME,downmem.[MEMBER_NO] AS DOWNMEM_NO
                    FROM  PRODUCT_UP_DOWN  pud 
                    INNER JOIN  dbo.MACHINE_INFO mac ON(pud.MAC_NBR=mac.MAC_NBR)
                    left  JOIN dbo.MEMBER_INFO upmem ON(pud.UP_MEM=upmem.MEM_NBR)
                    left  JOIN dbo.MEMBER_INFO downmem ON(pud.DOWN_MEM=downmem.MEM_NBR)
                    WHERE  DOWN_TIME is  null and  dbo.find_in_set(pud.MAC_NBR,(select FACILITY from MEMBER_INFO where MEM_NBR=${args.user_id}))>0 
                    ) dt WHERE  NBR>(${args.page}-1)*${args.pageSize} order by UP_TIME desc`
    }
    db.sql(sql,(result)=>{
        res.json({
            Status: 0,
            Message: "操作成功",
            Data:{
                List:result.recordset
            }
        })
    })
}

// 看板方法  将产品上下线和刀具数据汇总
async function getAndroidDataGroup(res, method , args){
    // let page = args.page,
        // pageSize = args.pageSize;

    let getUplineList = new Promise((resolve,reject)=>{
        // let sql = `
        // select top ${args.pageSize * args.page} * from (
        //     SELECT   ROW_NUMBER()over(order by UP_DOWN_NBR)as NBR,mac.MAC_NO,mac.MAC_NAME,pud.MAC_NBR,pud.UP_DOWN_NBR,pud.UP_TIME,pud.DOWN_TIME,
        //             pud.PRODUCT_NAME,pud.PROGRAM_NO,pud.UP_MEM,pud.DOWN_MEM,pud.MEMO,
        //             upmem.[MEM_NAME] AS UPMEM_NAME,upmem.[MEMBER_NO] AS UPMEM_NO,downmem.[MEM_NAME] AS DOWNMEM_NAME,downmem.[MEMBER_NO] AS DOWNMEM_NO
        //             FROM  PRODUCT_UP_DOWN  pud 
        //             INNER JOIN  dbo.MACHINE_INFO mac ON(pud.MAC_NBR=mac.MAC_NBR)
        //             left  JOIN dbo.MEMBER_INFO upmem ON(pud.UP_MEM=upmem.MEM_NBR)
        //             left  JOIN dbo.MEMBER_INFO downmem ON(pud.DOWN_MEM=downmem.MEM_NBR)
        //             WHERE  DOWN_TIME is  null ) dt WHERE  NBR>(${page}-1)*${pageSize} order by UP_TIME desc`;

        let sql = `select  pd.UP_DOWN_NBR,pd.MAC_NBR,pd.UP_TIME,pd.DOWN_TIME,pd.PRODUCT_NAME,pd.PROGRAM_NO,pd.UP_MEM,pd.DOWN_MEM,pd.MEMO,aa.MAC_NO,aa.MAC_NAME  from PRODUCT_UP_DOWN pd inner join 
        (
            SELECT MAC_NBR,MAX(UP_TIME)UP_TIME
              FROM [PRODUCT_UP_DOWN]
              group by MAC_NBR
         ) maxval on(pd.MAC_NBR=maxval.MAC_NBR  and pd.UP_TIME=maxval.UP_TIME) left join MACHINE_INFO aa ON (aa.MAC_NBR = pd.MAC_NBR) `; 
        db.sql(sql, function(result){
            resolve(result.recordset);
        })
    })


    let getUserData = new Promise((resolve,reject) => {
        let sql = `select * from MEMBER_INFO`;
        db.sql(sql, (result) => {
            resolve(result.recordset);
        });
    })

    // const knifeMethod = "http://"+config.webIP+":"+config.webPort+"/Modules/NewCutter/NewCutter.asmx/GetCurrentCutterDurationLifeList";
    // let getKnifeList = post_argu.post_argu(knifeMethod, { pageIndex: page, PageSize: pageSize, CUTTTER_NO: args.CUTTTER_NO,mac_nbr:args.mac_nbr,CUTTER_STST:args.CUTTER_STST });

    let getKnifeList = new Promise((resolve,reject) => {
        // 2019-3-28 sql去除  where END_DATE IS  null
        let sql = `  
        select  pd.NEW_CUTTER_ID,pd.NEW_CUTTER_NO,pd.NEW_CUTTER_NO_NAME,pd.PROGRAM,pd.EXCEPT_LIFE,pd.WARN_LIFE,pd.MAC_NBR,pd.REAL_LIFE,pd.BEGIN_DATE,pd.END_DATE,
                  pd.CUTTER_GROUP_NBR,pd.R_ID,pd.STATUS_NBR,pd.NEW_CUTTER_UNIQUE_NO from NEW_CUTTER pd inner join 
              (
                  SELECT MAC_NBR,MAX(BEGIN_DATE)BEGIN_DATE
                    FROM NEW_CUTTER
                    group by MAC_NBR
               )maxval on(pd.MAC_NBR=maxval.MAC_NBR and pd.BEGIN_DATE=maxval.BEGIN_DATE)`;
        db.sql(sql, (result) => {
            resolve(result.recordset);
        });
    })


    let getMachineInfo = new Promise((resolve,reject)=>{
        let sql = `select * from MACHINE_INFO`;
        db.sql(sql, (result) => {
            resolve(result.recordset);
        });
    })


    Promise.all([getUplineList,getKnifeList,getMachineInfo, getUserData]).then((result)=>{

        var resultArrSole = [];
        for (var i = 0; i < result[2].length; i++) {
            var obj = result[2][i];
            var num = obj.MAC_NBR;
            var flag = false;
            for (var j = 0; j < result[0].length; j++) {
                var aj = result[0][j];
                var n = aj.MAC_NBR;
                if (n == num) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                resultArrSole.push(obj);
            }
        }

        for(let w = 0; w < result[0].length; w++){
            for(let m = 0; m < result[1].length;m++){
                if(result[0][w].MAC_NBR == result[1][m].MAC_NBR){
                    result[0][w].NEW_CUTTER_UNIQUE_NO = result[1][m].NEW_CUTTER_UNIQUE_NO;
                    result[0][w].REAL_LIFE = result[1][m].REAL_LIFE;
                    result[0][w].EXCEPT_LIFE = result[1][m].EXCEPT_LIFE;
                    result[0][w].NEW_CUTTER_NO = result[1][m].NEW_CUTTER_NO;
                    result[0][w].NEW_CUTTER_NO_NAME = result[1][m].NEW_CUTTER_NO_NAME;
                    break;
                }
            }
        }

        for(let c = 0; c < resultArrSole.length; c++) {
            // flag 是1的是  未联网的
            result[0].push({
                DOWN_MEM:null,
                DOWN_TIME:null,
                EXCEPT_LIFE:undefined,
                MAC_NBR:resultArrSole[c].MAC_NBR,
                MAC_NO: resultArrSole[c].MAC_NO,
                MAC_NAME:resultArrSole[c].MAC_NAME,
                MEMO:"",
                NEW_CUTTER_NO:"",
                NEW_CUTTER_NO_NAME:"",
                NEW_CUTTER_UNIQUE_NO:"",
                PRODUCT_NAME:"",
                PROGRAM_NO:"",
                REAL_LIFE:undefined,
                UP_DOWN_NBR:58,
                UP_MEM:33,
                flag:1
            })
        }

        for(let w = 0; w < result[3].length; w++){
            let arrFacility = result[3][w].FACILITY.split(',');
            for(let i = 0; i < result[0].length; i++) {
                if(arrFacility.indexOf(String(result[0][i].MAC_NBR)) != -1) {
                    result[0][i].userName = result[3][w].MEM_NAME;
                    result[0][i].userNo = result[3][w].MEMBER_NO;
                }
            }
        }

        let Data = {
            Data: {
                List: result[0],
                PageInfo: {
                    RecordCount: result[0].length,
                    PageSize: 0,
                    AUTO_ID: 0,
                    FirstIndex: 0,
                    PageIndex: 0
                }
            },
            Status: 0,
            Message: "操作成功"
        };
        res.json(Data);


    }).catch((error)=>{
        res.json({
            Status: -999,
            Message: error,
        })
    })

}

async function getUserFacility(res, method, args){
    const sql = `select * from MACHINE_INFO where dbo.find_in_set(MAC_NBR,(select FACILITY from dbo.MEMBER_INFO where MEM_NBR=${args.user_id}))>0`
    db.sql(sql,(result)=>{
        res.json({
            Status: 0,
            Message: "操作成功",
            Data: result.recordset
        })
    })
}


async function getStaffInfo(res, method, args) {
    const sql = `select MEM_NBR,USER_ID,MEMBER_NO,MEM_NAME from MEMBER_INFO`
    db.sql(sql,(result)=>{
        res.json({
            Status: 0,
            Message: "操作成功",
            Data: result.recordset
        })
    })
}

async function AddSweedcode(res, method, args,req) {
   var mac_nbr=  args.mac_nbr;
   var product_name=  args.product_name;
   var mem_nbr=args.mem_nbr;
   var memo="";
   var program_no=args.program_no;
   //(int mac_nbr, string product_name, string program_no, int mem_nbr, string memo)
   var data={mac_nbr:mac_nbr,product_name,program_no,mem_nbr,memo};
    let result = await post_argu.post_argu(method, data);
    res.json(result);
    res.end();
}


async function UpdeteUpdown(res, method, args,req) {
    var updown_nbr=args.updown_nbr;
    var mac_nbr=  args.mac_nbr;
    var product_name=  args.product_name;
    var down_mem= +args.down_mem;
    var memo=args.memo;
    var up_mem=args.up_mem;
    var up_time=args.up_time;
    var program_no=args.program_no;
    //int updown_nbr, int mac_nbr, string product_name, string program_no, int up_mem, string memo, DateTime up_time, int down_mem
    var paras={updown_nbr:updown_nbr,mac_nbr:mac_nbr,product_name:product_name,program_no:program_no,up_mem:up_mem,memo:memo,up_time:up_time,down_mem:down_mem};
     let result = await post_argu.post_argu(method, paras);
     res.json(result);
     res.end();
 }


 async function DelUpdown(res, method, args,req) {
    var updown_nbr=args.updown_nbr;
    //int updown_nbr, int mac_nbr, string product_name, string program_no, int up_mem, string memo, DateTime up_time, int down_mem
    var paras={updown_nbr:updown_nbr};
     let result = await post_argu.post_argu(method, paras);
     res.json(result);
     res.end();
 }