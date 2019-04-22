const mssql = require('mssql');
var db = {};
const config = {
    user: 'sa',
    password: '1`q',
    server: '192.168.0.96',
    database: 'BANDEX2018_NEW',
    port: 1433,
    option: {
        encrpt: true
    },
    pool: {
        min: 0,
        max: 100,
        idleTimeoutMillis: 30000
    }
};

db.sql = function(sql, callBack) {
    var con = new mssql.ConnectionPool(config).connect().then(pool => {
        return pool.request().query(sql)
    }).then(result => {
        callBack(result);
        mssql.close();
    }).catch(err => {
        callBack(err)
        mssql.close();

    })
}

//调用存储过程（特定版） htc:20180820
db.execute = function(execname, startdate, enddate, type, macs, callBack) {
    mssql.close();
    mssql.connect(config, function(err) {
        if (err) {
            return callback(err);
        } else {
            var request = new mssql.Request();
            request.input('StartDate', startdate); //输入参数
            request.input('EndDate', enddate); //输入参数
            request.input('ISDAY', type); //输入参数
            request.input('MACS', macs); //输入参数
            // request.output('output_parameter', mssql.Int); //输出参数
            request.execute(execname, function(err, recordsets, returnValue) {
                callBack(recordsets.recordset);
            });
        }
    });
}


// db.sql = function(sql, callBack) {
//     var connection = new mssql.Connection(config, function(err) {
//         if (err) {
//             console.log(err);
//             return;
//         }
//         var ps = new mssql.PreparedStatement(connection);
//         ps.prepare(sql, function(err) {
//             if (err) {
//                 console.log(err);
//                 return;
//             }
//             ps.execute('', function(err, result) {
//                 if (err) {
//                     console.log(err);
//                     return;
//                 }
//                 ps.unprepare(function(err) {
//                     if (err) {
//                         console.log(err);
//                         callback(err, null);
//                         return;
//                     }
//                     callBack(err, result);
//                 })
//             })
//         })
//     })
// }

module.exports = db;