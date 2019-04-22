/**
 * Created by qb on 2016/11/23.
 */
var groupOrMachine;
var Chart;
var group;
var baseUrl = "/Alarm";
var globalData;
$(function() {
    var intervlaFacility;

    $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: moment().subtract(7, 'd')._d });
    $("#endTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
    $("#totalType").kendoComboBox({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: [
            { text: lang.EmployeePerformance.Shift, value: 1 },
            { text: lang.EmployeePerformance.Day, value: 2 },
            { text: lang.EmployeePerformance.Weeks, value: 3 },
            { text: lang.EmployeePerformance.Month, value: 4 },
            { text: lang.EmployeePerformance.Years, value: 5 }
        ],
        value: 2
    });

    groupOrMachine = $("#groupOrMachine").multipleComboxTree({
        url: "/Alarm/GetAllMachineAndMachineGroup",
        url2: "/Alarm/GetKeywordMachinelist",
        type: 2,
        data: {
            GroupId: 0
        },
        checkbox: true
    }).data("BZ-multipleComboxTree");

    MAC_NBR = $("#MAC_NBRname").comboxTree({
        url: "/Main/GetUserMacGroup",
        url2: "/machine/GetKeywordMachinelist",
        data: { groupID: 0 },
        treetemplate: $("#treeview-templatea").html(),
        width: 145,
        diffwidth: 27,
        type: 2,
    });
    $('#input_MAC_NBRname').attr('readonly', 'readonly');

    $('#my-select').change(function() {
        $('#my-selects').html('')
        let my_select = $('#my-select').val().join(',');
        // $('#my-select').val();
        $.post('/Main/GetMacNoList', { mac_name: my_select }, (data) => {
            dataGetMacNoList = data;
            for (let i = 0; i < data.Data.length; i++) {
                $('#my-selects').append(`<option value=${data.Data[i].MAC_NBR} >${data.Data[i].MAC_NO}</option>`)
            }
            // 缺一不可  
            $('#my-selects').selectpicker('refresh');
            $('#my-selects').selectpicker('render');
        })
    })

    $("#search").click(function(e, firstTime) {
        if (firstTime != 'firstTime') {
            $(`.pagination`).html('');
            if ($('#input_MAC_NBRname').val() == '') {
                BzAlert(lang.Common.PleaseSelectDeviceGroup);
                return;
            }
            if ($('#my-select').val() == null) {
                BzAlert(lang.Common.PleaseSelectDeviceName);
                return;
            }
            if ($('#my-selects').val() == null) {
                BzAlert(lang.Common.PleaseSelectDeviceNo);
                return;
            }
            dataArr = $('#my-selects').val();
        } else {
            dataArr = [];
        }
        var machines = [];
        machines = dataArr;
        if (machines.length == 0) {
            /**************************为了让默认显示 加上的 读缓存*********************************************/
            let mdaMessageData = [];
            let mdaMessage = localStorage.getItem('USER_MDA_MESSAGE');
            mdaMessage = JSON.parse(mdaMessage);
            for (let i = 0; i < mdaMessage.USER_PRE.length; i++) {
                mdaMessageData.push(mdaMessage.USER_PRE[i].MAC_NBR);
            }
            machines = mdaMessageData;
        }
        var data = {
            QueryType: parseInt($("#totalType").data("kendoComboBox").value()),
            MachineIds: machines,
            GroupIds: machines,
            StartTime: $("#startTime").val(),
            EndTime: $("#endTime").val()
        };
        var url;
        if ($('input[name="searchType"]:checked').val() == 1) { //设备
            url = "/Alarm/GetMachineByAlarmInfo";
        } else { //设备组
            url = "/Alarm/GetMachineByAlarmInfo";
        }

        $.post(url, data, function(data) {
            globalData = data;
            console.log(data.Data)
            categories = [];
            var startDate = moment($("#startTime").data("kendoDatePicker").value()).format("YYYY-MM-DD");
            var endDate = moment($("#endTime").data("kendoDatePicker").value()).format("YYYY-MM-DD");
            var dataSource = [];
            if (data.Data.length > 0) {
                try {
                    Chart.destroy();
                } catch (e) {}
                switch ($("#totalType").data("kendoComboBox").value()) {
                    case "1": //班次
                        DrawHisChart(data, startDate, endDate, categories, 1);
                        break;
                    case "2": //日
                        DrawHisChart(data, startDate, endDate, categories, 2);
                        break;
                    case "3": //周
                        DrawHisChart(data, startDate, endDate, categories, 3);
                        console.log(data)
                        break;
                    case "4": //月
                        DrawHisChart(data, startDate, endDate, categories, 4);
                        break;
                    case "5": //年
                        DrawHisChart(data, startDate, endDate, categories, 5);
                        break;
                }
            }
        });
    });

    $('#search').trigger('click', 'firstTime');
    BindCol();
});

