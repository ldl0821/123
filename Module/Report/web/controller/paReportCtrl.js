var par;
var selectedName;
var reportType = 1;
var excelType = 0;
var isTimePeriod = 0; //0不是，1是
app.controller('reportctrl', ['$scope', '$http', function ($scope, $http) {
    var reportAlarm = ["0~24小时的规则导出", "自定义24小时时间段：如08:30~08:30", "以输入的开始日期到结束时间整块导出", "按配置的班次时间段导出，无排班的天导出的数据为空"];
    $("#typeAlarm").html("(" + reportAlarm[0] + ")");
    // $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: moment(new Date()).subtract(7, 'days').set('hour', 0).set('minutes', 0).set('seconds', 0).format('YYYY/MM/DD HH:mm:ss'), interval: 1, timeFormat: "HH:mm:ss" });
    // $("#startHM").kendoTimePicker({ interval: 15, format: "HH:mm", timeFormat: "HH:mm" });
    // $("#endTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date(), interval: 1, timeFormat: "HH:mm:ss" });
    // $("#endHM").kendoTimePicker({ interval: 15, format: "HH:mm", timeFormat: "HH:mm" });

    $("#startTime").kendoDateTimePicker({
        format: "yyyy/MM/dd HH:mm:ss",
        value: moment(new Date()).subtract(7, 'days').set('hour', 0).set('minutes', 0).set('seconds', 0).format('YYYY/MM/DD HH:mm:ss'),
        interval: 1,
        timeFormat: "HH:mm:ss"
    });
    $("#endTime").kendoDateTimePicker({
        format: "yyyy/MM/dd HH:mm:ss",
        value: new Date(),
        interval: 1,
        timeFormat: "HH:mm:ss"
    });
    $("#startTime2").kendoDatePicker({
        format: "yyyy/MM/dd",
        value: moment(new Date()).subtract(7, 'days').set('hour', 0).set('minutes', 0).set('seconds', 0).format('YYYY/MM/DD HH:mm:ss'),
        interval: 1,
        timeFormat: "HH:mm:ss"
    });
    $("#endTime2").kendoDatePicker({
        format: "yyyy/MM/dd",
        value: new Date(),
        interval: 1,
        timeFormat: "HH:mm:ss"
    });
    

    MAC_NBR = $("#MAC_NBRname").comboxTree({
        url: "/Main/GetUserMacGroup",
        data: {
            groupID: 0
        },
        treetemplate: $("#treeview-templates").html(),
        width: 184,
        diffwidth: 27,
        type: 2,
    });
    $('#input_MAC_NBRname').attr('readonly', 'readonly');
    $('#my-select').change(function () {
        $('#my-selects').html('');
        for (let i = 0; i < $('#my-select').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-select').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    $('#my-selects').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                }
            }
        }
        $('#my-selects').selectpicker('refresh');
        $('#my-selects').selectpicker('render');
    })
    $http.get('/reports/GetRepostName').success(function (data) {
        if (data.Status == 0) {
            par = data.par;
            $("#orgnizetree").kendoTreeView({
                dataSource: {
                    data: gettreeReport(data.Data)
                },
                template: kendo.template($("#treeview-template").html()),
                select: function (e) {
                    var name = $(e.node).find('[attr="treenode"]').text();
                    renderReport(name);
                    selectedName = name;
                }
            }).data("kendoTreeView").collapse(".k-item");
            if (data.Data.length > 0) {
                var treeview = $("#orgnizetree").data("kendoTreeView")
                treeview.select($(".k-item:first"));
                renderReport($(treeview.select()).find('.k-state-selected span').text());
            }
        } else {
            BzAlert(data.Message);
        }
    })

    //不同报表显示不同的查询条件 htc:20180831
    $("#orgnizetree").on('click', 'ul li', function () {
        excelType = $(this).index();
        changeType(excelType);
    });

    $("#reportType").change(function () {
        var index = $('#reportType').prop('selectedIndex');
        $("#typeAlarm").html("(" + reportAlarm[index] + ")");

        reportType = parseInt($(this).val());
        console.log($("#reportType option:selected").text());
        if (reportType == 2 && $("#reportType option:selected").text().trim() == "自定义天") {
            $("#PeriodTime").removeClass("hiddenDom");
            $("#NoZDY_Day").addClass("hiddenDom");
            $("#ZDY_Day").removeClass("hiddenDom");
            
            $("#startPeriodTime").blur(() => {
                $("#endPeriodTime").val($("#startPeriodTime").val());
            })
        } else {
            $("#NoZDY_Day").removeClass("hiddenDom");
            $("#ZDY_Day").addClass("hiddenDom");
            $("#PeriodTime").addClass("hiddenDom");
        }
    });

    //
    $("#startPeriodTime").kendoTimePicker({
        interval: 15,
        format: "HH:mm",
        timeFormat: "HH:mm"
    });
    $("#endPeriodTime").kendoTimePicker({
        interval: 15,
        format: "HH:mm",
        timeFormat: "HH:mm"
    });
}])

//不同类型处理 htc:20180903
function changeType(excelType) {
    if (excelType == 0) {
        $("#reportSpan").removeClass("hiddenDom");
        $("#PeriodTime").removeClass("hiddenDom");

        var rt = $("#reportType").val();
        if (rt == 2 && $("#reportType option:selected").text().trim() == "自定义天") {
            $("#PeriodTime").removeClass("hiddenDom");
            $("#NoZDY_Day").addClass("hiddenDom");
            $("#ZDY_Day").removeClass("hiddenDom");
        } else {
            $("#PeriodTime").addClass("hiddenDom");
            $("#NoZDY_Day").removeClass("hiddenDom");
            $("#ZDY_Day").addClass("hiddenDom");
        };

        $("#reportType").change(function () {
            reportType = parseInt($(this).val());
            if (reportType == 2 && $("#reportType option:selected").text().trim() == "自定义天") {
                $("#PeriodTime").removeClass("hiddenDom");

                $("#startPeriodTime").blur(() => {
                    $("#endPeriodTime").val($("#startPeriodTime").val());
                })
            } else {
                $("#PeriodTime").addClass("hiddenDom");
            }
        });
    } else {
        $("#reportSpan").addClass("hiddenDom");
        $("#PeriodTime").addClass("hiddenDom");
        $("#NoZDY_Day").removeClass("hiddenDom");
        $("#ZDY_Day").addClass("hiddenDom");
    }
}

