var groupOrMachine;
var Chart;
var groupType = 1; //默认设备方式
var baseUrl = "/machineactivation/";
var groupOrMac = 1;
$(function() {
    $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
    $("#endTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
    $("#totalType").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: [
            { text: lang.EmployeePerformance.Shift, value: 1 },
            { text: lang.EmployeePerformance.Day, value: 2 },
            { text: lang.EmployeePerformance.Weeks, value: 3 },
            { text: lang.EmployeePerformance.Month, value: 4 },
            { text: lang.EmployeePerformance.Years, value: 5 }
        ],
        change: onChange,
        value: 2
    });

    function onChange() {
        var value = $("#totalType").val();
        $("#totalType_listbox").toggleClass(lang.EmployeePerformance.Shift, value == 1)
            .toggleClass(lang.EmployeePerformance.Day, value == 2)
            .toggleClass(lang.EmployeePerformance.Weeks, value == 3)
            .toggleClass(lang.EmployeePerformance.Month, value == 4)
            .toggleClass(lang.EmployeePerformance.Years, value == 5);
    };
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
            groupType = 1;
        } else {
            groupType = 2;
        }
        chart(resultData);
    });

    $("#search").click(function() {
        var machines = '';
        for (var m in groupOrMachine.dataAarry) {
            machines += parseInt(m) + ',';
        }
        machines = machines.substring(0, machines.length - 1);
        if (machines.length == 0) {
            return;
        }

        var data = {
            beginDay: $("#startTime").val(),
            endDay: $("#endTime").val(),
            macine_type: Number($("input[name='searchType']:checked").val()),
            formula: 2,
            date_type: parseInt($("#totalType").data("kendoDropDownList").value()),
            machine_nbrs: $("input[name='searchType']:checked").val() == 1 ? machines : 0,
            machine_group: $("input[name='searchType']:checked").val() == 2 ? machines : 0

        };
        var url = '/machineactivation/r/getData';
        $.post(url, (data), function(data) {
            if (data.Status == 0) {
                //console.log(data)
                resultData = data.Data;
                chart(resultData);
            } else {
                BzAlert(data.Message);
            }
        });
    });
    $("#output").on('click', function() {
        var machines = '';
        for (var m in groupOrMachine.dataAarry) {
            machines += parseInt(m) + ',';
        }
        machines = machines.substring(0, machines.length - 1);
        if (machines.length == 0) {
            return;
        }
        var data = {
            beginDay: $("#startTime").val(),
            endDay: $("#endTime").val(),
            macine_type: Number($("input[name='searchType']:checked").val()),
            formula: 2,
            date_type: parseInt($("#totalType").data("kendoDropDownList").value()),
            machine_nbrs: $("input[name='searchType']:checked").val() == 1 ? machines : 0,
            machine_group: $("input[name='searchType']:checked").val() == 2 ? machines : 0

        };
        var url = '/machineactivation/r/getData';
        window.open("/wfMachineOutPutIndex?par=" + JSON.stringify(data) + "&url=" + url + "&groupOrMac=" + groupOrMac + "&lunchTime=" + $('#lunchTime').val() + "&restTime=" + $('#restTime').val());
    });

});