function BindCol() {
    var fields = {
        ALARM_NBR: { type: "string" },
        ALARM_DATE: { type: "date" },
        MAC_NBR: { type: "string" },
        MAC_NAME: { type: "string" },
        ALARM_NO: { type: "string" },
        ALARM_MESSAGE: { type: "string" },
        ALARM_NAME: { type: "string" },
        ALARM_REASON: { type: "String" },
        BEGIN_DAY: { type: "date" },
        END_DAY: { type: "date" }

    };
    var cols = [];
    cols.push({ field: "ALARM_NBR", title: 'id', width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({ field: "ALARM_DATE", title: lang.Common.AlarmReason, width: 80, sortable: true, format: "{0: yyyy/MM/dd HH:mm:ss}", filterable: false });

    cols.push({ field: "STATUS_NAME", title: lang.MachineStatus.StateName, width: 80, sortable: true, filterable: false });
    cols.push({ field: "BEGIN_DAY", title: lang.Common.AlarmStartTime, width: 80, sortable: true, format: "{0: yyyy/MM/dd HH:mm:ss}", filterable: false });
    cols.push({ field: "END_DAY", title: lang.Common.AlarmOverTime, width: 80, sortable: true, format: "{0: yyyy/MM/dd HH:mm:ss}", filterable: false });
    cols.push({ field: "DURITION", title: lang.Common.AlarmDuration, width: 80, sortable: true, filterable: false });

    cols.push({ field: "MAC_NBR", title: lang.Order.EquipmentSerialNumber, width: 80, sortable: true, filterable: false });
    cols.push({ field: "MAC_NAME", title: lang.Order.DeviceName, width: 80, sortable: true, filterable: false });
    cols.push({ field: "ALARM_NO", title: lang.Common.AlarmNo, width: 80, sortable: true, filterable: false });
    cols.push({ field: "ALARM_MESSAGE", title: lang.Common.AlarmContent, width: 80, sortable: true, filterable: false });
    //cols.push({ field: "ALARM_NAME", title: "备注", width: 80, sortable: true, filterable: false });
    cols.push({ field: "ALARM_REASON", title: lang.Common.AlarmReason, className: "table-fonts", width: 80, sortable: true, filterable: false });
    cols.push({
        command: [{ name: "aa", text: lang.Order.Edit + '<i class="icon-edit"></i>', className: "btn purple", click: f_edit }],
        title: lang.Order.Operation,
        width: 80
    });
    grid = $("#hisTable").grid({
        checkBoxColumn: false,
        baseUrl: baseUrl, //调用的URL
        selectable: "single", //行选择方式
        //sort: [{ field: "USER_NBR", dir: "ASC" }],
        scrollable: true,
        editable: false, //是否可编辑
        autoBind: false,
        height: 300,
        resizeGridWidth: true, //列宽度可调
        isPage: true,
        customsearch: true,
        server: true, //服务器端刷新，包括排序，筛选等
        actionUrl: ["/GetLookupAlarmInfo", "", "", ""], //读、新增、更改、删除的URLaction
        custom: {
            PrimaryKey: "ALARM_NBR",
            fields: fields,
            cols: cols
        }
    });

}

function f_edit(e) {
    $.x5window(lang.Order.Edit, kendo.template($("#popup-add").html()));
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    var fonts = dataItem.ALARM_REASON;
    $("#MEMO").val(fonts);
    $("#Win_Submit").bind("click", function(e) {
        var json = {
            ALARM_NBR: dataItem.ALARM_NBR,
            ALARM_DATE: dataItem.ALARM_DATE,
            MAC_NBR: dataItem.MAC_NBR,
            MAC_NAME: dataItem.MAC_NAME,
            ALARM_NO: dataItem.ALARM_NO,
            ALARM_MESSAGE: dataItem.ALARM_MESSAGE,
            ALARM_REASON: $("#MEMO").val()
        };
        $.post(baseUrl + "/UpdAlarm", json, function(data) {
            if (data.Status == 0) {
                $("#x5window").data("kendoWindow").close();
                $("#hisTable").grid("refresh");
                BzSuccess(data.Message);
            } else {
                BzAlert(data.Message);
            }
        });
    });
}
//根据数据绘表
function DrawTable(machines, strdate, enddate) {
    $("#hisTable").grid("refresh", function() {
        return [{
            filters: [
                { field: "ALARM_DATE", Operator: "gte", value: strdate },
                { field: "ALARM_DATE", Operator: "lte", value: enddate }
            ],
            logic: "and"
        }];
    });
}

function DrawHisChart(data, strdate, enddate, categories, type) {
    var machines = {};
    for (var i = 0; i < data.Data.length; i++) {
        for (var j = 0; j < data.Data[i].Alarmcount.length; j++) {
            machines[data.Data[i].Alarmcount[j].MachineName] = {
                NAME: data.Data[i].Alarmcount[j].MachineName
            }
        }
        if (type == 1) {
            data.Data[i].Day = moment(data.Data[i].Day).format("YYYY-MM-DD") + data.Data[i].ShifName;
        } else if (type == 2)
            data.Data[i].Day = moment(data.Data[i].Day).format("YYYY-MM-DD");
        else if (type == 3)
            data.Data[i].Day = moment(data.Data[i].Day).format("YYYY") + "-" + moment(data.Data[i].Day).week() + "周";
        else if (type == 4)
            data.Data[i].Day = moment(data.Data[i].Day).format("YYYY-MM");
        else if (type == 5)
            data.Data[i].Day = moment(data.Data[i].Day).format("YYYY");
    }
    var ydata = [];
    if (type == 1) {
        for (var i = 0; i < data.Data.length; i++) {
            if (data.Data[i].ShifName != null)
                categories.push(data.Data[i].Day);
        }
    } else if (type == 2) {
        var diff = moment(enddate).diff(strdate, "days"); //横坐标是天
        for (var k = 0; k <= diff; k++) {
            categories.push(moment(strdate).add("days", k).format("YYYY-MM-DD"));
        }
    } else if (type == 3) {
        var diff = moment(enddate).diff(strdate, "weeks"); //横坐标是周
        for (var k = 0; k <= diff; k++) {
            var ndate = moment(strdate).add("weeks", k);
            categories.push(ndate.format("YYYY") + "-" + ndate.week() + lang.EmployeePerformance.Weeks);
        }
    } else if (type == 4) {
        var diff = moment(enddate).diff(strdate, "months");
        for (var k = 0; k <= diff; k++) {
            categories.push(moment(strdate).add("months", k).format("YYYY-MM")); //(横坐标为月)
        }
    } else {
        var diff = moment(enddate).diff(strdate, "years");
        for (var k = 0; k <= diff; k++) {
            categories.push(moment(strdate).add("years", k).format("YYYY")); //(横坐标为年)
        }
    }
    for (var m in machines) {
        var tjson = {};
        tjson.name = machines[m].NAME;
        tjson.data = [];
        for (var i = 0; i < categories.length; i++) { //日期
            var rdata = _.where(data.Data, { Day: categories[i] });
            if (rdata.length > 0) {
                var rdata1;
                rdata1 = _.where(rdata[0].Alarmcount, { MachineName: machines[m].NAME });
                if (rdata1.length > 0) {
                    tjson.data.push(rdata1[0].Count);
                } else {
                    tjson.data.push(null);
                }
            }
        }
        ydata.push(tjson);
    }
    var par = {
        type: "column",
        xdata: categories,
        ydata: ydata
    }
    drawHisChart(par, lang.Common.AlarmAnalysis);
    // DrawTable(strdate, enddate);
}

function drawHisChart(data, p) {
    Chart = $("#hisChart").hisChartYield({
        type: data.type == undefined ? "column" : data.type,
        title: p,
        subtitle: data.subtitle == undefined ? "" : data.subtitle,
        categories: data.xdata == undefined ? [] : data.xdata,
        dataSource: data.ydata == undefined ? [] : data.ydata,
        stacking: data.stacking == true ? "normal" : null,
        yAxistitle: lang.Common.Time,
        eventclick: true,
        click: function(e, d) {
            var startDate, endDate;
            for (var i = 0; i < globalData.Data.length; i++) {
                if (globalData.Data[i].Day == d.category) {
                    for (var j = 0; j < globalData.Data[i].Alarmcount.length; j++) {
                        if (globalData.Data[i].Alarmcount[j].MachineName == e.name) {
                            startDate = moment(globalData.Data[i].Alarmcount[j].BEGIN_DAY).format("YYYY-MM-DD HH:mm:ss");
                            endDate = moment(globalData.Data[i].Alarmcount[j].END_DAY).format("YYYY-MM-DD HH:mm:ss");
                        }
                    }
                }
            }
            $("#hisTable").grid("refresh", function() {
                return [{
                        filters: [
                            { field: "ALARM_DATE", Operator: "gte", value: startDate == undefined ? null : startDate },
                            { field: "ALARM_DATE", Operator: "lt", value: endDate == undefined ? null : endDate }
                        ],
                        logic: "and"
                    },
                    { field: "MAC_NAME", Operator: "eq", value: e.name }
                ]
            }, {
                logic: "and"
            });
        }
    }).data("BZ-hisChartYield");
}

function unique(list) {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
        if (i == 0) arr.push(list[i]);
        b = false;
        if (arr.length > 0 && i > 0) {
            for (var j = 0; j < arr.length; j++) {
                if (arr[j].CATEGORY == list[i].CATEGORY) {
                    b = true;
                    //break;
                }
            }
            if (!b) { arr.push(list[i]); }
        }
    }
    return arr;
}

function addOnClick(_salf) {
    $('#input_MAC_NBRname').val($(_salf).text());
    var thisSpan = _salf;
    $.post('/Main/GetMacNameList', { nodeID: $(thisSpan).attr('nodeid') }, (data) => {
        var description = [];
        dataGetMacNoList = '';
        $('#my-select').html('');
        $('#my-selects').html('');
        for (let w = 0; w < data.Data.rootMacInfo.length; w++) {
            if (data.Data.rootMacInfo[w] != null) {
                description.push(data.Data.rootMacInfo[w]);
            }
        }
        for (let q = 0; q < data.Data.submacInfo.length; q++) {
            if (data.Data.submacInfo[q] != null) {
                description.push(data.Data.submacInfo[q]);
            }
        }
        //去重
        description = unique(description);
        for (var i = 0; i < description.length; i++) {
            $('#my-select').append(`<option value=${description[i].MAC_NAME} >${description[i].CATEGORY}</option>`)
        }
        // 缺一不可  
        $('#my-select').selectpicker('refresh');
        $('#my-select').selectpicker('render');
    })
}