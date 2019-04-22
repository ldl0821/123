function createState(opts) {
    let types = [
        { status: 1, name: '报警', color: '#f5280c' },
        { status: 2, name: '运行', color: '#4ecf1f' },
        { status: 3, name: '空闲', color: '#e6d215' },
        { status: 4, name: '关机', color: '#606765' },
        { status: 5, name: '调试', color: '#1b24f7' }
    ];
    $('#state').append(`<ul id='stateChild' class='status_list' style='width:100%;height:100%;bottom:0;margin-top:20px'><ul></ul></ul>`);
    let PostAjaxDataDivide = lh_dataAll.webSeverData.Data.GetAllMachineList.length / opts.eleSum;
    PostAjaxDataDivide = Math.ceil(PostAjaxDataDivide);
    for (let m = 0; m < PostAjaxDataDivide; m++) {
        let $owncreateState = $(`<div class='owncreateState${m} owncreateState'></div>`);
        //判断是第一个添加active的class
        if (m == 0) {
            var $owncreateStateUl = $(`<li class='owncreateStateUl${m} activeLi'></li>`);
        } else {
            var $owncreateStateUl = $(`<li class='owncreateStateUl${m}'></li>`);
        }
        let PostAjaxData = '';
        for (let i = 0, len = lh_dataAll.webSeverData.Data.GetAllMachineList.length; i < opts.eleSum; i++) {
            if ((m * opts.eleSum) + i < lh_dataAll.webSeverData.Data.GetAllMachineList.length) {
                PostAjaxData += lh_dataAll.webSeverData.Data.GetAllMachineList[(m * opts.eleSum) + i].MAC_NBR + ',';
            } else {
                PostAjaxData = PostAjaxData;
            }
        }
        var step = lh_dataAll.webSeverData.Data.GetAllMachineList.length;
        PostAjaxData = PostAjaxData.substr(0, PostAjaxData.length - 1);
        let startTime = moment().format('YYYY-MM-DD 00:00:00');
        let endTime = moment().format('YYYY-MM-DD HH:mm:ss');
        //添加两个元素  1个是下面的圆点 一个是图表元素
        $('.status_list').append($owncreateState);
        $('.status_list>ul').append($owncreateStateUl);
        GetValue(startTime, endTime, PostAjaxData, `.owncreateState${m}`);
    }
    //轮播小组件
    $.slider({
        imgElement: $('.owncreateState'),
        liElement: $('.status_list>ul>li'),
        activeClass: 'activeLi',
        time: opts.carouselTime,
        activeLiShow: opts.activeLiShow
    });
    //修改点的位置
    $('.status_list>ul').css({
        'top': (document.body.clientHeight - 80) + 'px'
    });


    function GetValue(BEGIN_DATE, END_DATE, id, father) {
        var data = {
            BEGIN_DATE: BEGIN_DATE,
            END_DATE: END_DATE,
            MACRS: id
        }
        $.post('/statusrate/r/GetStatusList', data, function(result) {
            var mac_temp = id.split(',');
            for (let index = 0; index < step; index++) {
                if (mac_temp.length < index) {
                    // $('.status_list').append(`<div class='lazyLoad' style='display:none'></div>`);
                } else {
                    var temp = _.where(result.Data, { 'MAC_NBR': +mac_temp[index] });
                    if (temp.length > 0) {
                        $(father).append(`<div id='mac_${temp[0].MAC_NBR}' class='lazyLoad' style='width:${document.body.clientWidth/lh_dataAll.quantity}px;height:${opts.eleHeight}px;'></div>`);
                        drawline(`mac_${temp[0].MAC_NBR}`, temp[0], BEGIN_DATE);
                    } else {
                        // $('.status_list').append(`<div class='lazyLoad' style='display:none'></div>`);
                    }
                }
            }
            // for (var i = 0; i < result.Data.length; i++) {
            //     $('.status_list').append(`<div id='mac_${result.Data[i].MAC_NBR}' class='lazyLoad' style='height:300px'></div>`);
            //     drawline(`mac_${result.Data[i].MAC_NBR}`, result.Data[i], BEGIN_DATE);
            // }
        })
    }

    function renderItem(params, api) {
        var categoryIndex = api.value(0);
        var start = api.coord([api.value(1), categoryIndex]);
        var end = api.coord([api.value(2), categoryIndex]);
        var height = api.size([0, 1])[1] * 0.6;
        return {
            type: 'rect',
            shape: echarts.graphic.clipRectByRect({
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height
            }, {
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height
            }),
            style: api.style()
        };
    }
    let drawline = (ele, data, BEGIN_DATE) => {
        let series = [];
        let dom = document.getElementById(ele);
        let myChart = echarts.init(dom);
        let app = {};
        let startTime = +moment(BEGIN_DATE).format('X') * 1000;
        let categories = ['状态'];
        // Generate mock data
        echarts.util.each(categories, function(category, index) {
            var baseTime = startTime;
            if(data.status == null){
                return;
            }
            for (var i = 0; i < data.status.length; i++) {
                var typeItem = _.where(types, { 'status': data.status[i].sr })[0];
                var duration = data.status[i].dr * 1000;
                var baseTime = +moment(data.status[i].st).format('X') * 1000;
                series.push({
                    name: typeItem.name,
                    value: [
                        index,
                        baseTime,
                        baseTime += duration,
                        duration
                    ],
                    itemStyle: {
                        normal: {
                            color: typeItem.color
                        }
                    }
                });
                //baseTime += Math.round(Math.random() * 2000);
            }
        });



        option = {
            tooltip: {
                formatter: function(params) {
                    return params.marker + params.data.name + params.name + ': ' + params.value[3] / 1000 + 's' + '<br />' + '开始时间' +
                        moment(params.value[1]).format('HH:mm:ss') + '<br />' + '结束时间' + moment(params.value[2]).format('HH:mm:ss');
                }
            },
            title: {
                subtext: BEGIN_DATE,
                textStyle: {
                    color: '#fff'
                },
                text: (data.CODE_NO == 'DEFAULT' || data.CODE_NO == '' ? '' : data.CODE_NO + '-') + data.CATEGORY + '-' + data.mac_name + '-' + data.mac_no,
                // text:data.CATEGORY + '-' + data.mac_name + '-' + data.mac_no,
                left: 'center'
            },
            legend: {
                data: ['bar', 'error']
            },
            // dataZoom: [{
            //     start: 0,
            //     end: 99.999,
            //     type: 'slider',
            //     filterMode: 'weakFilter',
            //     showDataShadow: false,
            //     top: 200,
            //     height: 10,
            //     borderColor: 'transparent',
            //     backgroundColor: '#e2e2e2',
            //     handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', // jshint ignore:line
            //     handleSize: 20,
            //     handleStyle: {
            //         shadowBlur: 6,
            //         shadowOffsetX: 1,
            //         shadowOffsetY: 2,
            //         shadowColor: '#aaa'
            //     },
            //     labelFormatter: ''
            // }, {
            //     type: 'inside',
            //     filterMode: 'weakFilter'
            // }],
            grid: {
                height: 100
            },
            xAxis: {
                min: startTime,
                scale: true,
                axisLabel: {
                    formatter: function(val) {
                        return moment(val).format('HH:mm');
                    },
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            yAxis: {
                data: categories,
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            series: [{
                type: 'custom',
                renderItem: renderItem,
                itemStyle: {
                    normal: {
                        opacity: 1
                    }
                },
                encode: {
                    x: [1, 2],
                    y: 0
                },
                data: series
            }]
        };
        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    }
}