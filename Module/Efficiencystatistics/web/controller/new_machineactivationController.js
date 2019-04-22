var groupOrMachine;
var Chart;
var groupType = 1; //默认设备方式
var baseUrl = "/machineactivation/";
var groupOrMac = 1;
var setval = new SetVal()
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
        getData(resultData);
    });

    function getData(tdata) {
        $("#hisChart").empty();
        var data = [];
        var shifts = {};
        switch ($("#totalType").data("kendoDropDownList").value()) {
            case "1":
                for (var i = 0; i < tdata.length; i++) {
                    for (var j = 0; j < tdata[i].Data.length; j++) {
                        data.push({
                            NAME: tdata[i].Name,
                            MAC_NO: tdata[i].MAC_NO,
                            DATE: tdata[i].Data[j].DATE,
                            SHIFTS: tdata[i].Data[j].SHIFTS
                        })
                        for (var p = 0; p < tdata[i].Data[j].SHIFTS.length; p++) {
                            shifts[tdata[i].Data[j].SHIFTS[p].SHIFT_ID] = tdata[i].Data[j].SHIFTS[p].NAME;
                        }
                    }
                }
                break;
            case "2":
                for (var i = 0; i < tdata.length; i++) {
                    for (var j = 0; j < tdata[i].Data.length; j++) {
                        data.push({
                            NAME: tdata[i].Name,
                            MAC_NO: tdata[i].MAC_NO,
                            DATE: tdata[i].Data[j].DATE,
                            VALUE: setval.day(tdata[i].Data[j].RUN_HOURS) //tdata[i].Data[j].VALUE
                        })
                    }
                }
                break;
            case "3":
                for (var i = 0; i < tdata.length; i++) {
                    for (var j = 0; j < tdata[i].Data.length; j++) {
                        data.push({
                            NAME: tdata[i].Name,
                            MAC_NO: tdata[i].MAC_NO,
                            DATE: tdata[i].Data[j].DATE,
                            VALUE: setval.weeks(tdata[i].Data[j].RUN_HOURS), //tdata[i].Data[j].VALUE,
                            WEEK: tdata[i].Data[j].WEEK
                        })
                    }
                }
                break;
            case "4":
                for (var i = 0; i < tdata.length; i++) {
                    for (var j = 0; j < tdata[i].Data.length; j++) {
                        data.push({
                            NAME: tdata[i].Name,
                            MAC_NO: tdata[i].MAC_NO,
                            DATE: moment(tdata[i].Data[j].YEAR + "/" + tdata[i].Data[j].MONTH + "/1"),
                            YEAR: tdata[i].Data[j].YEAR,
                            VALUE: setval.month(tdata[i].Data[j].RUN_HOURS, tdata[i].Data[j].YEAR, tdata[i].Data[j].MONTH), //tdata[i].Data[j].VALUE,
                            MONTH: tdata[i].Data[j].MONTH
                        })
                    }
                }
                break;
            case "5":
                for (var i = 0; i < tdata.length; i++) {
                    for (var j = 0; j < tdata[i].Data.length; j++) {
                        data.push({
                            NAME: tdata[i].Name,
                            MAC_NO: tdata[i].MAC_NO,
                            DATE: moment(tdata[i].Data[j].YEAR + "/1/1"),
                            YEAR: tdata[i].Data[j].YEAR,
                            VALUE: setval.years(tdata[i].Data[j].RUN_HOURS, tdata[i].Data[j].YEAR) //tdata[i].Data[j].VALUE
                        })
                    }
                }
                break;
        }
        //绘图
        var chartData;
        if (groupType == 1) {
            chartData = _.groupBy(data, 'NAME');
        } else {
            chartData = _.groupBy(data, 'DATE');
        }
        var kk = 1;
        $.each(chartData, function(p1, p2) {

            $("#hisChart").append('<div id="hisChart_' + kk + '" style="min-width:700px;height:500px"></div>');


            var categories = [],
                ydata = [{
                    name: lang.Efficiencystatistics.RateOGrainOrMove,
                    data: []
                }];
            var title;

            //班次特殊处理
            if ($("#totalType").data("kendoDropDownList").value() == "1") {
                //统计所有的班次
                ydata = [];
                $.each(shifts, function(s1, s2) {
                    var tjson = {
                        id: s1,
                        name: s2,
                        data: []
                    }
                    ydata.push(tjson);
                });
            }
            for (var i = 0; i < p2.length; i++) {
                if (groupType == 1) {
                    switch ($("#totalType").data("kendoDropDownList").value()) {
                        case "1":
                            //班次
                            for (var t = 0; t < ydata.length; t++) {
                                for (var k = 0; k < p2[i].SHIFTS.length; k++) {
                                    if (ydata[t].id == p2[i].SHIFTS[k].SHIFT_ID) {
                                        ydata[t].data.push(setval.shift(p2[i].SHIFTS[k].RUN_HOURS));
                                    }
                                }
                            }

                            categories.push(moment(p2[i].DATE).format("YYYY/MM/DD")); //横坐标日期
                            title = p1 + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ") ") + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "2":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(moment(p2[i].DATE).format("YYYY/MM/DD")); //横坐标日期
                            title = p1 + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ") ") + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "3":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(moment(p2[i].DATE).format("YYYY") + lang.EmployeePerformance.The + p2[i].WEEK + lang.EmployeePerformance.Weeks); //横坐标日期
                            title = p1 + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ") ") + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "4":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(moment(p2[i].DATE).format("YYYY/MM") + lang.EmployeePerformance.Month); //横坐标日期
                            title = p1 + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ") ") + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "5":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(moment(p2[i].DATE).format("YYYY") + lang.EmployeePerformance.Years); //横坐标日期
                            title = p1 + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ") ") + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                    }
                } else {
                    switch ($("#totalType").data("kendoDropDownList").value()) {
                        case "1":
                            //班次
                            for (var t = 0; t < ydata.length; t++) {
                                for (var k = 0; k < p2[i].SHIFTS.length; k++) {
                                    if (ydata[t].id == p2[i].SHIFTS[k].SHIFT_ID) {
                                        ydata[t].data.push(setval.shift(p2[i].SHIFTS[k].RUN_HOURS));
                                    }
                                }
                            }

                            categories.push(p2[i].NAME + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ")")); //横坐标设备
                            title = moment(p1).format("YYYY/MM/DD") + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "2":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(p2[i].NAME + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ")")); //横坐标设备
                            title = moment(p1).format("YYYY/MM/DD") + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "3":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(p2[i].NAME + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ")")); //横坐标设备
                            title = moment(p1).format("YYYY") + lang.EmployeePerformance.The + p2[i].WEEK + lang.EmployeePerformance.Weeks + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "4":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(p2[i].NAME + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ")")); //横坐标设备
                            title = moment(p1).format("YYYY/MM") + lang.EmployeePerformance.Month + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                        case "5":
                            ydata[0].data.push(p2[i].VALUE);
                            categories.push(p2[i].NAME + (p2[i].MAC_NO == undefined ? "" : "(" + p2[i].MAC_NO + ")")); //横坐标设备
                            title = moment(p1).format("YYYY") + lang.EmployeePerformance.Years + lang.Efficiencystatistics.SchematicDiagram;
                            break;
                    }
                }
            }
            var par = {
                ele: "#hisChart_" + kk,
                type: "column",
                xdata: categories,
                ydata: ydata,
                title: title,
                subtitle: ""
            }
            drawHisChart(par);
            kk++;
        });
    }
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
            machineMode: parseInt($("#totalType").data("kendoDropDownList").value()),
            objectIds: machines,
            startTime: $("#startTime").val(),
            endTime: $("#endTime").val()
        };
        var url;
        if ($('input[name="searchType"]:checked').val() == 1) { //设备
            url = "/machineactivation/GetMachineActivation";
        } else { //设备组
            url = "/machineactivation/GetGroupActivation";
        }

        $.post(url, (data), function(data) {
            if (data.Status == 0) {
                resultData = data.Data;
                getData(resultData);
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
            machineMode: parseInt($("#totalType").data("kendoDropDownList").value()),
            objectIds: machines,
            startTime: $("#startTime").val(),
            endTime: $("#endTime").val()
        };
        var url;
        if ($('input[name="searchType"]:checked').val() == 1) { //设备
            url = "/machineactivation/r/GetMachineActivation";
        } else { //设备组
            url = "/machineactivation/r/GetGroupActivation";
        }
        window.open("/newMachineOutPutIndex?par=" + JSON.stringify(data) + "&url=" + url + "&groupOrMac=" + groupOrMac + "&lunchTime=" + $('#lunchTime').val() + "&restTime=" + $('#restTime').val());

        //$('#lunchTime').val() * 60 - $('#restTime')
    });
    drawHisChart({});
});

