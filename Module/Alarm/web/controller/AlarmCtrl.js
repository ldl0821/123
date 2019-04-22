var GetMacNameListData; //保存设备名称数据
app.controller('AlarmCtrl', ['$scope', '$http', function($scope, $http) {
    $("#startTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: moment(new Date()).subtract(7, 'days').format('YYYY/MM/DD HH:mm:ss'), interval: 1, timeFormat: "HH:mm:ss" });
    $("#endTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: new Date(), interval: 1, timeFormat: "HH:mm:ss" });
    MAC_NBR = $("#MAC_NBRname").comboxTree({
        url: "/Main/GetUserMacGroup",
        data: { groupID: 0 },
        treetemplate: $("#treeview-template").html(),
        width: 184,
        diffwidth: 27,
        type: 2,
    });
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
    // cols.push({ field: "ALARM_DATE", title: lang.Common.AlarmReason, width: 80, sortable: true, format: "{0: yyyy/MM/dd HH:mm:ss}", filterable: false });

    // cols.push({ field: "STATUS_NAME", title: lang.MachineStatus.StateName, width: 80, sortable: true, filterable: false });
    cols.push({ field: "BEGIN_DAY", title: lang.Common.AlarmStartTime, width: 80, sortable: true, format: "{0: yyyy/MM/dd HH:mm:ss}", filterable: false });
    cols.push({ field: "END_DAY", title: lang.Common.AlarmOverTime, width: 80, sortable: true, format: "{0: yyyy/MM/dd HH:mm:ss}", filterable: false });
    cols.push({ field: "DURITION", title: lang.Common.AlarmDuration, width: 80, sortable: true, filterable: false });

    // cols.push({ field: "MAC_NBR", title: lang.Order.EquipmentSerialNumber, width: 80, sortable: true, filterable: false });
    // cols.push({ field: "MAC_NAME", title: lang.Order.DeviceName, width: 80, sortable: true, filterable: false });
    cols.push({ field: "CATEGORY", title: lang.Order.EquipmentSerialNumber, width: 80, sortable: true, filterable: false });
    cols.push({ field: "MAC_NO", title: lang.Order.DeviceName, width: 80, sortable: true, filterable: false });

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
        baseUrl: '/Alarm', //调用的URL
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
    $('#input_MAC_NBRname').attr('readonly', 'readonly');
    $('#my-select').change(function() {
        $('#my-selects').html('');
        var sortData = [];
        for (let i = 0; i < $('#my-select').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-select').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    sortData.push(GetMacNameListData.Data.rootMacInfo[w])
                        // $('#my-selects').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                }
            }
        }
        sortData.sort(compare('paixu', compare('RANK_NUM')));
        for (let z = 0; z < sortData.length; z++) {
            $('#my-selects').append(`<option value=${sortData[z].MAC_NBR} >${sortData[z].MAC_NO}</option>`)
        }
        // 缺一不可  
        $('#my-selects').selectpicker('refresh');
        $('#my-selects').selectpicker('render');
    })

    var mdaMessageData = [],
        step = 4, //步长
        ifClick = true;
    $('.Alarmpie')[0].onscroll = () => {
        if (mdaMessageData.length == 0) {
            return false;
        }
        var bottomScroll = $('.Alarmpie')[0].scrollHeight - ($('.Alarmpie').scrollTop() + $('.Alarmpie').height()),
            para = '';
        if (bottomScroll <= 200) {
            if (ifClick == true) {
                for (let index = 0; index < step; index++) {
                    if (mdaMessageData.length == $('.lazyLoad').length) {
                        break;
                    }
                    para = para + ',' + mdaMessageData[$('.lazyLoad').length + index];
                    //判断是否加载完成
                }
                if (para != '')
                    $scope.GetValue(para);
                ifClick = false;
            }
        }
    }

    $scope.defaultsLoding = () => {
        $http.get('/main/getUserMachineList').success(function(data) {
            if (data.Data.GetAllMachineList.length != 0) {
                let Lhdata = LhsortData(data);
                GetMacNameListDataAll = data;
                data.Data.GetAllMachineList = Lhdata;
                for (let i = 0; i < data.Data.GetAllMachineList.length; i++) {
                    if(data.Data.GetAllMachineList[i].MAC_NBR != null){
                        mdaMessageData.push(data.Data.GetAllMachineList[i].MAC_NBR);
                    }
                }
                var para;
                for (let index = 0; index < step; index++) {
                    if (para === undefined) {
                        para = mdaMessageData[index];
                    } else {
                        para = para + ',' + mdaMessageData[index];
                    }
                }
                $scope.GetValue(para);
            }
        })
    }
    $scope.defaultsLoding();

    $scope.search = () => {
        mdaMessageData = $('#my-selects').val();
        var para;
        var leng = mdaMessageData.length >= step ? step : mdaMessageData.length;

        for (let index = 0; index < leng; index++) {
            if (para === undefined) {
                para = mdaMessageData[index];
            } else {
                para = para + ',' + mdaMessageData[index];
            }
        }
        $('.Alarmpie').empty();
        $scope.GetValue(para);
    }

    //新增报警查询导出功能 htc:20180625
    $scope.export = () => {
        if ($("#my-selects").val() == null) { BzAlert("请选择设备编号！"); return; }
        var keyValue = JSON.stringify({
            factory_name: $("#input_MAC_NBRname").val(),
            start_time: moment($('#startTime').val()).format('YYYY/MM/DD'),
            end_time: moment($('#endTime').val()).format('YYYY/MM/DD'),

            mars: $("#my-selects").val().join(","),
            dt_begin: moment($('#startTime').val()).add(1, 'd').format('YYYY-MM-DD hh:MM:ss'),
            dt_end: moment($('#endTime').val()).format('YYYY-MM-DD hh:MM:ss')
        })
        window.open('/MachineAlarm/r/outExcel?keyValue=' + keyValue);
    };

    $scope.GetValue = (id) => {
        var data = {
            begin_date: $('#startTime').val(),
            end_date: $('#endTime').val(),
            mars_nbrs: id
        }
        $http.post('/MachineAlarm/GetASlarmDataList', data).success(function(result) {
            let templist = _.groupBy(result.Data, 'MAC_NBR');
            for (var i in templist) {
                let COUNTER = 0;
                let tempCount = _.sortBy(templist[i], function(item) {
                    return -item.COUNTER;
                });
                var Data = [],
                    AllCount = 0,
                    title;
                for (var j = 0; j < tempCount.length; j++) {
                    title = (tempCount[j].CODE_NO == null ? '' : tempCount[j].CODE_NO) + ' ' + tempCount[j].CATEGORY + ' ' + tempCount[j].MAC_NAME + ' ' + tempCount[j].MAC_NO;
                    if (j > 4) {
                        COUNTER += tempCount[j].COUNTER
                    } else
                        Data.push({
                            name: tempCount[j].ALARM_NO,
                            mac: i,
                            y: tempCount[j].COUNTER
                        })
                }
                if (COUNTER > 0) {
                    Data.push({
                        name: lang.Alarm.Other,
                        mac: i,
                        y: COUNTER
                    })
                }

                $('.Alarmpie').append(`<div id='container${i}' class='lazyLoad'></div><hr>`);
                Highcharts.chart(`container${i}`, {
                    title: {
                        text: title,
                        style: {
                            fontWeight: 600,
                        }
                    },
                    subtitle: {
                        text: lang.Alarm.AlarmStatus
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
                            lang.Alarm.Number + ': <b>{point.y}</b><br/>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true, // 可以被选择
                            cursor: 'pointer', // 鼠标样式
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        },
                        series: {
                            events: {
                                click: function(event) {
                                    DrawTable(event.point.mac, $('#startTime').val(), $('#endTime').val(), event.point.name)
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Alarm',
                        data: Data
                    }]
                });
            }
            ifClick = true;
        })
    }
}])

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
        GetMacNameListData = data;
        for(let z = 0; z <GetMacNameListData.Data.submacInfo.length;z++){
            for(let m = 0; m < GetMacNameListData.Data.rootMacInfo.length;m++){
                if(GetMacNameListData.Data.submacInfo[z].GP_NAME === GetMacNameListData.Data.rootMacInfo[m].GP_NAME){
                    GetMacNameListData.Data.rootMacInfo[m].paixu = z;
                }
            }
        }
         //拿到没有排序的添加paixu -1
         for(let qq = 0; qq < GetMacNameListData.Data.rootMacInfo.length;qq++){
            if(GetMacNameListData.Data.rootMacInfo[qq].paixu == undefined){
                GetMacNameListData.Data.rootMacInfo[qq].paixu = -1
            }
        }
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
            $('#my-select').append(`<option value=${description[i].CATEGORY} >${description[i].CATEGORY}</option>`)
        }
        // 缺一不可  
        $('#my-select').selectpicker('refresh');
        $('#my-select').selectpicker('render');
    })
}