function chart(dataSource) {
    $("#hisChart").html("");
    var list = [];

    if (groupType == 1) {
        list = _.groupBy(dataSource, 'MAC_NAME');
        for (var key in list) {
            $("#hisChart").append('<div id="hisChart_' + key + '" style="min-width:700px;height:500px"></div>');
            var data = {}
            data.xdata = [];
            data.ydata = [];
            data.title = "";
            data.ele = "#hisChart_" + key;

            switch ($("#totalType").data("kendoDropDownList").value()) {
                case "1":
                    var name = $("input[name='searchType']:checked").val() == 1 ? list[key][0]['MAC_NAME'] : list[key][0]['GP_NAME'];
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    data.xdata = (function() { //班次X轴坐标
                        var arr = [];
                        list[key].forEach(function(v, i) {
                            if (arr.indexOf(moment(v.NATURE_DAY).format('YYYY-MM-DD')) == -1) {
                                arr.push(moment(v.NATURE_DAY).format('YYYY-MM-DD'));
                            }
                        })
                        return arr;
                    })()

                    var shift = (function() {
                        var arr = [];
                        list[key].forEach(function(v, i) {
                            if (arr.indexOf(v.SHIFT_NAME) == -1) {
                                arr.push(v.SHIFT_NAME);
                            }
                        })
                        return arr;
                    })()

                    shift.forEach(function(v, i) {
                        data.ydata.push({
                            name: v,
                            data: (function() {
                                var arr = [];
                                data.xdata.forEach(function(v, i) {
                                    arr[i] = 0;
                                })
                                return arr;
                            })()
                        })
                    })

                    data.ydata.forEach(function(v, i) {
                        data.xdata.forEach(function(m, n) {
                            list[key].forEach(function(j, k) {
                                if (v.name == j.SHIFT_NAME && m == moment(v.NATURE_DAY).format('YYYY-MM-DD')) {
                                    v.data[n] = j.ACTIVATION_RATE * 100;
                                }
                            })
                        })

                    })
                    drawHisChart(data);


                    break;
                case "2":
                    var name = $("input[name='searchType']:checked").val() == 1 ? list[key][0]['MAC_NAME'] : list[key][0]['GP_NAME'];
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    data.ydata[0] = {
                        name: name,
                        data: []
                    }

                    list[key].forEach(function(v, i) {
                        data.xdata.push(moment(v.NATURE_DAY).format('YYYY-MM-DD'));
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
                case "3":

                    var name = $("input[name='searchType']:checked").val() == 1 ? list[key][0]['MAC_NAME'] : list[key][0]['GP_NAME'];
                    data.ydata[0] = {
                        name: name,
                        data: []
                    }
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    list[key].forEach(function(v, i) {
                        data.xdata.push(v.NATURE_DAY);
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
                case "4":
                    var name = $("input[name='searchType']:checked").val() == 1 ? list[key][0]['MAC_NAME'] : list[key][0]['GP_NAME'];
                    data.ydata[0] = {
                        name: name,
                        data: []
                    }
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    list[key].forEach(function(v, i) {
                        data.xdata.push(v.NATURE_DAY);
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
                case "5":
                    var name = $("input[name='searchType']:checked").val() == 1 ? list[key][0]['MAC_NAME'] : list[key][0]['GP_NAME'];
                    data.ydata[0] = {
                        name: name,
                        data: []
                    }
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    list[key].forEach(function(v, i) {
                        data.xdata.push(v.NATURE_DAY);
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
            }
        }
    } else {
        list = _.groupBy(dataSource, 'NATURE_DAY');
        var kk = 1;
        for (var key in list) {
            $("#hisChart").append('<div id="hisChart_' + kk + '" style="min-width:700px;height:500px"></div>');
            var data = {}
            data.xdata = [];
            data.ydata = [];
            data.title = "";
            data.ele = "#hisChart_" + kk;
            kk++;
            switch ($("#totalType").data("kendoDropDownList").value()) {
                case "1":
                    var name = moment(list[key][0]['NATURE_DAY']).format('YYYY-MM-DD');
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    data.xdata = (function() { //班次X轴坐标
                        var arr = [];
                        list[key].forEach(function(v, i) {
                            if (arr.indexOf(v.MAC_NAME) == -1) {
                                arr.push(v.MAC_NAME);
                            }
                        })
                        return arr;
                    })()

                    var shift = (function() {
                        var arr = [];
                        list[key].forEach(function(v, i) {
                            if (arr.indexOf(v.SHIFT_NAME) == -1) {
                                arr.push(v.SHIFT_NAME);
                            }
                        })
                        return arr;
                    })()

                    shift.forEach(function(v, i) {
                        data.ydata.push({
                            name: v,
                            data: (function() {
                                var arr = [];
                                data.xdata.forEach(function(v, i) {
                                    arr[i] = 0;
                                })
                                return arr;
                            })()
                        })
                    })
                    console.log(data.xdata)
                    console.log(data.ydata)
                    console.log(list[key])
                    data.ydata.forEach(function(v, i) {
                        data.xdata.forEach(function(m, n) {
                            list[key].forEach(function(j, k) {
                                if (v.name == j.SHIFT_NAME && m == j.MAC_NAME) {
                                    v.data[n] = j.ACTIVATION_RATE * 100;
                                }
                            })
                        })

                    })
                    drawHisChart(data);


                    break;
                case "2":
                    var name = moment(list[key][0]['NATURE_DAY']).format('YYYY-MM-DD');
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    data.ydata[0] = {
                        name: lang.Efficiencystatistics.RateOGrainOrMove,
                        data: []
                    }

                    list[key].forEach(function(v, i) {
                        data.xdata.push($("input[name='searchType']:checked").val() == 1 ? v['MAC_NAME'] : v['GP_NAME']);
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
                case "3":

                    var name = list[key][0]['NATURE_DAY'];
                    data.ydata[0] = {
                        name: lang.Efficiencystatistics.RateOGrainOrMove,
                        data: []
                    }
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    list[key].forEach(function(v, i) {
                        data.xdata.push($("input[name='searchType']:checked").val() == 1 ? v['MAC_NAME'] : v['GP_NAME']);
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
                case "4":
                    var name = list[key][0]['NATURE_DAY'];
                    data.ydata[0] = {
                        name: lang.Efficiencystatistics.RateOGrainOrMove,
                        data: []
                    }
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    list[key].forEach(function(v, i) {
                        data.xdata.push($("input[name='searchType']:checked").val() == 1 ? v['MAC_NAME'] : v['GP_NAME']);
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
                case "5":
                    var name = list[key][0]['NATURE_DAY'];
                    data.ydata[0] = {
                        name: lang.Efficiencystatistics.RateOGrainOrMove,
                        data: []
                    }
                    data.title = name + lang.Efficiencystatistics.SchematicDiagram;
                    list[key].forEach(function(v, i) {
                        data.xdata.push($("input[name='searchType']:checked").val() == 1 ? v['MAC_NAME'] : v['GP_NAME']);
                        data.ydata[0].data.push(v.ACTIVATION_RATE * 100);
                    })
                    drawHisChart(data);
                    break;
            }
        }
    }


}


function drawHisChart(data) {
    $(data.ele).highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: data.title,
            style: {
                fontfamily: "Helvetica Neue,Microsoft Yahei,Hiragino Sans GB,WenQuanYi Micro Hei,sans-serif;",
                fontWeight: "bold",
                color: "#000"
            },
            y: 30
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: data.xdata,
            crosshair: true
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: ''
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} %</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%',

                }
            }
        },
        series: data.ydata,
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
    });
}