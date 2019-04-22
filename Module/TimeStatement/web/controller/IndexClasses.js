(function($) {
    var ms = {
        init: function(totalsubpageTmep, args) {
            return (function() {
                ms.createAllTable(totalsubpageTmep, args);
                ms.createDataTable(totalsubpageTmep, args);
                ms.createEchart(totalsubpageTmep, args);
            })();
        },
        //生成第一个表 和  标题
        createAllTable: function(totalsubpageTmep, args) {
            return (function() {
                let elementAllTable = document.createElement('div');
                let elementTitle = document.createElement('h2');
                elementTitle.classList.add('elementTitle');
                elementTitle.innerHTML = args.facility.elementTitle;
                let AllTable = `<table class="table" border height="334" style="width: 100%;">
						    <thead>
						    <tr>
						        <th style="background: #a6a6a6;">` + lang.TimeStatement.Factory + `</th>
						        <th style="background: #a6a6a6;">` + lang.TimeStatement.Workshop + `</th>
						        <th style="background: #a6a6a6;">` + lang.TimeStatement.ProductionLine + `</th>
						        <th style="background: #a6a6a6;">` + lang.Alarm.MachineName + `</th>
						        <th style="background: #a6a6a6;">` + lang.Common.EquipmentModel + `</th>
						        <th style="background: #a6a6a6;">` + lang.Common.EquipmentManufacturer + `</th>
						        <th style="background: #a6a6a6;">` + lang.Order.EquipmentSerialNumber + `</th>
						        <th style="background: #a6a6a6;">` + lang.Common.ApplicationNo + `</th>
						    </tr>
						    </thead>
						    <tbody>
						    <tr>
						        <td>${args.facility.plant? args.facility.plant:''}</td>
						        <td>${args.facility.workshop? args.facility.workshop:''}</td>
						        <td>${args.facility.production? args.facility.production:''}</td>
						        <td>${args.facility.name? args.facility.name:''}</td>
						        <td>${args.facility.model? args.facility.model:''}</td>
						        <td>${args.facility.vender? args.facility.vender:''}</td>
						        <td>${args.facility.number?args.facility.number:''}</td>
						        <td>${args.facility.procedure? args.facility.procedure:''}</td>
						    </tr>
						    </tbody>
						</table>`;

                elementAllTable.innerHTML = AllTable;
                elementAllTable.classList.add('elementTable');
                $(elementAllTable).css({
                    'float': 'left',
                    'width': '30%',
                    'overflow': 'hidden'
                });
                $(totalsubpageTmep).append(elementTitle);
                $(totalsubpageTmep).append(elementAllTable);
            })();
        },
        //生成第二个表
        createDataTable: function(totalsubpageTmep, args) {
            return (function() {
                let elementDataTable = document.createElement('div');
                let dataTable = `<table class="table" border style="min-width: 100%;">
					    <thead>
					    <tr>
					        <th style="text-align: center; position: -webkit-sticky;position: sticky; left: 0;background:#fff";>` + lang.EmployeePerformance.Date + `</th>
					    </tr>
					    </thead>
					    <tbody>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.EmployeePerformance.Shift + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Statement.TotalStartingTime + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Statement.RateOfGrainOrMove + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Maintain.运行 + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Maintain.空闲 + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Maintain.调试 + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Maintain.停机 + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Maintain.关机 + `</th>
					    </tr>
					    </tbody>
					</table>`;
                elementDataTable.innerHTML = dataTable;
                let elementDataTableTbody = elementDataTable.getElementsByTagName('tbody')[0];
                for (let i = 0; i < args.facility.value.length; i++) {
                    //添加时间
                    $(elementDataTable.getElementsByTagName('thead')[0].getElementsByTagName('tr')[0]).append(`<th colspan='${args.facility.value[i].length}' style="text-align: center">${args.facility.value[i][0].time}</th>`)
                        //添加班次
                    for (var w = 0; w < args.facility.value[i].length; w++) {
                        $(elementDataTableTbody.getElementsByTagName('tr')[0]).append(`<td>${args.facility.value[i][w].SHIFT_NAME}</td>`);
                        //添加开机时间
                        $(elementDataTableTbody.getElementsByTagName('tr')[1]).append(`<td>${isNaN(args.facility.value[i][w].sumtime,'h')}</td>`);
                        //添加data
                        for (let j = 0; j < args.facility.value[i][w].data.length; j++) {
                            $(elementDataTableTbody.getElementsByTagName('tr')[j + 2]).append(`<td>${isNaN(args.facility.value[i][w].data[j],'p')}</td>`)
                        }
                    }


                }
                elementDataTable.classList.add('elementTable');
                elementDataTable.classList.add('elementTableHeight');
                $(elementDataTable).css({
                    'float': 'left',
                    'width': '70%',
                    'overflow': 'auto',
                });
                $(totalsubpageTmep).append(elementDataTable);

                //增加返回值类型判断 htc:20180704
                function isNaN(val, type) {
                    if (type == 'h')
                        return (val == "NaN" || val == undefined || val == null || val == "") ? '0.00h' : (val + "h");
                    else if (type == 'p')
                        return (val == "NaN" || val == undefined || val == null || val == "") ? lang.Statement.ZanWu : (val + "%");
                }
            })()
        },
        //生成echart
        createEchart: function(totalsubpageTmep, args) {

            let xAxisData = [];

            let leisureData = []; //空闲

            let operationData = []; //运行

            let debugData = []; //调试

            let haltData = []; //停机

            let shutdownData = []; //关机

            let sumTime = []; //总开机时间

            let rateData = []; //标准稼动率

            for (let i = 0; i < args.facility.value.length; i++) {
                for (let w = 0; w < args.facility.value[i].length; w++) {
                    sumTime.push(args.facility.value[i][w].sumtime);
                    xAxisData.push(args.facility.value[i][w].time + args.facility.value[i][w].SHIFT_NAME);
                    rateData.push(args.facility.value[i][w].data[0]);
                    operationData.push(args.facility.value[i][w].data[1]);
                    leisureData.push(args.facility.value[i][w].data[2]);
                    debugData.push(args.facility.value[i][w].data[3]);
                    haltData.push(args.facility.value[i][w].data[4]);
                    shutdownData.push(args.facility.value[i][w].data[5]);
                }


            }

            return (function() {
                let elementEchart = document.createElement('div');
                elementEchart.id = args.facility.echartsId;
                elementEchart.classList.add('lazyLoad');
                $(elementEchart).css({ "width": "100%", "height": "350px", "float": "left" });
                $(totalsubpageTmep).append(elementEchart);
                var myChart = echarts.init(document.getElementById(args.facility.echartsId));
                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            crossStyle: {
                                color: '#999'
                            }
                        }
                    },
                    grid: {
                        bottom: '24%',
                    },
                    toolbox: {
                        feature: {
                            dataView: { show: false, readOnly: false },
                            magicType: { show: false, type: ['line', 'bar'] },
                            restore: { show: false },
                            saveAsImage: { show: false }
                        }
                    },
                    legend: {
                        data: [lang.Statement.RateOfGrainOrMove, lang.Statement.AllOpenTime, lang.Maintain.运行, lang.Maintain.空闲, lang.Maintain.调试, lang.Maintain.停机, lang.Maintain.关机],

                    },
                    xAxis: [{
                        type: 'category',
                        data: xAxisData,
                        name: lang.TimeStatement.DeviceKong,
                        nameLocation: 'middle',
                        nameTextStyle: {
                            fontSize: 18,
                            fontWeight: 600,
                        },
                        nameGap: 20,
                        axisPointer: {
                            type: 'shadow'
                        }
                    }],
                    dataZoom: [{
                        type: "slider",
                        /*类型*/
                        xAxisIndex: 0,
                        /*对应的轴*/
                        bottom: "10",
                        /*位置，定位*/

                        // zoomLock: true,

                        /*开始*/
                        startValue: 0,
                        /*结束*/
                        endValue: 5,
                        handleIcon: "M0,0 v9.7h5 v-9.7h-5 Z",
                        /*手柄的形状
                        M = moveto
                        L = lineto
                        H = horizontal lineto
                        V = vertical lineto
                        C = curveto
                        S = smooth curveto
                        Q = quadratic Belzier curve
                        T = smooth quadratic Belzier curveto
                        A = elliptical Arc
                        Z = closepath
                        以上所有命令均允许小写字母。大写表示绝对定位，小写表示相对定位。
                        * */
                        handleStyle: { /*手柄的样式*/
                            color: "#294b97",
                            borderColor: "#5476c2"
                        },
                        backgroundColor: "#f7f7f7",
                        /*背景 */
                        dataBackground: { /*数据背景*/
                            lineStyle: {
                                color: "#dfdfdf"
                            },
                            areaStyle: {
                                color: "#dfdfdf"
                            }
                        },
                        fillerColor: "rgba(220,210,230,0.6)",
                        /*被start和end遮住的背景*/
                        labelFormatter: function(value, params) { /*拖动时两端的文字提示*/

                            return params;
                        }
                    }],
                    yAxis: [{
                            type: 'value',
                            name: lang.Statement.Percentage,
                            min: 0,
                            max: 110,
                            interval: 10,
                            axisLabel: {
                                formatter: '{value} %'
                            }
                        },
                        {
                            type: 'value',
                            name: lang.Statement.HourH,
                            min: 0,
                            max: 25,
                            position: 'right',
                            offset: 1,
                            axisLabel: {
                                formatter: '{value} h'
                            }
                        },
                    ],
                    series: [{
                            name: lang.Maintain.运行,
                            type: 'bar',
                            data: operationData,
                            label: {
                                show: false,
                                position: 'top'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#92d050'
                                }
                            },
                        },
                        {
                            name: lang.Maintain.空闲,
                            type: 'bar',
                            data: leisureData,
                            label: {
                                show: false,
                                position: 'top'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#ffc000'
                                }
                            },
                        },
                        {
                            name: lang.Maintain.调试,
                            type: 'bar',
                            data: debugData,
                            label: {
                                show: false,
                                position: 'top'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#0070c0'
                                }
                            },
                        },
                        {
                            name: lang.Maintain.停机,
                            type: 'bar',
                            data: haltData,
                            label: {
                                show: false,
                                position: 'top'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#ff0000'
                                }
                            },
                        },
                        {
                            name: lang.Maintain.关机,
                            type: 'bar',
                            data: shutdownData,
                            label: {
                                show: false,
                                position: 'top'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#7f7f7f'
                                }
                            },
                        },
                        {
                            name: lang.Statement.AllOpenTime,
                            type: 'line',
                            yAxisIndex: 1,
                            data: sumTime,
                            label: {
                                show: true,
                                position: 'top'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#948a54'
                                }
                            },
                        },
                        {
                            name: lang.Statement.RateOfGrainOrMove,
                            type: 'line',
                            //					            yAxisIndex: 1,
                            data: rateData,
                            label: {
                                show: true,
                                position: 'top'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#c0504d'
                                }
                            },
                        }
                    ]
                };
                myChart.setOption(option);
            })()
        },
    }
    $.fn.createElementClasses = function(options) {
        ms.init(this, options);
    }
})(jQuery);