function f_edit(e) {
    $.x5window(lang.Alarm.Edit, kendo.template($("#popup-add").html()));
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
        $.post("/Alarm/UpdAlarm", json, function(data) {
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
function DrawTable(machine, strdate, enddate, alarm) {
    if (alarm == lang.Alarm.Other) {
        $("#hisTable").grid("refresh", function() {
            return [{
                filters: [
                    { field: "ALARM_DATE", Operator: "gte", value: strdate },
                    { field: "ALARM_DATE", Operator: "lte", value: enddate }
                ],
                logic: "and"
            }, { field: "MAC_NBR", Operator: "eq", value: machine }]
        }, {
            logic: "and"
        });
    } else {
        $("#hisTable").grid("refresh", function() {
            return [{
                    filters: [
                        { field: "ALARM_DATE", Operator: "gte", value: strdate },
                        { field: "ALARM_DATE", Operator: "lte", value: enddate }
                    ],
                    logic: "and"
                }, { field: "MAC_NBR", Operator: "eq", value: machine },
                { field: "ALARM_NO", Operator: "eq", value: alarm }
            ]
        }, {
            logic: "and"
        });
    }

}
//按照多个字段排序
function compare(name, minor) {
    return function(o, p) {
        var a, b;
        if (o && p && typeof o === 'object' && typeof p === 'object') {
            a = o[name];
            b = p[name];
            if (a === b) {
                return typeof minor === 'function' ? minor(o, p) : 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        } else {
            console.log("error");
        }
    }
}