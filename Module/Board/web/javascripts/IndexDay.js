﻿(function($) {
    var ms = {
        init: function(totalsubpageTmep, args) {
            return (function() {
                // ms.createAllTable(totalsubpageTmep, args);
                // ms.createDataTable(totalsubpageTmep, args);
                ms.createEchart(totalsubpageTmep, args);
            })();
        },
        //生成第一个表 和  标题
        createAllTable: function(totalsubpageTmep, args) {
            return (function() {
                let elementAllTable = document.createElement('div');
                let AllTable = `<table class="table" border height="334" style="width: 100%;display:none">
						    <thead>
						    <tr>
						        <th style="background: #a6a6a6;">开始时间</th>
						        <th style="background: #a6a6a6;">结束时间</th>
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
					        <th style="text-align: center; position: -webkit-sticky;position: sticky; left: 0;background:#fff";>日期</th>
					    </tr>
					    </thead>
					    <tbody>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">总开机时间(h)</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff;display:none">稼动率</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">运行</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">空闲</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">调试</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">停机</th>
					    </tr>
					    <tr>
					        <th style="position: -webkit-sticky;position: sticky; left: 0;background:#fff">关机</th>
					    </tr>
					    </tbody>
					</table>`;
                elementDataTable.innerHTML = dataTable;
                let elementDataTableTbody = elementDataTable.getElementsByTagName('tbody')[0];
                for (let i = 0; i < args.facility.value.length; i++) {
                    //添加时间
                    $(elementDataTable.getElementsByTagName('thead')[0].getElementsByTagName('tr')[0]).append(`<th  style="text-align: center">${args.facility.value[i].time}</th>`)
                        //添加开机时间
                    $(elementDataTableTbody.getElementsByTagName('tr')[0]).append(`<td>${args.facility.value[i].sumtime}h</td>`)
                        //添加data
                    for (let j = 0; j < args.facility.value[i].data.length; j++) {
                        $(elementDataTableTbody.getElementsByTagName('tr')[j + 1]).append(`<td>${args.facility.value[i].data[j]}%</td>`)
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



            return (function() {
                let elementEchart = document.createElement('div');
                elementEchart.id = args.facility.echartsId;
                elementEchart.classList.add('lazyLoad');
                $(elementEchart).css({ "width": document.body.clientWidth + 'px', "height": args.facility.height + 'px', });
                let elementTitleDiv = document.createElement('li');
                let elementTitle = document.createElement('h3');
                elementTitle.classList.add('elementTitle');
                elementTitleDiv.classList.add('hiSlider-item');
                elementTitle.innerHTML = args.facility.elementTitle;
                $(elementTitleDiv).append(elementTitle);
                $(elementTitleDiv).append(elementEchart);
                $(totalsubpageTmep).append(elementTitleDiv);
                // var myChart = echarts.init(document.getElementById(args.facility.echartsId));
                var myChart = echarts.getInstanceByDom(document.getElementById(args.facility.echartsId));
                if (myChart === undefined) {
                    myChart = echarts.init(document.getElementById(args.facility.echartsId));
                }
                myChart.clear()
                let sumTimeMax = Math.max.apply(Array, sumTime);
                sumTimeMax = (sumTimeMax + sumTimeMax * 0.1).toFixed(0);
                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            crossStyle: {
                                color: '#fff'
                            }
                        },
                        formatter: function(params) { //自定义函数修改折线图给数据加单位
                            var str = ''; //声明一个变量用来存储数据
                            str += '<div>' + params[0].name + '</div>'; //显示日期的函数
                            for (var i = 0; i < params.length; i++) { //图显示的数据较多时需要循环数据，这样才可以成功的给多条数据添加单位
                                if (params[i].seriesIndex == 5) {
                                    str += '<div><span style="background:' + params[i].color + ';width:14px;height:14px;display:inline-block;margin-right:5px;position:relative;top:2px"></span><span>' + params[i].seriesName + '</span> : <span>' + (params[i].data ? params[i].data + 'h' : '暂无') + '</span></div>';
                                } else {
                                    str += '<div><span style="background:' + params[i].color + ';width:14px;height:14px;display:inline-block;margin-right:5px;position:relative;top:2px"></span><span>' + params[i].seriesName + '</span> : <span>' + (params[i].data ? params[i].data + '%' : '暂无') + '</span></div>';
                                }
                            }
                            return str;
                        }
                    },
                    grid: {
                        bottom: '12%',
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
                        data: ['总开机时间', '运行', '空闲', '调试', '停机', '关机'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    xAxis: [{
                        type: 'category',
                        data: xAxisData,
                        // name: '设     备',
                        // nameLocation: 'middle',
                        // nameTextStyle: {
                        //     fontSize: 18,
                        //     fontWeight: 600,
                        //     color: '#fff',
                        // },
                        // nameGap: 35,
                        axisPointer: {
                            type: 'shadow'
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#fff'
                            },
                            formatter: function(value) {
                                var temp = ""; //每次截取的字符串
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
                    }],
                    // dataZoom: [{
                    //     type: "slider",
                    //     /*类型*/
                    //     xAxisIndex: 0,
                    //     /*对应的轴*/
                    //     bottom: "10",
                    //     /*位置，定位*/
                    //     /*开始*/
                    //     startValue: 0,
                    //     endValue: 5,
                    //     height: 1,
                    //     showDataShadow: false,
                    //     // zoomLock: true,
                    //     /*结束*/
                    //     handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', // jshint ignore:line
                    //     // handleIcon: "M0,0 v9.7h5 v-9.7h-5 Z",
                    //     handleSize: 5,
                    //     /*手柄的形状
                    //     M = moveto
                    //     L = lineto
                    //     H = horizontal lineto
                    //     V = vertical lineto
                    //     C = curveto
                    //     S = smooth curveto
                    //     Q = quadratic Belzier curve
                    //     T = smooth quadratic Belzier curveto
                    //     A = elliptical Arc
                    //     Z = closepath
                    //     以上所有命令均允许小写字母。大写表示绝对定位，小写表示相对定位。
                    //     * */
                    //     handleStyle: { /*手柄的样式*/
                    //         // color: "#294b97",
                    //         // borderColor: "#5476c2"
                    //         shadowBlur: 6,
                    //         shadowOffsetX: 1,
                    //         shadowOffsetY: 2,
                    //         shadowColor: '#aaa'
                    //     },
                    //     backgroundColor: "#ccc",
                    //     /*背景 */
                    //     // dataBackground: { /*数据背景*/
                    //     //     lineStyle: {
                    //     //         color: "#dfdfdf"
                    //     //     },
                    //     //     areaStyle: {
                    //     //         color: "#dfdfdf"
                    //     //     }
                    //     // },
                    //     // fillerColor: "rgba(220,210,230,0.6)",
                    //     /*被start和end遮住的背景*/
                    //     labelFormatter: function(value, params) { /*拖动时两端的文字提示*/
                    //         return;
                    //     }
                    // }],
                    yAxis: [{
                            type: 'value',
                            name: '百分比（%）',
                            min: 0,
                            max: 110,
                            interval: 10,
                            nameTextStyle: {
                                color: '#ccc'
                            },
                            axisLabel: {
                                formatter: '{value} %',
                                textStyle: {
                                    color: '#fff'
                                }
                            }
                        },
                        {
                            type: 'value',
                            name: '小时（h）',
                            min: 0,
                            max: sumTimeMax,
                            position: 'right',
                            nameTextStyle: {
                                color: '#ccc'
                            },
                            splitLine: {　　　　
                                show: false　　
                            },
                            axisLabel: {
                                formatter: '{value} h',
                                textStyle: {
                                    color: '#fff'
                                }
                            }
                        },
                    ],
                    series: [{
                            name: '运行',
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
                            name: '空闲',
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
                            name: '调试',
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
                            name: '停机',
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
                            name: '关机',
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
                                        return formattingTimes(shutdownDataSum[a.dataIndex])+ Number(a.value).toFixed(2) + '%';
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
                            name: '总开机时间',
                            type: 'line',
                            yAxisIndex: 1,
                            data: sumTime,
                            label: {
                                show: true,
                                position: 'top',
                                color: '#fff',
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