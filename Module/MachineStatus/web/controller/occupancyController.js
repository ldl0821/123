var groupOrMachine;
var Chart;
groupType = 1; //默认设备方式
$(function() {
    $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
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
        url: "/machine/GetAllMachineAndMachineGroup_CustomerParameter",
        url2: "/machine/GetKeywordMachinelist",
        type: 2,
        data: {
            groupID: 0
        },
        checkbox: true
    }).data("BZ-multipleComboxTree");
    $('input[name="searchType"]').change(function() {
        var url, url2, checkChildren, type;
        if ($(this).val() == 1) { //设备组
            url = "/machine/GetAllMachineAndMachineGroup_CustomerParameter";
            url2 = "/machine/GetKeywordMachinelist";
            checkChildren = true;
            $("#groupOrMachine").data("BZ-multipleComboxTree").TreeData.options.checkboxes.checkChildren = true;
            type = 2;
            $("#groupOrMachine_text").text(lang.EmployeePerformance.Equipment);
            groupOrMac = 1;
        } else { //设备
            url = "/machine/GetGrouplist_Customer";
            url2 = "/machine/GetKeywordGrouplist";
            checkChildren = false;
            $("#groupOrMachine").data("BZ-multipleComboxTree").TreeData.options.checkboxes.checkChildren = false;
            type = 1;
            $("#groupOrMachine_text").text(lang.Efficiencystatistics.EquipmentGroup);
            groupOrMac = 2;
        }
        $("#groupOrMachine").data("BZ-multipleComboxTree")._setOptions({
            type: type,
            url: url,
            url2: url2,
            checkChildren: checkChildren
        });
        $("#groupOrMachine").data("BZ-multipleComboxTree").clear();
    });


    $(".grouptype li").on('click', function() {
        $('.grouptype li').removeClass('active');
        $(this).addClass('active');
        if ($(this).find('a').attr("data-title") == "1") {
            groupType = 1; //时间
        } else {
            groupType = 2; //员工
        }
        $("#search").trigger("click");
    });

    $("#search").click(function(e, sid) {
        $.ajaxSetup({
            async: false
        });
        var url = "/statusdata/GetStatusData";
        if (sid == null) {
            $.post(url, function(data) {
                sid = data.Data[0].STATUS_NBR;
            });
        }
        var machines = [];
        for (var m in groupOrMachine.dataAarry) {
            machines.push(parseInt(m));
        }
        if (machines.length == 0)
            return;
        var IsGroup = false;
        if ($('input[name="searchType"]:checked').val() == 1) { //设备
            url = "/statusrate/GetStatusOccupancy";
        } else { //设备组
            url = "/statusrate/GetStatusOccupancyGroup";
            IsGroup = true;
        }
        var showDetails = $('input[name="detailshow"]').prop("checked");

        var data = {
            Type: parseInt($("#totalType").data("kendoComboBox").value()),
            machineIds: JSON.stringify(machines),
            dt: $("#startTime").val(),
            et: $("#endTime").val(),
            ShowDetails: showDetails,
        };
        $.ajaxSetup({
            async: true
        });
        var pieChecked = $('input[name="pieshow"]').prop("checked");
        $.post(url, data, function(data) {
            var startDate = moment($("#startTime").data("kendoDatePicker").value()).format("YYYY-MM-DD");
            var endDate = moment($("#endTime").data("kendoDatePicker").value()).format("YYYY-MM-DD");
            if (pieChecked == 1) { //是否画饼图
                $("#pie").show();
                $("#hisChart").hide();
                $("#sliders").hide();
                var categories = [];
                if (data.Status == 0) {
                    if (data.Data.length > 0) {
                        $(".pie").remove();
                        var diff = {};
                        var machine = {};
                        var vass = $("#totalType").data("kendoComboBox").value();
                        for (var i = 0; i < data.Data.length; i++) {
                            machine[data.Data[i].Return_Name] = data.Data[i].Return_Name;
                            if (vass == 1) {
                                diff[data.Data[i].STATISTICS + data.Data[i].SHIFT_NAME] = data.Data[i].STATISTICS + data.Data[i].SHIFT_NAME;
                                data.Data[i].STATISTICS = data.Data[i].STATISTICS + data.Data[i].SHIFT_NAME;
                            } else if (vass == 2) {
                                diff[data.Data[i].STATISTICS] = data.Data[i].STATISTICS;
                            } else if (vass == 3) {
                                diff[data.Data[i].STATISTICS + lang.EmployeePerformance.The + data.Data[i].WEEK + lang.EmployeePerformance.Weeks] = data.Data[i].STATISTICS + lang.EmployeePerformance.The + data.Data[i].WEEK + lang.EmployeePerformance.Weeks;
                                data.Data[i].STATISTICS = data.Data[i].STATISTICS + lang.EmployeePerformance.The + data.Data[i].WEEK + lang.EmployeePerformance.Weeks;
                            } else if (vass == 4) {
                                diff[moment(data.Data[i].DATE).format("YYYY-MM")] = moment(data.Data[i].DATE).format("YYYY-MM");
                                data.Data[i].STATISTICS = moment(data.Data[i].DATE).format("YYYY-MM");
                            } else if (vass == 5) {
                                diff[moment(data.Data[i].DATE).format("YYYY")] = moment(data.Data[i].DATE).format("YYYY");
                                data.Data[i].STATISTICS = moment(data.Data[i].DATE).format("YYYY");
                            }
                        }

                        for (var i in diff) {
                            var data1 = _.where(data.Data, { STATISTICS: i });
                            for (var j in machine) {
                                var tjson = {};
                                var data2 = _.where(data1, { Return_Name: j });
                                if (data2.length == 0)
                                    continue;
                                tjson.data = [];

                                for (var k = 0; k < data2.length; k++) {
                                    tjson.name = data2[k].Return_Name;
                                    var sdata = {
                                        name: data2[k].STATUS_NAME,
                                        y: data2[k].Rate,
                                        color: data2[k].COLOR,
                                        time: (data2[k].DURATION / 3600.00).toFixed(2)
                                    };
                                    tjson.data.push(sdata);
                                }
                                i = i.replace(/\//g, "-");
                                var html = '<div class="pie" id="pie' + "_" + i + "_" + j + '"></div>';
                                $("#pie").append($(html));
                                drawPieChart('#pie' + "_" + i + "_" + j, [tjson], i, tjson.name);
                            }

                        }
                    }
                }
            } else {
                $("#pie").hide();
                $("#hisChart").show();
                $(".hisChart").remove();
                var categories = [];
                if (data.Status == 0) { //-----------------------------------------------------------------------------A
                    if (data.Data.length > 0) { //-----------------------------------------------------------------------------B
                        var status = {};
                        var vass = $("#totalType").data("kendoComboBox").value();

                        if (groupType == 1) { //-------------------------------------------------------------------按机床名称显示

                            for (var i = 0; i < machines.length; i++) {
                                categories = [];
                                var machineName = "";
                                var datatemp = _.where(data.Data, { Return_id: machines[i] });
                                if (datatemp.length == 0)
                                    continue;
                                for (var j = 0; j < datatemp.length; j++) {
                                    machineName = datatemp[j].Return_Name;
                                    status[datatemp[j].STATUS_NAME] = datatemp[j].STATUS_NAME;
                                    if (vass == 1) {
                                        categories.push(datatemp[j].STATISTICS + datatemp[j].SHIFT_NAME);
                                        datatemp[j].STATISTICS = datatemp[j].STATISTICS + datatemp[j].SHIFT_NAME;
                                    } else if (vass == 2) {
                                        categories.push(datatemp[j].STATISTICS);
                                    } else if (vass == 3) {
                                        categories.push(datatemp[j].STATISTICS + lang.EmployeePerformance.The + datatemp[j].WEEK + lang.EmployeePerformance.Weeks);
                                        datatemp[j].STATISTICS = datatemp[j].STATISTICS + lang.EmployeePerformance.The + datatemp[j].WEEK + lang.EmployeePerformance.Weeks;
                                    } else if (vass == 4) {
                                        categories.push(moment(datatemp[j].Date).format("YYYY-MM"));
                                        datatemp[j].STATISTICS = moment(datatemp[j].Date).format("YYYY-MM");
                                    } else if (vass == 5) {
                                        categories.push(moment(datatemp[j].Date).format("YYYY"));
                                        datatemp[j].STATISTICS = moment(datatemp[j].Date).format("YYYY");
                                    }
                                }

                                categories = unique(categories);
                                var ydata = [];
                                for (var item in status) {
                                    var tjson = {};
                                    tjson.name = item;
                                    tjson.data = [];
                                    tjson.time = [];
                                    var data1 = _.where(datatemp, { STATUS_NAME: item });
                                    for (var k = 0; k < categories.length; k++) {
                                        var data2 = _.where(data1, { STATISTICS: categories[k] })
                                        if (data2.length == 0) {
                                            tjson.data.push(null);
                                            tjson.time.push(null);
                                        } else {
                                            tjson.data.push(data2[0].Rate * 100);
                                            tjson.color = '#' + data2[0].COLOR.Name;
                                            tjson.time.push((data2[0].DURATION / 3600.0).toFixed(2));
                                        }
                                    }
                                    tjson.stack = 1;
                                    ydata.push(tjson);
                                }
                                var par = {
                                    type: "column",
                                    xdata: categories,
                                    ydata: ydata,
                                    stacking: true,
                                    subtitle: machineName
                                }
                                var html = '<div class="hisChart" id="hisChart' + "_" + i + '"></div>';
                                $("#hisChart").append($(html));
                                drawHisChart('#hisChart' + "_" + i, par);
                            }
                        } else { //-----------------------------------------------------------------------------------按日期显示
                            var machinelist = {};
                            diff = {};
                            for (var i = 0; i < data.Data.length; i++) {
                                status[data.Data[i].STATUS_NAME] = data.Data[i].STATUS_NAME;
                                machinelist[data.Data[i].Return_Name] = data.Data[i].Return_Name;

                                if (vass == 1) {
                                    data.Data[i].STATISTICS = data.Data[i].STATISTICS + data.Data[i].SHIFT_NAME;
                                } else if (vass == 2) {

                                } else if (vass == 3) {
                                    data.Data[i].STATISTICS = data.Data[i].STATISTICS + lang.EmployeePerformance.The + data.Data[i].WEEK + lang.EmployeePerformance.Weeks;
                                } else if (vass == 4) {
                                    data.Data[i].STATISTICS = moment(data.Data[i].Date).format("YYYY-MM");
                                } else if (vass == 5) {
                                    data.Data[i].STATISTICS = moment(data.Data[i].Date).format("YYYY");
                                }
                                diff[data.Data[i].STATISTICS] = data.Data[i].STATISTICS;
                            }

                            for (var temp in machinelist) {
                                categories.push(machinelist[temp]);
                            }
                            for (var mm in diff) {
                                var dat = _.where(data.Data, { STATISTICS: mm })
                                var ydata = [];
                                for (var item in status) {
                                    var tjson = {};
                                    tjson.name = item;
                                    tjson.data = [];
                                    tjson.time = [];
                                    var data1 = _.where(dat, { STATUS_NAME: item });
                                    for (var k = 0; k < categories.length; k++) {
                                        var data2 = _.where(data1, { Return_Name: categories[k] })
                                        if (data2.length == 0) {
                                            tjson.data.push(null);
                                            tjson.time.push(null);
                                        } else {
                                            tjson.data.push(data2[0].Rate * 100);
                                            tjson.color = '#' + data2[0].COLOR.Name;
                                            tjson.time.push((data2[0].DURATION / 3600.0).toFixed(2));
                                        }
                                    }
                                    tjson.stack = 1;
                                    ydata.push(tjson);
                                }
                                var par = {
                                    type: "column",
                                    xdata: categories,
                                    ydata: ydata,
                                    stacking: true,
                                    subtitle: mm
                                }
                                var html = '<div class="hisChart" id="hisChart' + "_" + mm + '"></div>';
                                $("#hisChart").append($(html));
                                drawHisChart('#hisChart' + "_" + mm, par);
                            }

                        }

                    } //-------------------------------------------------------------------------------------------------------B
                } //---------------------------------------------------------------------------------------------------A
            }
        })

    })



})