function format(n) {
    if (n < 10)
        return "0" + n;
    else
        return n.toString();
}

function drawHisChart(data) {
    Chart = $(data.ele).hisChart({
        type: data.type == undefined ? "column" : data.type,
        title: data.title,
        subtitle: data.subtitle == undefined ? "" : data.subtitle,
        categories: data.xdata == undefined ? [] : data.xdata,
        dataSource: data.ydata == undefined ? [] : data.ydata,
        stacking: data.stacking == true ? "normal" : null,
        exportEnable: false,
        ymax: 100
    }).data("BZ-hisChart");
}

function SetVal() {
    this.shift = function(val) {
        var s = parseFloat(((val / (8 * 3600 - $('#lunchTime').val() * 60 - $('#restTime').val() * 60)) * 100).toFixed(2));
        return s;
    }
    this.day = function(val) {
        var s = parseFloat(((val / (24 * 3600 - $('#lunchTime').val() * 60 - $('#restTime').val() * 60)) * 100).toFixed(2));
        return s;
    }
    this.weeks = function(val) {
        var s = parseFloat(((val / (24 * 3600 * 7 - $('#lunchTime').val() * 60 * 7 - $('#restTime').val() * 60 * 7)) * 100).toFixed(2));
        return s;
    }
    this.month = function(val, years, month) {
        var day = mGetDate(years, month);
        var s = parseFloat(((val / (24 * 3600 * day - $('#lunchTime').val() * 60 * day - $('#restTime').val() * 60 * day)) * 100).toFixed(2));
        return s;
    }
    this.years = function(val, years) {
        var day = isLeapYear(years);
        var s = parseFloat(((val / (24 * 3600 * day - $('#lunchTime').val() * 60 * day - $('#restTime').val() * 60 * day)) * 100).toFixed(2));
        return s;
    }
}

function mGetDate(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
}

function isLeapYear(year) {
    var cond1 = year % 4 == 0; //条件1：年份必须要能被4整除
    var cond2 = year % 100 != 0; //条件2：年份不能是整百数
    var cond3 = year % 400 == 0; //条件3：年份是400的倍数
    //当条件1和条件2同时成立时，就肯定是闰年，所以条件1和条件2之间为“与”的关系。
    //如果条件1和条件2不能同时成立，但如果条件3能成立，则仍然是闰年。所以条件3与前2项为“或”的关系。
    //所以得出判断闰年的表达式：
    var cond = cond1 && cond2 || cond3;
    if (cond) {

        return 366;
    } else {

        return 365;
    }
}