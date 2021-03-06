    var chartObj = {
        chart1: {},
        chart2: {},
        chart3: {},
        chart4: {},
        chart5: {}
    };
    var baseUrl = "/diagnosis/";
    $(function() {
        var seriesdata = [];
        var type = 'DEFAULT';
        $.each(parameter[type], function(item, k) {
            if (k.EN_ABLE) { //参数启用
                //选择图标类型
                var type = k.TYPE.split(",");
                for (var i = 0; i < type.length; i++) {
                    switch (type[i]) {
                        case "chart1": //转速
                            $(".chart1").append('<div id="' + item + '"><div class="chart1_flagLabel">' + lang.ProcessParameters[item] + '</div><div id="' + item + '_chart"></div></div>');
                            chartObj.chart1[item] = drawSpeedChart(item + "_chart", 300, 260, k.UNIT);
                            break;
                        case "chart2": //进度
                            $(".chart2").append('<div id="' + item + '"><div class="chart2_flagLabel">' + lang.ProcessParameters[item] + '<span id="' + item + '_chartValue"></span></div><div id="' + item + '_chart"></div></div>');
                            chartObj.chart2[item] = drawProgressBar(item + "_chart", 500, 40);
                            break;
                        case "chart3": //数码管
                            $(".chart3").append('<div id="' + item + '" style="margin-right: 10px;"><div class="chart2_flagLabel">' + lang.ProcessParameters[item] + '</div><div id="' + item + '_chart" style="border-radius: 5px ! important; border: 4px solid rgb(204, 204, 204);"></div></div>');
                            chartObj.chart3[item] = drawSSegArray(item + "_chart", 350, 100);
                            $("#" + item + "_chart").append('<span style="color: rgb(239, 247, 22); font-size: 18px; margin-right: 5px;">' + k.UNIT + '</span>');
                            break;
                        case "chart4": //文本框
                            $(".chart4").append('<div style="margin-bottom: 10px;"><div class="chart4_flagLabel">' + lang.ProcessParameters[item] + ':</div><div class="chart4_value" id="' + item + '_chart"></div></div>');
                            chartObj.chart4[item] = item + "_chart";
                            break;
                        case "chart5": //实时曲线
                            var tjson = {
                                name: lang.ProcessParameters[item],
                                type: 'line',
                                yAxis: k.YAXIS,
                                //data: intivalue.FD_WindSpeed_3s,
                                data: (function() {
                                    var data = [];
                                    var time = (new Date()).getTime();
                                    var i = 0;
                                    for (i = -59; i <= 0; i++) {
                                        var xx = time + i * 5000;
                                        data.push({
                                            x: xx,
                                            y: null
                                        });
                                    }
                                    return data;
                                })(),
                                marker: {
                                    enabled: false
                                }
                            }
                            seriesdata.push(tjson);
                            chartObj.chart5[item] = seriesdata.length - 1;
                            break;
                    }
                }
            }
        });
        if (seriesdata.length > 0) {
            drawRealCurve(lang.MachineParameters.DeviceInstantParameterCurve, "curves", seriesdata);
            resizeChart();
        }
        $("#contextPage").resize(function() {
            resizeChart();
        });

        GetImmediatelyparameter();
    });

    function GetImmediatelyparameter() {
        var no = parseInt($.getparam("no"));
        $.post(baseUrl + "GetImmediatelyparameter", { machineIds: $.getparam("no") }, function(data) {
            if (data.Status == 0) {
                //var series = this.series[0];
                if (data.Data.MAC_DATA[$.getparam("no")].DATAITEMS.length > 0) {
                    var obj = data.Data.MAC_DATA[$.getparam("no")].DATAITEMS;
                    $("#MAC_NAME").html(data.Data.MAC_DATA[$.getparam("no")].MAC_NAME);
                    $("#MAC_NO").html(" NO:" + data.Data.MAC_DATA[$.getparam("no")].MAC_NO);
                    //
                    for (var m in chartObj) {
                        switch (m) {
                            case "chart1":
                            case "chart2":
                            case "chart3":
                                for (var k in chartObj[m]) {
                                    var val, name;
                                    val = Getpara(val, k, obj);
                                    chartObj[m][k].SetValue(val);
                                    if (m == "chart2") {
                                        $("#" + k + "_chartValue").html("----" + val + "%");
                                    }
                                }
                                break;
                            case "chart4":
                                for (var k in chartObj[m]) {
                                    var val, name;
                                    val = Getpara(val, k, obj);
                                    $("#" + chartObj[m][k]).html(val);
                                }
                                break;
                            case "chart5":
                                var x = (new Date()).getTime();
                                for (var k in chartObj[m]) {
                                    var val, name;
                                    val = Getpara(val, k, obj);
                                    var y = val;
                                    chart.series[chartObj[m][k]].addPoint([x, y], true, true);
                                }
                                break;
                        }
                    }
                }
                setTimeout("GetImmediatelyparameter()", 5000);
                //setInterval(function () {
                //    //var x = (new Date()).getTime(), // current time         
                //    //    y = Math.random() * 10000;
                //    //series.addPoint([x, y], true, true);
                //    //for (var m in chartObj) {
                //    //    chartObj[m].SetValue(parseFloat((Math.random() * 100).toFixed(1)));
                //    //}

                //}, 5000);
            } else {
                BzAlert(data.Message);
            }
        });
    }

    function Getpara(val, k, obj) {
        if (k == 'P_INT1') {
            val = _.where(obj, { 'Name': 'STD::SpindleSpeed' })[0].Value;
        } else if (k == 'P_INT3') {
            val = _.where(obj, { 'Name': 'STD::SpindleOverride' })[0].Value;
        } else if (k == 'P_INT2') {
            val = _.where(obj, { 'Name': 'STD::FeedSpeed' })[0].Value;
        } else if (k == 'P_INT4') {
            val = _.where(obj, { 'Name': 'STD::FeedOverride' })[0].Value;
        } else if (k == 'PROGRAME_NAME') {
            val = _.where(obj, { 'Name': 'STD::Program' })[0].Value;
        } else if (k == 'DURATION') {
            val = _.where(obj, { 'Name': 'STD::StatusStartTime' })[0].Value;
        } else if (k = 'WARNING_CODE') {
            val = _.where(obj, { 'Name': 'STD::Alarm' })[0].Value;
        }
        return val;
    }

    function resizeChart() {
        var width = $(".chart5").width() - 30;
        chart.setSize(width, 350);
    }

    function drawSpeedChart(Container, width, height, unit) {
        return new zyGH.CGauge(Container, width, height).StartAngleSet(0).EndAngleSet(270).LargeTickSet(10).SmallTickSet(5).MinValueSet(0).MaxValueSet(20000).DialRadiusSet(113).ltlenSet(10).stlenSet(8).SetName(unit).Create(130, 130);
    }

    function drawProgressBar(Container, width, height) {
        return new zyGH.ProgressBar(Container, width, height).SetWidth(width - 2).SetHight(height - 2).max(200).min(0).Radio(10).SetStrokecolor("#EF3130").SetcolorTop("#F18284").SetcolorMid("#EF3130").SetcolorButtom("#EF7574").Setopacity(50).Create(1, 1);
    }

    function drawSSegArray(Container, width, height) {
        return new zyGH.SSegArray(Container, width, height).Spacing(10).scale(1).Count(4).initialValue(1).SetcolorBlack("#212020").SetcolorTop("#07F7EB").Create(0, 12);
    }
    var chart;

    function drawRealCurve(title, contains, seriesdata) {
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        chart = new Highcharts.Chart({
            chart: {
                renderTo: contains,
                alignTicks: true,
                animation: false,
                //width: 700, //790
                height: 350, //445
                //margin: [8, 90, 20, 85]
                backgroundColor: "#000000",
                events: {
                    //load: function () {

                    //    // set up the updating of the chart each second             
                    //    var series = this.series[0];
                    //    setInterval(function () {
                    //        var x = (new Date()).getTime(), // current time         
                    //            y = Math.random()*10000;
                    //        series.addPoint([x, y], true, true);
                    //        for (var m in chartObj) {
                    //            chartObj[m].SetValue(parseFloat((Math.random() * 100).toFixed(1)));
                    //        }
                    //    }, 5000);
                    //}
                }
            },
            title: {
                floating: false,
                text: title,
                style: {
                    color: '#FFFFFF',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
                },
                align: 'center',
                margin: 15
            },
            credits: {
                enabled: false //是否显示LOGO
            },
            xAxis: {
                type: 'datetime',
                lineColor: '#FFFFFF',
                lineWidth: 1,
                tickWidth: 1,
                tickColor: '#FFFFFF',
                gridLineColor: '#C0C0C0',
                gridLineWidth: 1,
                tickInterval: 1000 * 60, //30s
                //minTickInterval: 5, //5s

                minorGridLineWidth: 1,
                minorGridLineColor: '#FF0000',
                //minorTickLength: 50,
                //minorTickWidth: 1,

                labels: {
                    //  x:
                    y: 15,
                    style: {
                        font: '12px Arial',
                        color: '#FFFFFF'
                    }
                }
            },
            yAxis: [{ //曲线1  
                //minorTickInterval: 1,
                lineColor: '#FFFFFF',
                lineWidth: 1,
                tickWidth: 1,
                tickColor: '#FFFFFF',
                gridlinewidth: 0,
                tickInterval: 2000,
                //minorTickInterval: 'auto',
                maxPadding: 0,
                minPadding: 0,
                offset: 0,
                labels: {
                    formatter: function() {
                        return this.value;
                    },
                    style: {
                        font: '12px Arial',
                        color: '#FFFFFF'
                    }
                },
                title: {
                    text: ''
                },
                opposite: false, //Y轴靠左
                min: 0,
                max: 10000
            }, {
                //minorTickInterval: 4,
                lineColor: '#FFFFFF',
                lineWidth: 1,
                tickWidth: 1,
                tickColor: '#FFFFFF',
                gridLineWidth: 0,
                tickInterval: 40,
                offset: 0,
                labels: {
                    formatter: function() {
                        return this.value;
                    },
                    style: {
                        font: '12px Arial',
                        color: '#FFFFFF'
                    }
                },
                title: {
                    text: ''
                },
                opposite: true, //Y轴靠左
                min: 0,
                max: 200
            }],
            tooltip: {
                crosshairs: {
                    color: '#FF0000'
                },
                borderColor: '#000000',
                enabled: true,
                shared: true,
                useHTML: true,
                headerFormat: '<small>{point.key}</small><table>',
                pointFormat: '<tr><td align="right" style="color: {series.color}">{series.name}: </td>' +
                    '<td align="left"><b>{point.y}</b></td></tr>',
                footerFormat: '</table>',
                //crosshairs: true,
                xDateFormat: '%Y-%m-%d %H:%M:%S',
                valueDecimals: 0
            },
            legend: { //图列
                enabled: true,
                itemStyle: {
                    color: '#FFFFFF'
                }
            },
            exporting: {
                enabled: false
            },
            series: seriesdata
        });

    }