function gettreeReport(data) {
    var dd = [];
    for (var i = 0; i < data.length; i++) {
        var tjson = {};
        tjson.text = data[i];
        tjson.icon = "icon-list-alt";
        dd.push(tjson);
    }
    return dd;
}

//生成报表查询界面
function renderReport(name) {}

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
            if (!b) {
                arr.push(list[i]);
            }
        }
    }
    return arr;
}

function addOnClick(_salf) {
    $('#input_MAC_NBRname').val($(_salf).text());
    var thisSpan = _salf;
    $.post('/Main/GetMacNameList', {
        nodeID: $(thisSpan).attr('nodeid')
    }, (data) => {
        GetMacNameListData = data;
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

//报表导出 htc:20180806
$("#searchData").click(function () {
    selectedName == undefined ? selectedName = $("span[attr='treenode']").eq(0).text() : selectedName = selectedName;

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
    if (!moment($('#startTime').val()).isBefore($('#endTime').val())) {
        BzAlert(lang.Common.EndTimeIsNotLessThanStartTime);
        return;
    }

    // if (selectedName == "设备参数报表" && $('#my-selects').val().length != 1) {
    //     BzAlert("设备参数报表只能选择一台设备！");
    //     return;
    // }
    //导出类型为时间段时时间必选
    if ((excelType == 0 || excelType == 3) && (reportType == 2 && $("#reportType option:selected").text().trim() == "自定义天")) {
        if ($("#startPeriodTime").val() == "" || $("#startPeriodTime").val() != $("#endPeriodTime").val()) {
            BzAlert("导出类型为自定义天时开始和结束时间不能为空且必须相等(24小时)！");
            return;
        }
        isTimePeriod = 1;
    } else {
        isTimePeriod = 0;
    }

    // var startTime, endTime;
    // var startHM = $("#startHM").val();
    // var endHM = $("#endHM").val();
    // var type;
    // if ((startHM != "" && endHM == "") || (startHM == "" && endHM != "")) {
    //     BzAlert("时分不可单一!");
    //     return;
    // }

    // if (startHM == endHM) {
    //     if (startHM != "") {
    //         if (startHM.split(":")[0] == '00') {
    //             startTime = moment($("#startTime").val()).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //             endTime = moment($("#endTime").val()).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //             type = 0;
    //         } else {
    //             startTime = moment($("#startTime").val()).set('hour', startHM.split(":")[0]).set('minute', startHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //             endTime = moment($("#endTime").val()).set('hour', endHM.split(":")[0]).set('minute', endHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //             type = 1;
    //         }
    //     } else {
    //         startTime = moment($("#startTime").val()).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //         endTime = moment($("#endTime").val()).set('hour', 0).set('minute', 0).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //         type = 0;
    //     }
    // } else {
    //     if ((startHM.split(":")[0] != endHM.split(":")[0] && parseFloat(endHM.split(":")[0]) > parseFloat(startHM.split(":")[0])) ||
    //         (startHM.split(":")[0] == endHM.split(":")[0] && parseFloat(endHM.split(":")[1]) > parseFloat(startHM.split(":")[1]))
    //     ) { //非跨天
    //         startTime = moment($("#startTime").val()).set('hour', startHM.split(":")[0]).set('minute', startHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //         endTime = moment($("#endTime").val()).set('hour', endHM.split(":")[0]).set('minute', endHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //         type = 0;
    //     } else { //跨天
    //         startTime = moment($("#startTime").val()).set('hour', startHM.split(":")[0]).set('minute', startHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //         endTime = moment($("#endTime").val()).set('hour', endHM.split(":")[0]).set('minute', endHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    //         type = 1;
    //     }
    // }


    var keyValue = {
        exportName: selectedName,
        isAcrossDay: 1,
        macGroupName: $("#input_MAC_NBRname").val(),

        factory_name: $("#input_MAC_NBRname").val(),
        start_time: moment($('#startTime').val()).format('YYYY/MM/DD'),
        end_time: moment($('#endTime').val()).format('YYYY/MM/DD'),

        MARS: $("#my-selects").val().join(","),
        // BEGIN_DATE: startTime,
        // END_DATE: endTime,
        BEGIN_DATE: moment($('#startTime').val()).format('YYYY/MM/DD HH:mm:ss'),
        END_DATE: moment($('#endTime').val()).format('YYYY/MM/DD HH:mm:ss'),
        Flag: parseInt($("#reportType").val())
    };

    //是否为时间段
    var startHM = $("#startPeriodTime").val();
    var endHM = $("#endPeriodTime").val();
    if (isTimePeriod == 1) {
        keyValue.BEGIN_DATE = moment($("#startTime2").val()).set('hour', startHM.split(":")[0]).set('minute', startHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
        keyValue.END_DATE = moment($("#endTime2").val()).set('hour', endHM.split(":")[0]).set('minute', endHM.split(":")[1]).set('second', 0).format('YYYY/MM/DD HH:mm:ss');
    }

    console.log(JSON.stringify(keyValue));
    window.open('/reports/r/outExcel?keyValue=' + JSON.stringify(keyValue));
});