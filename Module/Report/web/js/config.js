module.exports = {
    template: [{
            Report_name: '设备稼动率报表',
            tpars: ["Machine", "StartDate", "EndDate", "statis", "Type"],
            url: '/WebReport/PA_ACTIVACTION.asmx/GetSpeialArrayTableForNewReport'
        },
        //  {
        //     Report_name: '设备组稼动率报表',
        //     tpars: ["Machine", "StartDate", "EndDate", "statis", "Type"],
        //     url: '/WebReport/PA_ACTIVACTION.asmx/GetActivationArrayList'
        // }, 
        {
            Report_name: '设备报警报表',
            tpars: ["Machine", "StartDate", "EndDate", "statis", "Type"],
            url: '/WebReport/AlarmDataExport.asmx/GetNewAlarmDataList'
        }, {
            Report_name: '设备参数报表',
            tpars: ["Machine", "StartDate", "EndDate", "statis", "Type"],
            // url: '/ProcessParameters/ProcessParameters.asmx/GetParameterList_MongoDb'
            url: '/ProcessParameters/ProcessParameters.asmx/GetMultipleParameterList_MongoDb'
        }, {
            Report_name: '设备产量报表',
            tpars: ["Machine", "StartDate", "EndDate", "statis", "Type"],
            url: ''
        }
    ]
}