function unique(arr) {
    var result = [],
        hash = {};
    for (var i = 0, elem;
        (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}

function drawHisChart(ele, data) {
    Chart = $(ele).hisChartStateShare({
        type: data.type == undefined ? "column" : data.type,
        title: lang.MachineStatus.StateOccupancyDistributionDiagram,
        subtitle: data.subtitle == undefined ? "" : data.subtitle,
        categories: data.xdata == undefined ? [] : data.xdata,
        dataSource: data.ydata == undefined ? [] : data.ydata,
        stacking: data.stacking == true ? "normal" : null
    }).data("BZ-hisChartStateShare");
}
//饼图
function drawPieChart(ele, data, title, subtitle) {
    console.log(this.key)
    $(ele).highcharts({
        chart: {
            type: "pie",
            options3d: {
                enabled: true,
                alpha: 45
            }
        },
        title: {
            text: title,
            style: {
                fontfamily: "Helvetica Neue,Microsoft Yahei,Hiragino Sans GB,WenQuanYi Micro Hei,sans-serif;",
                fontWeight: "bold",
                color: "#000"
            },
            y: 30
        },
        subtitle: {
            text: subtitle,
            style: {
                fontfamily: "Helvetica Neue,Microsoft Yahei,Hiragino Sans GB,WenQuanYi Micro Hei,sans-serif;",
                fontWeight: "bold",
                color: "#000"
            },
            y: 50
        },
        tooltip: {
            formatter: function() {
                return '<b>' + this.key + ': ' + this.percentage.toFixed(1) + '%</b><br/>' +
                    lang.Common.Time + ': ' + this.point.options.time + lang.EmployeePerformance.Hours;
            },
            shared: true
        },
        plotOptions: {
            pie: {
                innerSize: 180,
                depth: 45,
                minSize: 250,
                Size: 250,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(1) + '%<br/>' + this.point.options.time + lang.EmployeePerformance.Hours;
                    }
                }
            }
        },
        credits: {
            enabled: false
        },
        series: data
    });
}