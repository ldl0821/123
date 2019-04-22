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
                let elementTitle = document.createElement('h3');
                elementTitle.classList.add('elementTitle');
                elementTitle.innerHTML = args.facility.elementTitle;
                let AllTable = `<table class="table" border height="334" style="width: 100%;display:none">
						    <thead>
						    <tr>
						        <th style="background: #a6a6a6;">` + lang.MachineStatus.startTime + `</th>
						        <th style="background: #a6a6a6;">` + lang.MachineStatus.endTime + `</th>
						    </tr>
						    </thead>
						    <tbody>
						    <tr>
						        <td>${args.facility.plant? args.facility.plant:''}</td>
						        <td>${args.facility.workshop? args.facility.workshop:''}</td>
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
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">` + lang.Statement.TotalStartingTime + `</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff;display:none">` + lang.Statement.RateOfGrainOrMove + `</th>
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
                    $(elementDataTable.getElementsByTagName('thead')[0].getElementsByTagName('tr')[0]).append(`<th  style="text-align: center">${args.facility.value[i].time}</th>`)
                        //添加开机时间
                    $(elementDataTableTbody.getElementsByTagName('tr')[0]).append(`<td>${isNaN(args.facility.value[i].sumtime,'h')}</td>`)
                        //添加data
                    for (let j = 0; j < args.facility.value[i].data.length; j++) {
                        $(elementDataTableTbody.getElementsByTagName('tr')[j + 1]).append(`<td>${isNaN(args.facility.value[i].data[j],'p')}</td>`)
                    }
                }
                elementDataTable.classList.add('elementTable');
                elementDataTable.classList.add('elementTableHeight');
                $(elementDataTable).css({
                    'float': 'left',
                    'width': '100%',
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




            // *********************用来显示上面的h***************************

            let leisureDataSum = []; //空闲

            let operationDataSum = []; //运行

            let debugDataSum = []; //调试

            let haltDataSum = []; //停机

            let shutdownDataSum = []; //关机

            for (let i = 0; i < args.facility.value.length; i++) {
                xAxisData.push(args.facility.value[i].time);

                sumTime.push(args.facility.value[i].sumtime);

                operationData.push(args.facility.value[i].data[1]);

                leisureData.push(args.facility.value[i].data[2]);

                debugData.push(args.facility.value[i].data[3]);

                haltData.push(args.facility.value[i].data[4]);

                shutdownData.push(args.facility.value[i].data[5]);






                operationDataSum.push(args.facility.value[i].dataSum[1]);
                leisureDataSum.push(args.facility.value[i].dataSum[2]);
                debugDataSum.push(args.facility.value[i].dataSum[3]);
                haltDataSum.push(args.facility.value[i].dataSum[4]);
                shutdownDataSum.push(args.facility.value[i].dataSum[5]);
            }


            function formattingTimes(time,no){
                //let hour = (time/3600).toFixed(2).split('.')[0];
	        	let hour = Math.floor(time/3600);
                //let minute = ((time/3600).toFixed(3).split('.')[1]/1000*60).toFixed(0);
		        let minute = (time/60%60).toFixed(0);
                if(no == 'no'){
                    return hour+'h'+minute+'m'
                }else{
                    return hour+'h'+minute+'m'+'\n'
                }
            }
            var flexibleHeight;
            // 修改拉索条的高度
            if($(window).height() < 700){
                flexibleHeight = 15
            }else{
                flexibleHeight = 28
            }
            return (function() {
                let elementEchart = document.createElement('div');
                elementEchart.id = args.facility.echartsId;
                elementEchart.classList.add('lazyLoad');
                // $(elementEchart).css({ "width": "100%", "height": "350px", "float": "left" });
                $(elementEchart).css({ "width": "100%", "height": $(window).height() - $('#contextPage>.row-fluid').height() - $('#contextPage>form').height() - 200, "float": "left" });
                $(totalsubpageTmep).append(elementEchart);
                var myChart = echarts.init(document.getElementById(args.facility.echartsId));

                let sumTimeMax = Math.max.apply(Array, sumTime);
                sumTimeMax = (sumTimeMax + sumTimeMax * 0.1).toFixed(2);
                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            crossStyle: {
                                color: '#999'
                            }
                        },
                        formatter: function(params) { //自定义函数修改折线图给数据加单位
                            var str = ''; //声明一个变量用来存储数据
                            str += '<div>' + params[0].name + '</div>'; //显示日期的函数
                            for (var i = 0; i < params.length; i++) { //图显示的数据较多时需要循环数据，这样才可以成功的给多条数据添加单位
                                if (params[i].seriesIndex == 5) {
                                    str += '<div><span style="background:' + params[i].color + ';width:14px;height:14px;display:inline-block;margin-right:5px;position:relative;top:2px"></span><span>' + params[i].seriesName + '</span> : <span>' + (params[i].data != "NaN" ? params[i].data + 'h' : '0.00h') + '</span></div>';
                                } else {
                                    str += '<div><span style="background:' + params[i].color + ';width:14px;height:14px;display:inline-block;margin-right:5px;position:relative;top:2px"></span><span>' + params[i].seriesName + '</span> : <span>' + (params[i].data != "NaN" ? params[i].data + '%' : lang.Statement.ZanWu) + '</span></div>';
                                }
                            }
                            return str;
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
                        data: [lang.Statement.AllOpenTime, lang.Maintain.运行, lang.Maintain.空闲, lang.Maintain.调试, lang.Maintain.停机, lang.Maintain.关机],

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
                        },
                        axisLabel: {
                            formatter: function(value) {
                                var temp = ""; //每次截取的字符串
                                if (value != undefined) {
                                    var valueSplit = value.split(' ');
                                    for (let i = 0; i < valueSplit.length; i++) {
                                        if (i == 1) {
                                            temp += valueSplit[i] + "\n";
                                        } else {
                                            temp += valueSplit[i] + ' ';
                                        }
                                    }
                                    return temp;
                                }
                            }
                        }
                    }],
                    dataZoom: [{
                        type: "slider",
                        /*类型*/
                        xAxisIndex: 0,
                        /*对应的轴*/
                        bottom: "10",
                        height: flexibleHeight,
                        /*位置，定位*/
                        /*开始*/
                        startValue: 0,
                        endValue: 4,
                        // zoomLock: true,
                        /*结束*/
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
                            max: sumTimeMax,
                            position: 'right',
                            splitLine: {　　　　
                                show: false　　
                            },
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
                                show: true,
                                position: 'top',
                                formatter: (a) => {
                                    if ($(window).width() < 1300) {
                                        return formattingTimes(operationDataSum[a.dataIndex]) + Number(a.value).toFixed(0) + '%';
                                    } else if ($(window).width() < 1500) {
                                        return formattingTimes(operationDataSum[a.dataIndex]) + Number(a.value).toFixed(1) + '%';
                                    } else {
                                        return formattingTimes(operationDataSum[a.dataIndex]) + Number(a.value).toFixed(2) + '%';
                                    }
                                }
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
                                show: true,
                                position: 'top',
                                formatter: (a) => {
                                    if ($(window).width() < 1300) {
                                        return formattingTimes(leisureDataSum[a.dataIndex]) + Number(a.value).toFixed(0) + '%';
                                    } else if ($(window).width() < 1500) {
                                        return formattingTimes(leisureDataSum[a.dataIndex]) + Number(a.value).toFixed(1) + '%';
                                    } else {
                                        return formattingTimes(leisureDataSum[a.dataIndex]) + Number(a.value).toFixed(2) + '%';
                                    }
                                }
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
                                show: true,
                                position: 'top',
                                formatter: (a) => {
                                    if ($(window).width() < 1300) {
                                        return formattingTimes(debugDataSum[a.dataIndex]) + Number(a.value).toFixed(0) + '%';
                                    } else if ($(window).width() < 1500) {
                                        return formattingTimes(debugDataSum[a.dataIndex]) + Number(a.value).toFixed(1) + '%';
                                    } else {
                                        return formattingTimes(debugDataSum[a.dataIndex]) + Number(a.value).toFixed(2) + '%';
                                    }
                                }
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
                                show: true,
                                position: 'top',
                                formatter: (a) => {
                                    if ($(window).width() < 1300) {
                                        return formattingTimes(haltDataSum[a.dataIndex]) + Number(a.value).toFixed(0) + '%';
                                    } else if ($(window).width() < 1500) {
                                        return formattingTimes(haltDataSum[a.dataIndex]) + Number(a.value).toFixed(1) + '%';
                                    } else {
                                        return formattingTimes(haltDataSum[a.dataIndex]) + Number(a.value).toFixed(2) + '%';
                                    }
                                }
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
                                show: true,
                                position: 'top',
                                formatter: (a) => {
                                    if ($(window).width() < 1300) {
                                        return formattingTimes(shutdownDataSum[a.dataIndex]) + Number(a.value).toFixed(0) + '%';
                                    } else if ($(window).width() < 1500) {
                                        return formattingTimes(shutdownDataSum[a.dataIndex]) + Number(a.value).toFixed(1) + '%';
                                    } else {
                                        return formattingTimes(shutdownDataSum[a.dataIndex]) + Number(a.value).toFixed(2) + '%';
                                    }
                                }
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
                                position: 'top',
                                formatter: (a)=>{
                                    return formattingTimes(a.value*3600,'no');
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#948a54'
                                }
                            },
                        }
                    ]
                };
                myChart.setOption(option);
            })()
        },
    }
    $.fn.createElement = function(options) {
        ms.init(this, options);
    }
})(jQuery);